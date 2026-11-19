import { expect, test } from "@playwright/test";

test("renders the editor and draws offline", async ({ page }) => {
  const externalRequests = [];
  page.on("request", (request) => {
    const { protocol, hostname } = new URL(request.url());
    if (protocol.startsWith("http") && hostname !== "127.0.0.1") {
      externalRequests.push(request.url());
    }
  });

  await page.goto("/");

  // The editor shell and its tools come from the local bundle.
  await expect(page.locator(".excalidraw__canvas").first()).toBeVisible();
  await expect(page.getByRole("radio", { name: /^Rectangle/ })).toBeVisible();
  await expect(page.getByRole("radio", { name: /^Text/ })).toBeVisible();

  // The radio's icon intercepts pointer clicks, so set the input directly and
  // let the tool state settle before drawing.
  await page.getByRole("radio", { name: /^Rectangle/ }).check({ force: true });
  await expect(page.getByRole("radio", { name: /^Rectangle/ })).toBeChecked();
  await page.waitForTimeout(150);

  await page.mouse.move(300, 300);
  await page.mouse.down();
  await page.mouse.move(500, 500, { steps: 5 });
  await page.mouse.up();

  // The host persists the scene in localStorage 400 ms after a change.
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const saved = localStorage.getItem("excalidraw-local-scene");
          return saved ? JSON.parse(saved).elements.length : 0;
        }),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);

  const scene = await page.evaluate(() => JSON.parse(localStorage.getItem("excalidraw-local-scene")));
  expect(scene.elements.some((element) => element.type === "rectangle")).toBe(true);

  // Fonts and assets must not be fetched from a CDN.
  expect(externalRequests).toEqual([]);
});
