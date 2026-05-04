const app = document.getElementById("app");

let data = {
  configKey: "variants",
  variants: [],
  graph: {},
  diagnostics: [],
};
let selected;

function format(value) {
  return JSON.stringify(value, null, 2);
}

function chip(value, active = false) {
  const span = document.createElement("span");
  span.className = active ? "chip active" : "chip";
  span.textContent = value;
  return span;
}

function fillChips(node, values, active = false) {
  node.replaceChildren();
  if (!values.length) {
    const empty = document.createElement("span");
    empty.className = "empty";
    empty.textContent = "None";
    node.append(empty);
    return;
  }

  for (const value of values) node.append(chip(value, active));
}

function metric(value, label) {
  const element = document.createElement("div");
  element.className = "metric";
  const strong = document.createElement("strong");
  strong.textContent = value;
  const caption = document.createElement("span");
  caption.textContent = label;
  element.append(strong, caption);
  return element;
}

function renderShell() {
  app.replaceChildren();

  const shell = document.createElement("div");
  shell.className = "shell";
  shell.innerHTML = `
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
  `;

  app.append(shell);
  document.getElementById("variant-select").addEventListener("change", (event) => {
    selected = event.target.value;
    render();
  });
}

function renderSummary() {
  document
    .getElementById("summary")
    .replaceChildren(
      metric(data.variants.length, "variants"),
      metric(Object.keys(data.graph).length, "graph nodes"),
      metric(data.diagnostics.length, "diagnostics"),
    );
}

function renderList() {
  const list = document.getElementById("variant-list");
  const select = document.getElementById("variant-select");
  list.replaceChildren();
  select.replaceChildren();

  for (const variant of data.variants) {
    const button = document.createElement("button");
    button.className = variant.name === selected ? "variant-button active" : "variant-button";
    button.type = "button";

    const name = document.createElement("div");
    name.className = "variant-name";
    const nameText = document.createElement("span");
    nameText.textContent = variant.name;
    const parentCount = document.createElement("span");
    parentCount.textContent = variant.extends.length;
    name.append(nameText, parentCount);

    const meta = document.createElement("div");
    meta.className = "variant-meta";
    meta.textContent = `${variant.configKeys.length} config keys`;
    button.append(name, meta);
    button.addEventListener("click", () => {
      selected = variant.name;
      render();
    });
    list.append(button);

    const option = document.createElement("option");
    option.value = variant.name;
    option.textContent = variant.name;
    option.selected = variant.name === selected;
    select.append(option);
  }
}

function renderDiagnostics() {
  const node = document.getElementById("diagnostics");
  node.replaceChildren();

  if (!data.diagnostics.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No diagnostics.";
    node.append(empty);
    return;
  }

  for (const diagnostic of data.diagnostics) {
    const item = document.createElement("div");
    item.className = "diagnostic";
    item.textContent = diagnostic.message;
    node.append(item);
  }
}

function renderDetails() {
  const byName = new Map(data.variants.map((variant) => [variant.name, variant]));
  const variant = byName.get(selected);

  document.getElementById("selected-title").textContent = variant ? variant.name : "Variant";
  fillChips(document.getElementById("extends"), variant?.extends ?? []);
  fillChips(document.getElementById("features"), variant?.activeFeatures ?? [], true);
  document.getElementById("resolved").textContent = format(variant?.resolvedConfig ?? {});
  document.getElementById("layers").textContent = format({
    base: variant?.base,
    app: variant?.app,
  });
}

function render() {
  renderSummary();
  renderList();
  renderDetails();
  renderDiagnostics();
}

async function boot() {
  renderShell();
  const response = await fetch("/__nuxt-variants/devtools/data.json");
  data = await response.json();
  selected = data.variants[0]?.name;
  render();
}

boot().catch((error) => {
  app.textContent = `Failed to load Nuxt Variants DevTools: ${error.message}`;
});
