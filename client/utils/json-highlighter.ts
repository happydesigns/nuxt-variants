import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import json from "shiki/langs/json.mjs";
import light from "shiki/themes/github-light.mjs";
import dark from "shiki/themes/github-dark.mjs";

const highlighter = createHighlighterCoreSync({
  langs: [json],
  themes: [light, dark],
  engine: createJavaScriptRegexEngine(),
});

export function highlightJson(code: string) {
  return highlighter.codeToTokens(code, {
    lang: "json",
    themes: { light: light.name, dark: dark.name },
    defaultColor: "light-dark()",
  }).tokens;
}
