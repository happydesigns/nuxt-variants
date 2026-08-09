import { existsSync, readFileSync, statSync } from "node:fs";
import { join, normalize, sep } from "node:path";
import { createError, defineEventHandler, getRequestURL, setHeader } from "h3";
import { useRuntimeConfig } from "#imports";

const routeBase = "/__nuxt-variants/devtools";

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function getContentType(path: string): string {
  const extension = path.slice(path.lastIndexOf("."));
  return contentTypes[extension] ?? "application/octet-stream";
}

export default defineEventHandler((event) => {
  const clientRoot = useRuntimeConfig(event).variantDevtoolsClientPath;

  if (typeof clientRoot !== "string" || !clientRoot) {
    throw createError({
      statusCode: 404,
      statusMessage: "Nuxt Variants DevTools client is not available.",
    });
  }

  const { pathname } = getRequestURL(event);
  const decodedPathname = decodeURIComponent(pathname);
  const routeIndex = decodedPathname.indexOf(routeBase);
  if (routeIndex === -1) {
    throw createError({ statusCode: 404, statusMessage: "DevTools route not found." });
  }

  const publicRouteBase = decodedPathname.slice(0, routeIndex + routeBase.length);
  const routePath = decodedPathname.slice(routeIndex + routeBase.length);
  const requestedPath = routePath.replace(/^\/+/, "") || "index.html";
  const filePath = normalize(
    join(clientRoot, requestedPath.endsWith("/") ? `${requestedPath}index.html` : requestedPath),
  );
  const normalizedRoot = normalize(clientRoot);

  if (filePath !== normalizedRoot && !filePath.startsWith(`${normalizedRoot}${sep}`)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid DevTools asset path." });
  }

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    throw createError({ statusCode: 404, statusMessage: "DevTools asset not found." });
  }

  setHeader(event, "content-type", getContentType(filePath));
  const content = readFileSync(filePath);

  if (requestedPath === "index.html") {
    return content.toString("utf8").replaceAll(`${routeBase}/`, `${publicRouteBase}/`);
  }

  return content;
});
