/**
 * Exercita o painel web no Chrome (CRUD, busca, estoque).
 * Requer API em :8000 e Vite em :5173.
 */
const puppeteer = require("../whatsapp-bot/node_modules/puppeteer");

const BASE = "http://localhost:5173/";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const stamp = String(Date.now());
const catNome = `QA Web Cat ${stamp}`;
const prodNome = `QA Web Prod ${stamp}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForToast(page, snippet, timeout = 12000) {
  await page.waitForFunction(
    (text) => {
      const toast = document.querySelector(".toast");
      return toast && toast.textContent.includes(text);
    },
    { timeout },
    snippet
  );
}

async function clickTab(page, label) {
  await page.evaluate((name) => {
    const button = [...document.querySelectorAll("button.tab")].find((item) =>
      item.textContent.includes(name)
    );
    if (!button) throw new Error(`Aba ${name} não encontrada`);
    button.click();
  }, label);
  await sleep(300);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: chromePath,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  page.on("dialog", (dialog) => dialog.accept());

  try {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".app");
    await page.waitForFunction(
      () => {
        const text = document.querySelector(".status")?.textContent || "";
        return text.includes("conectada") || text.includes("offline");
      },
      { timeout: 20000 }
    );

    const status = await page.$eval(".status", (el) => el.textContent);
    if (status.includes("offline")) {
      await page.evaluate(() => {
        const input = document.querySelector("#api-url");
        input.value = "http://localhost:8000";
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
      await page.evaluate(() => {
        [...document.querySelectorAll("button")].find((item) => item.textContent.trim() === "Salvar")?.click();
      });
      await page.waitForFunction(() => document.querySelector(".status")?.textContent.includes("conectada"), {
        timeout: 20000,
      });
    }

    await clickTab(page, "Categorias");
    await page.waitForSelector('input[placeholder="Nome da categoria"]');
    await page.type('input[placeholder="Nome da categoria"]', catNome);
    await page.click("form.card.form button[type='submit']");
    await waitForToast(page, "Categoria criada");
    await page.waitForFunction(
      (name) => [...document.querySelectorAll("td")].some((cell) => cell.textContent.includes(name)),
      { timeout: 15000 },
      catNome
    );

    await clickTab(page, "Produtos");
    await page.waitForSelector('input[placeholder="Nome"]');
    await page.type('input[placeholder="Nome"]', prodNome);
    await page.type('textarea[placeholder="Descrição (opcional)"]', "Item de validação do painel");
    await page.type('input[placeholder="Preço de venda, ex: 49.90"]', "19,90");
    const estoque = await page.$('input[placeholder="Quantidade em estoque"]');
    await estoque.click({ clickCount: 3 });
    await estoque.type("2");
    const categoriaValue = await page.evaluate((name) => {
      const select = document.querySelector("form.card.form select");
      const option = [...select.options].find((item) => item.textContent.includes(name));
      if (!option) throw new Error("Categoria do produto não está no select");
      return option.value;
    }, catNome);
    await page.select("form.card.form select", categoriaValue);
    await page.click("form.card.form button[type='submit']");
    await waitForToast(page, "Produto criado");
    await page.waitForFunction(
      (name) => [...document.querySelectorAll("td")].some((cell) => cell.textContent.includes(name)),
      { timeout: 15000 },
      prodNome
    );

    const plusDisabled = await page.evaluate((name) => {
      const row = [...document.querySelectorAll("tbody tr")].find((item) => item.textContent.includes(name));
      const plus = [...row.querySelectorAll("button")].find((item) => item.textContent.trim() === "+");
      plus.click();
      return plus.disabled;
    }, prodNome);
    if (plusDisabled) throw new Error("Botão de entrada de estoque veio desabilitado");
    await waitForToast(page, "Estoque de");

    await page.type('input[placeholder="Buscar por nome"]', prodNome);
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((item) => item.textContent.trim() === "Nome")?.click();
    });
    await waitForToast(page, "produto");
    await page.waitForSelector(".hint");

    await page.evaluate((name) => {
      const row = [...document.querySelectorAll("tbody tr")].find((item) => item.textContent.includes(name));
      [...row.querySelectorAll("button")].find((item) => item.textContent.trim() === "Deletar")?.click();
    }, prodNome);
    await waitForToast(page, "Produto ocultado");

    await clickTab(page, "Categorias");
    await page.evaluate((name) => {
      const row = [...document.querySelectorAll("tbody tr")].find((item) => item.textContent.includes(name));
      [...row.querySelectorAll("button")].find((item) => item.textContent.trim() === "Deletar")?.click();
    }, catNome);
    await waitForToast(page, "Categoria ocultada");

    console.log("OK: painel web validado no Chrome.");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
