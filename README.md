# Juan Felipe Rivera Portfolio Website

A modern, responsive personal portfolio website showcasing professional experience, technical skills, and projects.

**Live Site:** [jjuanrivvera.com](https://jjuanrivvera.com)

## Features

- **Dark Theme Design** - Modern dark UI with vibrant accent colors and gradient effects
- **Responsive Layout** - Mobile-first design that works across all devices
- **Smooth Animations** - AOS (Animate On Scroll) library for scroll-triggered animations
- **Accessibility** - Skip link, keyboard navigation, focus styles, and reduced motion support
- **Performance Optimized** - Self-hosted fonts, WebP images, preloaded LCP image
- **SEO Ready** - Open Graph, Twitter Cards, Schema.org structured data, sitemap, robots.txt

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, flexbox, grid, animations
- **JavaScript** - Vanilla JS (no framework)
- **AOS** - Animate On Scroll library
- **Inter Font** - Self-hosted variable font
- **Netlify** - Hosting and deployment

## Project Structure

```
website/
├── css/
│   ├── style.css      # Main styles
│   ├── fonts.css      # Font declarations
│   └── aos.css        # AOS library styles
├── js/
│   ├── main.js        # Main JavaScript
│   └── aos.js         # AOS library
├── fonts/
│   └── Inter*.woff2   # Self-hosted Inter font files
├── img/
│   ├── profile-picture.webp
│   ├── icons.svg      # SVG sprite for icons
│   ├── favicon.ico
│   └── logo-*.png
├── files/
│   └── CV.pdf         # Downloadable CV
├── index.html         # Main HTML file
├── sitemap.xml        # SEO sitemap
└── robots.txt         # Search engine directives
```

## Sections

- **Hero** - Introduction with profile image, title, and social links
- **Experience** - Professional work history timeline
- **Skills** - Technical skills organized by category (Frontend, Backend, Database, Cloud)
- **Projects** - Featured projects with descriptions and tech stacks
- **Education** - Academic background
- **Contact** - Contact information and call-to-action

## Development

### Local Development

Simply open `index.html` in a browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using PHP
php -S localhost:8000
```

### Deployment

The site is deployed on Netlify with automatic deployments from the `main` branch.

## Performance Features

- **Preloaded LCP Image** - Profile picture is preloaded for faster rendering
- **Self-hosted Fonts** - Eliminates external font requests
- **WebP Images** - Optimized image format with PNG fallback
- **Deferred Scripts** - JavaScript loaded with `defer` attribute
- **Content Security Policy** - Restricts resource loading for security

## Accessibility

- Skip link for keyboard navigation
- Focus-visible styles for keyboard users
- Reduced motion support via `prefers-reduced-motion`
- ARIA labels on interactive elements
- Semantic HTML structure

## Analytics

Google Analytics is integrated for tracking:
- Page views
- CV downloads
- Contact link clicks (email, phone)
- Social media clicks (LinkedIn, GitHub)
- Section scroll visibility

## License

All rights reserved.

---

*Built with vanilla HTML, CSS, and JavaScript*
