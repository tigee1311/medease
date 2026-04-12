import { mkdir } from "node:fs/promises";
import { chromium, devices } from "playwright";

const baseUrl = "https://medease-ashen.vercel.app";
const outputDir = new URL("../docs/screenshots/", import.meta.url);

async function main() {
  await mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });
  const desktopPage = await desktopContext.newPage();

  await desktopPage.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await desktopPage.screenshot({
    path: new URL("login.png", outputDir).pathname,
    fullPage: true,
  });

  await desktopPage.getByLabel("Email").fill("senior@medease.app");
  await desktopPage.getByLabel("Password").fill("DemoPass123");
  await desktopPage.getByRole("button", { name: "Sign in" }).click();
  await desktopPage.waitForURL(`${baseUrl}/dashboard`);
  await desktopPage.waitForLoadState("networkidle");
  await desktopPage.screenshot({
    path: new URL("dashboard.png", outputDir).pathname,
    fullPage: true,
  });

  await desktopPage.goto(`${baseUrl}/prescriptions`, { waitUntil: "networkidle" });
  await desktopPage.screenshot({
    path: new URL("prescriptions.png", outputDir).pathname,
    fullPage: true,
  });

  const mobileContext = await browser.newContext({
    ...devices["iPhone 13"],
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await mobilePage.getByLabel("Email").fill("senior@medease.app");
  await mobilePage.getByLabel("Password").fill("DemoPass123");
  await mobilePage.getByRole("button", { name: "Sign in" }).click();
  await mobilePage.waitForURL(`${baseUrl}/dashboard`);
  await mobilePage.goto(`${baseUrl}/timeline`, { waitUntil: "networkidle" });
  await mobilePage.screenshot({
    path: new URL("timeline-mobile.png", outputDir).pathname,
    fullPage: true,
  });

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
