import { defineEventHandler, setHeader } from "h3";
import { useRuntimeConfig } from "#imports";

function escapeJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default defineEventHandler((event) => {
  setHeader(event, "content-type", "text/html; charset=utf-8");
  const devtoolsData = useRuntimeConfig(event).variantDevtoolsData ?? {};

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Nuxt Variants DevTools</title>
  <style>
    :root {
      color-scheme: dark light;
      --bg: #0f1117;
      --panel: #171a22;
      --panel-2: #1f2430;
      --border: #303642;
      --text: #f2f5f8;
      --muted: #9ca3af;
      --accent: #00dc82;
      --warning: #fbbf24;
      --danger: #fb7185;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px;
    }
    button, select {
      font: inherit;
    }
    .shell {
      min-height: 100vh;
      display: grid;
      grid-template-columns: minmax(15rem, 20rem) 1fr;
    }
    .sidebar {
      border-right: 1px solid var(--border);
      background: var(--panel);
      min-height: 100vh;
      overflow: auto;
    }
    .header {
      padding: 18px;
      border-bottom: 1px solid var(--border);
    }
    .eyebrow {
      color: var(--accent);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    h1, h2, h3, p {
      margin: 0;
    }
    h1 {
      font-size: 20px;
      line-height: 1.2;
    }
    h2 {
      font-size: 15px;
      margin-bottom: 10px;
    }
    h3 {
      font-size: 13px;
      color: var(--muted);
      margin-bottom: 8px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      padding: 12px;
      border-bottom: 1px solid var(--border);
    }
    .metric {
      background: var(--panel-2);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px;
    }
    .metric strong {
      display: block;
      font-size: 18px;
      line-height: 1;
      margin-bottom: 4px;
    }
    .metric span {
      color: var(--muted);
      font-size: 11px;
    }
    .variant-list {
      padding: 8px;
      display: grid;
      gap: 4px;
    }
    .variant-button {
      width: 100%;
      color: var(--text);
      background: transparent;
      border: 1px solid transparent;
      border-radius: 6px;
      text-align: left;
      padding: 10px;
      cursor: pointer;
    }
    .variant-button:hover,
    .variant-button.active {
      background: var(--panel-2);
      border-color: var(--border);
    }
    .variant-button.active {
      border-color: color-mix(in srgb, var(--accent) 55%, var(--border));
    }
    .variant-name {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .variant-meta {
      color: var(--muted);
      font-size: 12px;
    }
    main {
      min-width: 0;
      overflow: auto;
    }
    .content {
      padding: 18px;
      display: grid;
      gap: 14px;
      max-width: 1120px;
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }
    .select {
      color: var(--text);
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px 10px;
      min-width: 14rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }
    .panel {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      min-width: 0;
      overflow: hidden;
    }
    .panel-head {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      background: var(--panel-2);
    }
    .panel-body {
      padding: 14px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 4px 8px;
      color: var(--muted);
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 12px;
    }
    .chip.active {
      color: var(--accent);
      border-color: color-mix(in srgb, var(--accent) 50%, var(--border));
    }
    .diagnostic {
      border: 1px solid color-mix(in srgb, var(--warning) 45%, var(--border));
      color: var(--warning);
      background: color-mix(in srgb, var(--warning) 10%, transparent);
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 8px;
    }
    pre {
      margin: 0;
      overflow: auto;
      max-height: 26rem;
      padding: 12px;
      border-radius: 6px;
      background: #080a0f;
      color: #d1d5db;
      font-size: 12px;
      line-height: 1.5;
    }
    .empty {
      color: var(--muted);
    }
    @media (max-width: 820px) {
      .shell { grid-template-columns: 1fr; }
      .sidebar { min-height: auto; border-right: 0; }
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <script id="variant-data" type="application/json">${escapeJson(devtoolsData)}</script>
  <div class="shell">
    <aside class="sidebar">
      <div class="header">
        <div class="eyebrow">Nuxt Variants</div>
        <h1>Variant graph</h1>
      </div>
      <div class="summary" id="summary"></div>
      <div class="variant-list" id="variant-list"></div>
    </aside>
    <main>
      <div class="content">
        <div class="toolbar">
          <select class="select" id="variant-select" aria-label="Variant"></select>
        </div>
        <section class="panel">
          <div class="panel-head"><h2 id="selected-title">Variant</h2></div>
          <div class="panel-body grid">
            <div>
              <h3>Extends</h3>
              <div class="chips" id="extends"></div>
            </div>
            <div>
              <h3>Active Features</h3>
              <div class="chips" id="features"></div>
            </div>
          </div>
        </section>
        <section class="grid">
          <div class="panel">
            <div class="panel-head"><h2>Resolved Config</h2></div>
            <div class="panel-body"><pre id="resolved"></pre></div>
          </div>
          <div class="panel">
            <div class="panel-head"><h2>Config Layers</h2></div>
            <div class="panel-body"><pre id="layers"></pre></div>
          </div>
        </section>
        <section class="panel">
          <div class="panel-head"><h2>Diagnostics</h2></div>
          <div class="panel-body" id="diagnostics"></div>
        </section>
      </div>
    </main>
  </div>
  <script>
    const data = JSON.parse(document.getElementById('variant-data').textContent)
    let selected = data.variants[0]?.name
    const byName = new Map(data.variants.map(variant => [variant.name, variant]))
    const format = value => JSON.stringify(value, null, 2)
    const chip = (value, active = false) => {
      const span = document.createElement('span')
      span.className = active ? 'chip active' : 'chip'
      span.textContent = value
      return span
    }
    const fillChips = (node, values, active = false) => {
      node.replaceChildren()
      if (!values.length) {
        const empty = document.createElement('span')
        empty.className = 'empty'
        empty.textContent = 'None'
        node.append(empty)
        return
      }
      for (const value of values) node.append(chip(value, active))
    }
    const renderSummary = () => {
      document.getElementById('summary').replaceChildren(
        metric(data.variants.length, 'variants'),
        metric(Object.keys(data.graph).length, 'graph nodes'),
        metric(data.diagnostics.length, 'diagnostics'),
      )
    }
    const metric = (value, label) => {
      const element = document.createElement('div')
      element.className = 'metric'
      const strong = document.createElement('strong')
      strong.textContent = value
      const caption = document.createElement('span')
      caption.textContent = label
      element.append(strong, caption)
      return element
    }
    const renderList = () => {
      const list = document.getElementById('variant-list')
      const select = document.getElementById('variant-select')
      list.replaceChildren()
      select.replaceChildren()
      for (const variant of data.variants) {
        const button = document.createElement('button')
        button.className = variant.name === selected ? 'variant-button active' : 'variant-button'
        button.type = 'button'
        const name = document.createElement('div')
        name.className = 'variant-name'
        const nameText = document.createElement('span')
        nameText.textContent = variant.name
        const parentCount = document.createElement('span')
        parentCount.textContent = variant.extends.length
        name.append(nameText, parentCount)
        const meta = document.createElement('div')
        meta.className = 'variant-meta'
        meta.textContent = variant.configKeys.length + ' config keys'
        button.append(name, meta)
        button.addEventListener('click', () => {
          selected = variant.name
          render()
        })
        list.append(button)
        const option = document.createElement('option')
        option.value = variant.name
        option.textContent = variant.name
        option.selected = variant.name === selected
        select.append(option)
      }
    }
    const renderDiagnostics = () => {
      const node = document.getElementById('diagnostics')
      node.replaceChildren()
      if (!data.diagnostics.length) {
        const empty = document.createElement('p')
        empty.className = 'empty'
        empty.textContent = 'No diagnostics.'
        node.append(empty)
        return
      }
      for (const diagnostic of data.diagnostics) {
        const item = document.createElement('div')
        item.className = 'diagnostic'
        item.textContent = diagnostic.message
        node.append(item)
      }
    }
    const renderDetails = () => {
      const variant = byName.get(selected)
      document.getElementById('selected-title').textContent = variant ? variant.name : 'Variant'
      fillChips(document.getElementById('extends'), variant?.extends ?? [])
      fillChips(document.getElementById('features'), variant?.activeFeatures ?? [], true)
      document.getElementById('resolved').textContent = format(variant?.resolvedConfig ?? {})
      document.getElementById('layers').textContent = format({
        base: variant?.base,
        app: variant?.app,
      })
    }
    const render = () => {
      renderSummary()
      renderList()
      renderDetails()
      renderDiagnostics()
    }
    document.getElementById('variant-select').addEventListener('change', event => {
      selected = event.target.value
      render()
    })
    render()
  </script>
</body>
</html>`;
});
