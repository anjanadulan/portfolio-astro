# Anjana Wijerathna — Portfolio Website

A premium, high-performance personal developer portfolio website designed with a modern dark-theme aesthetic (inspired by Vercel & Linear) built using **Astro v6** and **Tailwind CSS v4**.

---

## 🚀 Tech Stack

- **Framework**: [Astro v6](https://astro.build/) (Static Site Generation)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS variables
- **Logic & Interactions**: Modern Vanilla JavaScript
- **Deployment**: Configured for static hosting platforms (Vercel, GitHub Pages)
- **Integrations**: [Web3Forms](https://web3forms.com/) for contact form handling

---

## ✨ Features

- **Responsive Dark/Light Mode**: Automatic theme detection with smooth client toggles.
- **Interactive Project Modal Detail Cards**: Clickable project entries load comprehensive details (such as technical challenges, methodologies, and feature sets) dynamically from a JSON data source.
- **Micro-Interactions & Animations**:
  - Event-driven **typewriter effect** for hero taglines.
  - **3D parallax tilt** effect on the profile image card on mouse movement.
  - **Animated progress bars** inside category switching skill sheets.
  - Smooth **IntersectionObserver scroll reveals** for entrance animations.
  - Scroll-to-top and floating shortcut elements.
- **Modern Gradient Borders**: Custom styled gradient boundaries on cards using CSS masks (`mask-composite`).

---

## 📁 Repository Structure

```text
├── .astro/                 # Astro build cache
├── public/                 # Static assets (Favicons, Resumes, Profile images)
├── src/
│   ├── assets/            # Main graphics & logo resources
│   ├── components/        # Reusable Astro components
│   │   ├── ProjectCard.astro   # Card frame for directory list
│   │   └── ProjectModal.astro  # Detailed project view overlay
│   ├── data/              # Static JSON dataset files
│   │   └── projects.json       # Project list, feature scopes, and challenges
│   ├── layouts/           # Page shell layouts
│   │   └── Layout.astro        # Base HTML wrapper, SEO tags & global client scripts
│   ├── pages/             # Routing page entrypoints
│   │   ├── index.astro         # Main homepage index
│   │   └── projects.astro      # Complete projects archive index
│   ├── scripts/           # Client-side interactivity scripts
│   │   └── portfolio.js        # Theme, modals, tilt, typewriter & reveal logic
│   └── styles/            # Main styling system
│       └── global.css          # Design system variables, Tailwind v4 imports, utility layout rules
├── astro.config.mjs       # Astro framework configurations
├── package.json           # npm dependencies & workspace build scripts
└── README.md              # Project documentation
```

---

## 🛠️ Local Development

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (LTS version recommended).

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Dev Server
```bash
npm run dev
```
Open [http://localhost:4321](http://localhost:4321) in your browser to preview the site locally.

### 4. Build for Production
To compile a production-ready static site inside the `dist/` directory:
```bash
npm run build
```

---

## 📄 License

Designed and built by [Anjana Wijerathna](https://github.com/anjanadulan). Feel free to adapt this template for your personal use.
