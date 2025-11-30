import { test, expect } from '@playwright/test';

test.describe('i18n', () => {
  test('all locale pages load successfully', async ({ page }) => {
    const locales = ['/', '/es/', '/pt/'];

    for (const locale of locales) {
      const response = await page.goto(locale);
      expect(response?.status()).toBe(200);
    }
  });

  test('language switcher shows all options', async ({ page }) => {
    await page.goto('/');

    // Open language dropdown
    await page.getByRole('button', { name: 'Change language' }).click();

    // Check all language options are visible
    await expect(page.getByRole('menuitem', { name: 'English' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Español' })).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Português (Brasil)' })
    ).toBeVisible();
  });

  test('language switcher navigates to Spanish', async ({ page }) => {
    await page.goto('/');

    // Open language dropdown and click Spanish
    await page.getByRole('button', { name: 'Change language' }).click();
    await page.getByRole('menuitem', { name: 'Español' }).click();

    // Verify navigation
    await expect(page).toHaveURL('/es/');
    await expect(page.locator('.hero-subtitle')).toContainText(
      'Desarrollador Full Stack'
    );
  });

  test('language switcher navigates to Portuguese', async ({ page }) => {
    await page.goto('/');

    // Open language dropdown and click Portuguese
    await page.getByRole('button', { name: 'Change language' }).click();
    await page.getByRole('menuitem', { name: 'Português (Brasil)' }).click();

    // Verify navigation
    await expect(page).toHaveURL('/pt/');
    await expect(page.locator('.hero-subtitle')).toContainText(
      'Desenvolvedor Full Stack'
    );
  });

  test('language switcher navigates from Spanish to English', async ({
    page,
  }) => {
    await page.goto('/es/');

    // Open language dropdown and click English
    await page.getByRole('button', { name: 'Cambiar idioma' }).click();
    await page.getByRole('menuitem', { name: 'English' }).click();

    // Verify navigation - English is at root
    await expect(page).toHaveURL('/');
    await expect(page.locator('.hero-subtitle')).toContainText(
      'Full Stack Developer'
    );
  });

  test('hero section displays correct content per locale', async ({ page }) => {
    // English
    await page.goto('/');
    await expect(page.locator('.hero-subtitle')).toContainText(
      'Full Stack Developer'
    );

    // Spanish
    await page.goto('/es/');
    await expect(page.locator('.hero-subtitle')).toContainText(
      'Desarrollador Full Stack'
    );

    // Portuguese
    await page.goto('/pt/');
    await expect(page.locator('.hero-subtitle')).toContainText(
      'Desenvolvedor Full Stack'
    );
  });

  test('navigation labels are translated', async ({ page }) => {
    // English - use exact match to avoid "View Experience" button
    await page.goto('/');
    await expect(
      page.getByRole('link', { name: 'Experience', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Skills', exact: true })
    ).toBeVisible();

    // Spanish
    await page.goto('/es/');
    await expect(
      page.getByRole('link', { name: 'Experiencia', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Habilidades', exact: true })
    ).toBeVisible();

    // Portuguese
    await page.goto('/pt/');
    await expect(
      page.getByRole('link', { name: 'Experiência', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Habilidades', exact: true })
    ).toBeVisible();
  });

  test('all navigation items are visible in English', async ({ page }) => {
    await page.goto('/');

    // Check all navigation items are visible
    await expect(
      page.getByRole('link', { name: 'Experience', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Skills', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Projects', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Education', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Contact', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Blog', exact: true })
    ).toBeVisible();
  });

  test('all navigation items are visible in Spanish', async ({ page }) => {
    await page.goto('/es/');

    // Check all navigation items are visible
    await expect(
      page.getByRole('link', { name: 'Experiencia', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Habilidades', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Proyectos', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Educación', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Contacto', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Blog', exact: true })
    ).toBeVisible();
  });

  test('all navigation items are visible in Portuguese', async ({ page }) => {
    await page.goto('/pt/');

    // Check all navigation items are visible
    await expect(
      page.getByRole('link', { name: 'Experiência', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Habilidades', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Projetos', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Educação', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Contato', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Blog', exact: true })
    ).toBeVisible();
  });

  test('blog navigation link works in all languages', async ({ page }) => {
    // English
    await page.goto('/');
    await page.getByRole('link', { name: 'Blog', exact: true }).first().click();
    await expect(page).toHaveURL(/\/blog\/?$/);

    // Spanish
    await page.goto('/es/');
    await page.getByRole('link', { name: 'Blog', exact: true }).first().click();
    await expect(page).toHaveURL(/\/es\/blog\/?$/);

    // Portuguese
    await page.goto('/pt/');
    await page.getByRole('link', { name: 'Blog', exact: true }).first().click();
    await expect(page).toHaveURL(/\/pt\/blog\/?$/);
  });

  test('section navigation anchors work in English', async ({ page }) => {
    await page.goto('/');

    // Test Experience navigation
    await page
      .getByRole('link', { name: 'Experience', exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/#experience$/);

    // Test Skills navigation
    await page.goto('/');
    await page
      .getByRole('link', { name: 'Skills', exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/#skills$/);

    // Test Projects navigation
    await page.goto('/');
    await page
      .getByRole('link', { name: 'Projects', exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/#projects$/);
  });

  test('section navigation anchors work in Spanish', async ({ page }) => {
    await page.goto('/es/');

    // Test Experience navigation
    await page
      .getByRole('link', { name: 'Experiencia', exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/es\/?#experience$/);

    // Test Skills navigation
    await page.goto('/es/');
    await page
      .getByRole('link', { name: 'Habilidades', exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/es\/?#skills$/);

    // Test Projects navigation
    await page.goto('/es/');
    await page
      .getByRole('link', { name: 'Proyectos', exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/es\/?#projects$/);
  });

  test('section navigation anchors work in Portuguese', async ({ page }) => {
    await page.goto('/pt/');

    // Test Experience navigation
    await page
      .getByRole('link', { name: 'Experiência', exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/pt\/?#experience$/);

    // Test Skills navigation
    await page.goto('/pt/');
    await page
      .getByRole('link', { name: 'Habilidades', exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/pt\/?#skills$/);

    // Test Projects navigation
    await page.goto('/pt/');
    await page
      .getByRole('link', { name: 'Projetos', exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/pt\/?#projects$/);
  });
});
