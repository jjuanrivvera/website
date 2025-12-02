import { test, expect } from '@playwright/test';

type LocaleConfig = {
  url: string;
  lang: string;
  subtitle: string;
  navItems: {
    experience: string;
    skills: string;
    projects: string;
    education: string;
    contact: string;
    blog: string;
  };
};

const locales: LocaleConfig[] = [
  {
    url: '/',
    lang: 'English',
    subtitle: 'Full Stack Developer',
    navItems: {
      experience: 'Experience',
      skills: 'Skills',
      projects: 'Projects',
      education: 'Education',
      contact: 'Contact',
      blog: 'Blog',
    },
  },
  {
    url: '/es/',
    lang: 'Spanish',
    subtitle: 'Desarrollador Full Stack',
    navItems: {
      experience: 'Experiencia',
      skills: 'Habilidades',
      projects: 'Proyectos',
      education: 'Educación',
      contact: 'Contacto',
      blog: 'Blog',
    },
  },
  {
    url: '/pt/',
    lang: 'Portuguese',
    subtitle: 'Desenvolvedor Full Stack',
    navItems: {
      experience: 'Experiência',
      skills: 'Habilidades',
      projects: 'Projetos',
      education: 'Educação',
      contact: 'Contato',
      blog: 'Blog',
    },
  },
];

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

  locales.forEach(({ url, lang, subtitle }) => {
    test(`${lang} hero section displays correct content`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('.hero-subtitle')).toContainText(subtitle);
    });
  });

  locales.forEach(({ url, lang, navItems }) => {
    test(`${lang} navigation labels are translated`, async ({ page }) => {
      await page.goto(url);
      // Use exact match to avoid "View Experience" button
      await expect(
        page.getByRole('link', { name: navItems.experience, exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: navItems.skills, exact: true })
      ).toBeVisible();
    });
  });

  locales.forEach(({ url, lang, navItems }) => {
    test(`${lang} all navigation items are visible`, async ({ page }) => {
      await page.goto(url);

      await expect(
        page.getByRole('link', { name: navItems.experience, exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: navItems.skills, exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: navItems.projects, exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: navItems.education, exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: navItems.contact, exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: navItems.blog, exact: true })
      ).toBeVisible();
    });
  });

  locales.forEach(({ url, lang }) => {
    test(`${lang} blog navigation link works`, async ({ page }) => {
      await page.goto(url);
      await page
        .getByRole('link', { name: 'Blog', exact: true })
        .first()
        .click();
      const urlPattern =
        url === '/' ? /\/blog\/?$/ : new RegExp(`${url}blog/?$`);
      await expect(page).toHaveURL(urlPattern);
    });
  });

  locales.forEach(({ url, lang, navItems }) => {
    test(`${lang} section navigation anchors work`, async ({ page }) => {
      const urlBase = url === '/' ? '' : url.replace(/\/$/, '');

      // Test Experience navigation
      await page.goto(url);
      await page
        .getByRole('link', { name: navItems.experience, exact: true })
        .first()
        .click();
      await expect(page).toHaveURL(new RegExp(`${urlBase}/?#experience$`));

      // Test Skills navigation
      await page.goto(url);
      await page
        .getByRole('link', { name: navItems.skills, exact: true })
        .first()
        .click();
      await expect(page).toHaveURL(new RegExp(`${urlBase}/?#skills$`));

      // Test Projects navigation
      await page.goto(url);
      await page
        .getByRole('link', { name: navItems.projects, exact: true })
        .first()
        .click();
      await expect(page).toHaveURL(new RegExp(`${urlBase}/?#projects$`));
    });
  });
});
