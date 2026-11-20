import { describe, expect, it, vi } from "vitest";
import { publishRelease, releaseFromSource } from "../../scripts/github-release.mjs";

const version = "1.2.3";
const tag = `v${version}`;
const subject = `chore(release): ${tag}`;
const changelog = `# Changelog\n\n## ${tag}\n\n- Verify the package.\n`;
const release = { tag, notes: "- Verify the package.", prerelease: false };

describe("GitHub release source", () => {
  it("uses the matching changelog entry", () => {
    expect(releaseFromSource(tag, version, subject, changelog)).toEqual(release);
  });

  it("recognizes prerelease tags", () => {
    const rc = `${version}-rc.1`;
    const rcTag = `v${rc}`;
    expect(
      releaseFromSource(rcTag, rc, `chore(release): ${rcTag}`, changelog.replace(tag, rcTag)),
    ).toEqual({ ...release, tag: rcTag, prerelease: true });
  });

  it("requires the manifest, tag, release commit, and notes to agree", () => {
    expect(() => releaseFromSource("v0.0.0", version, subject, changelog)).toThrow(/tag/);
    expect(() => releaseFromSource(tag, version, "fix: unrelated", changelog)).toThrow(/commit/);
    expect(() => releaseFromSource(tag, version, subject, "# Changelog\n")).toThrow(/changelog/);
  });
});

describe("GitHub release publication", () => {
  it("creates a release from a remote tag and uses the supplied notes", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(Response.json({}))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(Response.json({}));
    await publishRelease(release, "owner/repo", "test-token", request);
    const [url, options] = request.mock.calls[2];
    expect(url).toBe("https://api.github.com/repos/owner/repo/releases");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toMatchObject({
      tag_name: tag,
      body: release.notes,
      prerelease: false,
      make_latest: "legacy",
    });
  });

  it("leaves an existing release alone on rerun", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(Response.json({}))
      .mockResolvedValueOnce(Response.json({ draft: false }));
    await expect(publishRelease(release, "owner/repo", "test-token", request)).resolves.toBe(
      "Release already published.",
    );
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("cannot create an implicit tag", async () => {
    const request = vi.fn().mockResolvedValueOnce(new Response(null, { status: 404 }));
    await expect(publishRelease(release, "owner/repo", "test-token", request)).rejects.toThrow(
      /tag lookup failed/,
    );
    expect(request).toHaveBeenCalledTimes(1);
  });
});
