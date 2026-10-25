"use strict";

// Каталог материалов. Пути можно заменить на реальные фотографии без изменений логики.
const catalog = {
  baseMaterials: [
    { id: "m1", name: "Материал 1", texture: "assets/materials/m1.jpg" },
    { id: "m2", name: "Материал 2", texture: "assets/materials/m2.jpg" },
    { id: "m3", name: "Материал 3", texture: "assets/materials/m3.jpg" },
    { id: "m4", name: "Материал 4", texture: "assets/materials/m4.jpg" }
  ],
  topCategories: [
    { id: "eva", name: "EVA", colors: [{ id: "eva_black", name: "Черный", icon: "assets/layers/eva_black.jpg" }] },
    { id: "fishing-line", name: "Леска", colors: [] },
    { id: "sponge", name: "Губка", colors: [] }
  ]
};

const selection = { baseId: null, topId: null };
const screens = [...document.querySelectorAll(".screen")];
const baseContainer = document.getElementById("baseMaterials");
const topContainer = document.getElementById("topMaterials");
const resultButton = document.getElementById("showResult");

function showScreen(id) {
  const current = document.querySelector(".screen.active");
  const next = document.getElementById(id);
  if (!next || current === next) return;
  current?.classList.add("leaving");
  next.classList.add("active");
  window.setTimeout(() => current?.classList.remove("active", "leaving"), 380);
  next.scrollTop = 0;
}

function renderBaseMaterials() {
  baseContainer.innerHTML = catalog.baseMaterials.map((item) => `
    <button class="material-card" type="button" data-base-id="${item.id}" aria-pressed="false">
      <span class="material-image"><img src="${item.texture}" alt="" loading="lazy"><span class="material-number">${item.id.toUpperCase()}</span></span>
      <span class="material-name">${item.name}</span><span class="selection-check" aria-hidden="true">✓</span>
    </button>`).join("");
}

function renderTopMaterials() {
  topContainer.innerHTML = catalog.topCategories.map((category) => `
    <section class="category-card" aria-labelledby="category-${category.id}">
      <header class="category-header"><h3 id="category-${category.id}">${category.name}</h3><span>${category.colors.length ? `${String(category.colors.length).padStart(2, "0")} ЦВЕТ` : "СКОРО"}</span></header>
      <div class="category-body">${category.colors.length ? category.colors.map((color) => `
        <button class="color-option" type="button" data-top-id="${color.id}" aria-pressed="false">
          <span class="color-swatch"><img src="${color.icon}" alt="" loading="lazy"></span><span>${color.name}</span>
        </button>`).join("") : `<span class="coming-soon">Цвета скоро появятся</span>`}</div>
    </section>`).join("");
}

function updateSelection() {
  document.querySelectorAll("[data-base-id]").forEach((card) => {
    const chosen = card.dataset.baseId === selection.baseId;
    card.classList.toggle("selected", chosen);
    card.setAttribute("aria-pressed", String(chosen));
  });
  document.querySelectorAll("[data-top-id]").forEach((option) => {
    const chosen = option.dataset.topId === selection.topId;
    option.classList.toggle("selected", chosen);
    option.setAttribute("aria-pressed", String(chosen));
  });
  resultButton.disabled = !(selection.baseId && selection.topId);
}

function getSelectedNames() {
  const base = catalog.baseMaterials.find((item) => item.id === selection.baseId);
  const top = catalog.topCategories.flatMap((category) => category.colors).find((color) => color.id === selection.topId);
  return { base: base?.name ?? "Основа", top: top?.name ?? "Верхний слой" };
}

function showResult() {
  if (!(selection.baseId && selection.topId)) return;
  const image = document.getElementById("resultImage");
  const fallback = document.getElementById("imageFallback");
  const caption = document.getElementById("resultCaption");
  const names = getSelectedNames();
  image.classList.remove("loaded");
  fallback.hidden = false;
  image.onload = () => { image.classList.add("loaded"); fallback.hidden = true; };
  image.onerror = () => { image.classList.remove("loaded"); fallback.hidden = false; };
  image.src = `assets/results/${selection.baseId}_${selection.topId}.jpg`;
  image.alt = `${names.base}, верхний коврик: ${names.top}`;
  caption.textContent = `${names.base.toUpperCase()}  ·  ${names.top.toUpperCase()}`;
  showScreen("resultScreen");
}

document.getElementById("openConfigurator").addEventListener("click", () => showScreen("configuratorScreen"));
document.getElementById("backHome").addEventListener("click", () => showScreen("homeScreen"));
document.getElementById("editParameters").addEventListener("click", () => showScreen("configuratorScreen"));
document.getElementById("editParametersBottom").addEventListener("click", () => showScreen("configuratorScreen"));
resultButton.addEventListener("click", showResult);
baseContainer.addEventListener("click", (event) => {
  const card = event.target.closest("[data-base-id]");
  if (!card) return;
  selection.baseId = card.dataset.baseId;
  updateSelection();
});
topContainer.addEventListener("click", (event) => {
  const option = event.target.closest("[data-top-id]");
  if (!option) return;
  selection.topId = option.dataset.topId;
  updateSelection();
});

renderBaseMaterials();
renderTopMaterials();
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
}
