import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { parseChangelogMarkdown } from "changelogen";

export function releaseFromSource(tag, version, subject, changelog) {
  if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version) || tag !== `v${version}`)
    throw new Error("Release tag must match package.json version.");
  if (subject !== `chore(release): ${tag}`)
    throw new Error("Release tag must identify the Changelogen release commit.");

  const entry = parseChangelogMarkdown(changelog).releases.find(
    (entry) => entry.version === version,
  );
  if (!entry?.body?.trim())
    throw new Error("Release requires a matching, non-empty changelog entry.");
  return { tag, notes: entry.body, prerelease: version.includes("-") };
}

export async function publishRelease(release, repository, token, request = fetch) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository) || !token)
    throw new Error("GitHub repository and token are required.");
  const api = `https://api.github.com/repos/${repository}`;
  const call = (path, options = {}) =>
    request(`${api}${path}`, {
      ...options,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(15_000),
    });

  const tag = encodeURIComponent(release.tag);
  // The release API can create a missing tag implicitly.
  const remoteRef = await call(`/git/ref/tags/${tag}`);
  if (!remoteRef.ok) throw new Error(`Release tag lookup failed (HTTP ${remoteRef.status}).`);
  const lookup = await call(`/releases/tags/${tag}`);
  if (!lookup.ok && lookup.status !== 404)
    throw new Error(`Release lookup failed (HTTP ${lookup.status}).`);
  const existing = lookup.ok ? await lookup.json() : undefined;
  if (existing && !existing.draft) return "Release already published.";

  const response = await call(existing ? `/releases/${existing.id}` : "/releases", {
    method: existing ? "PATCH" : "POST",
    body: JSON.stringify({
      tag_name: release.tag,
      name: release.tag,
      body: release.notes,
      draft: false,
      prerelease: release.prerelease,
      make_latest: release.prerelease ? "false" : "legacy",
    }),
  });
  if (!response.ok) throw new Error(`GitHub release publication failed (HTTP ${response.status}).`);
  return `Published ${release.tag} on GitHub.`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const mode = process.argv[2];
  if (mode !== "--check" && mode !== "--publish")
    throw new Error("Use --check locally or --publish in tag CI.");
  if (mode === "--publish" && process.env.GITHUB_REF_TYPE !== "tag")
    throw new Error("Publication requires a tag-triggered workflow.");

  const version = JSON.parse(readFileSync("package.json", "utf8")).version;
  const tag = process.env.GITHUB_REF_NAME || `v${version}`;
  const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
  const release = releaseFromSource(
    tag,
    version,
    git("log", "-1", "--format=%s"),
    readFileSync("CHANGELOG.md", "utf8"),
  );
  if (git("rev-parse", `refs/tags/${tag}^{commit}`) !== git("rev-parse", "HEAD"))
    throw new Error("Release tag must identify the checked-out commit.");

  console.log(
    mode === "--publish"
      ? await publishRelease(release, process.env.GITHUB_REPOSITORY, process.env.GITHUB_TOKEN)
      : `Validated ${tag}: package, commit, tag and changelog agree.`,
  );
}
