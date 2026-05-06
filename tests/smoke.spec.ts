import { test, expect } from "@playwright/test";

test.describe("Groupe Kara — smoke", () => {
  test("page loads with title and hero", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Groupe Kara/);
    await expect(page.locator("#hero")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Acquérir/ })).toBeVisible();
  });

  test("no JavaScript errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("all main sections render in DOM", async ({ page }) => {
    await page.goto("/");
    for (const id of [
      "#hero",
      "#apropos",
      "#criteres",
      "#philosophie",
      "#processus",
      "#contact",
    ]) {
      await expect(page.locator(id)).toHaveCount(1);
    }
  });

  test("scroll reveals each section (data-reveal animates to opacity 1)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    for (const id of ["#apropos", "#criteres", "#philosophie", "#contact"]) {
      await page.locator(id).scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      // At least one reveal in the section should have animated to full opacity
      const maxOpacity = await page
        .locator(`${id} [data-reveal], ${id} [data-reveal-item]`)
        .evaluateAll((els) =>
          els.length === 0
            ? 0
            : Math.max(...els.map((el) => parseFloat(getComputedStyle(el).opacity)))
        );
      expect(maxOpacity).toBeGreaterThan(0.9);
    }
  });

  test("contact form validates required fields", async ({ page }) => {
    await page.goto("/#contact");
    const submit = page.getByRole("button", { name: /Envoyer ma demande/ });
    await submit.scrollIntoViewIfNeeded();
    // Wait until the React form is hydrated (astro-island removes ssr attr)
    await page.waitForFunction(() => {
      const island = document.querySelector("astro-island");
      return island !== null && !island.hasAttribute("ssr");
    });
    await submit.click();
    await expect(page.getByText(/Veuillez entrer votre nom/)).toBeVisible({
      timeout: 5000,
    });
  });

  test("contact form submits in demo mode and shows success toast", async ({
    page,
  }) => {
    await page.goto("/#contact");
    await page.locator("#nom").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const island = document.querySelector("astro-island");
      return island !== null && !island.hasAttribute("ssr");
    });
    await page.fill("#nom", "Jean Tremblay");
    await page.fill("#email", "jean@entreprise.com");
    await page.fill("#secteur", "Plomberie");
    await page.fill(
      "#message",
      "Nous explorons une transition pour notre entreprise familiale active depuis 23 ans."
    );
    await page.getByRole("button", { name: /Envoyer ma demande/ }).click();
    await expect(page.getByText("Message reçu")).toBeVisible({ timeout: 5000 });
  });

  test("nav anchors scroll to their target section", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="#processus"]').first().click();
    await page.waitForTimeout(600);
    const inView = await page.locator("#processus").evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    });
    expect(inView).toBe(true);
  });
});
