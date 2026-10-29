"use strict";

// Каталог материалов. Пути можно заменить на реальные фотографии без изменений логики.
const catalog = {
  baseCategories: [
    {
      id: "standard",
      name: "Обычные материалы",
      materials: [
        { id: "m1", name: "Материал 1", texture: "assets/materials/m1.jpg" },
        { id: "m2", name: "Материал 2", texture: "assets/materials/m2.jpg" },
        { id: "m3", name: "Материал 3", texture: "assets/materials/m3.jpg" },
        { id: "m4", name: "Материал 4", texture: "assets/materials/m4.jpg" },
        { id: "m5", name: "Материал 5", texture: "assets/materials/m5.jpg" },
        { id: "m6", name: "Материал 6", texture: "assets/materials/m6.jpg" },
        { id: "m7", name: "Материал 7", texture: "assets/materials/m7.jpg" },
        { id: "m8", name: "Материал 8", texture: "assets/materials/m8.jpg" }
        
      ]
    },
    {
      id: "crocodile",
      name: "Крокодил",
      materialFilePattern: "mc{n}.jpg",
      resultIdPattern: "mc{n}",
      count: 2,
      materials: [
      ]
    },
    {
      id: "360",
      name: "360 полик",
      materialFilePattern: "m360_{n}.jpg",
      resultIdPattern: "m360_{n}",
      count: 0,
      materials: []
    }
  ],
  topCategories: [
    { id: "eva", name: "EVA", colors: [{ id: "eva_black", name: "Черный", icon: "assets/layers/eva_black.jpg" }] },
    { id: "fishing-line", name: "Леска", colors: [ {id: "leska_black", name: "Черный", icon: "assets/layers/leska_black.jpg"}] },
    { id: "sponge", name: "Губка", colors: [] }
  ]
};

const selection = { baseId: null, topId: null };
let activeBaseCategoryId = catalog.baseCategories[0].id;
const materialTabs = document.getElementById("materialTabs");
const baseContainer = document.getElementById("baseMaterials");
const topContainer = document.getElementById("topMaterials");
const resultButton = document.getElementById("showResult");

// Генерирует список по шаблону категории. Укажите count, когда будут готовы файлы.
function generateCategoryMaterials(category) {
  return Array.from({ length: category.count ?? 0 }, (_, index) => {
    const number = index + 1;
    const materialId = category.resultIdPattern.replace("{n}", number);
    const textureFile = category.materialFilePattern.replace("{n}", number);
    return {
      id: materialId,
      name: `${category.name} ${number}`,
      texture: `assets/materials/${textureFile}`
    };
  });
}

catalog.baseCategories.forEach((category) => {
  if (category.materialFilePattern && category.resultIdPattern) {
    category.materials = generateCategoryMaterials(category);
  }
});

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
  const category = catalog.baseCategories.find((item) => item.id === activeBaseCategoryId);
  materialTabs.innerHTML = catalog.baseCategories.map((item) => `
    <button class="material-tab${item.id === activeBaseCategoryId ? " active" : ""}" type="button" data-category-id="${item.id}" aria-pressed="${item.id === activeBaseCategoryId}">${item.name}</button>`).join("");

  if (!category?.materials.length) {
    baseContainer.classList.add("is-empty");
    baseContainer.innerHTML = `<div class="materials-empty">Материалы этого раздела скоро появятся</div>`;
    return;
  }

  baseContainer.classList.remove("is-empty");
  baseContainer.innerHTML = category.materials.map((item) => `
    <button class="material-card" type="button" data-base-id="${item.id}" aria-pressed="false">
      <span class="material-image"><img src="${item.texture}" alt="" loading="lazy"><span class="material-number">${item.id.toUpperCase()}</span></span>
      <span class="material-name">${item.name}</span><span class="selection-check" aria-hidden="true">✓</span>
    </button>`).join("");
  updateSelection();
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
  const base = catalog.baseCategories.flatMap((category) => category.materials).find((item) => item.id === selection.baseId);
  const top = catalog.topCategories.flatMap((category) => category.colors).find((color) => color.id === selection.topId);
  return { base: base?.name ?? "Основа", top: top?.name ?? "Верхний слой" };
}

function getResultImagePath() {
  // Например: mc1 + eva_black -> assets/results/mc1_eva_black.jpg
  return `assets/results/${selection.baseId}_${selection.topId}.jpg`;
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
  image.src = getResultImagePath();
  image.alt = `${names.base}, верхний коврик: ${names.top}`;
  caption.textContent = `${names.base.toUpperCase()}  ·  ${names.top.toUpperCase()}`;
  showScreen("resultScreen");
}

document.getElementById("openConfigurator").addEventListener("click", () => showScreen("configuratorScreen"));
document.getElementById("backHome").addEventListener("click", () => showScreen("homeScreen"));
document.getElementById("editParameters").addEventListener("click", () => showScreen("configuratorScreen"));
document.getElementById("editParametersBottom").addEventListener("click", () => showScreen("configuratorScreen"));
resultButton.addEventListener("click", showResult);
materialTabs.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-category-id]");
  if (!tab || tab.dataset.categoryId === activeBaseCategoryId) return;
  activeBaseCategoryId = tab.dataset.categoryId;
  renderBaseMaterials();
});
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
