# 👨‍👩‍👧‍👦 Aliesyahbana Family Dashboard

[![SvelteKit](https://img.shields.io/badge/SvelteKit-5-ff3e00?style=for-the-badge&logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38b2ac?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ed?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

A modern, responsive web application serving as the central hub for the Aliesyahbana family. Hosted at [family.rasasaufar.site](https://family.rasasaufar.site), this dashboard provides a family tree, birthday calendars, event galleries, and detailed member profiles.

## ✨ Features

- **🏠 Home Dashboard**: Family statistics (member count, generations), upcoming birthday reminders, and gallery previews.
- **🌳 Family Tree**: Interactive visual representation of the Aliesyahbana family lineage.
- **📅 Calendar**: Comprehensive birthday calendar for all family members.
- **📸 Event Gallery**: Photo collections from family events (weddings, reunions, halal bihalal).
- **👤 Member Profiles**: Detailed individual pages featuring photos, biographies, life timelines, and family relationships.
- **🔍 Member Search**: Global search component to quickly find any family member.
- **📱 Responsive Design**: Mobile-first approach with intuitive sidebar navigation.

## 🛠️ Tech Stack

| Technology | Description |
| :--- | :--- |
| **Framework** | SvelteKit 5 (adapter-auto) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v3 (Emerald/Slate custom theme) |
| **Typography** | Manrope (Headings), Inter (Body) |
| **Icons** | Material Symbols |
| **Data Storage**| JSON (`members.json`) & TypeScript modules (`gallery.ts`) |
| **Deployment** | Docker on Oracle Cloud VPS |

## 🚀 Development

### Prerequisites
- Node.js (v18+)
- npm / pnpm / yarn

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/rasasaufar/dashboard-keluarga-v2.git
   cd dashboard-keluarga-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   npm run dev -- --open
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 📂 Project Structure

```text
src/
├── lib/
│   ├── components/
│   │   └── MemberSearch.svelte
│   ├── data/
│   │   ├── members.json
│   │   └── gallery.ts
│   └── assets/
│       ├── favicon.svg
│       └── rumah-pekajangan.png
├── routes/
│   ├── +layout.svelte      # Sidebar navigation
│   ├── +page.svelte        # Home page
│   ├── tree/               
│   │   └── +page.svelte    # Family tree
│   ├── calendar/
│   │   └── +page.svelte    # Birthday calendar
│   ├── gallery/
│   │   └── +page.svelte    # Photo gallery
│   └── profile/
│       └── [id]/           # Member profile
│           ├── +page.svelte
│           └── +page.server.ts
├── app.css
├── app.html
└── app.d.ts
```

## 📜 License

Private — For Aliesyahbana family use only.

---
*Developed by [@rasasaufar](https://github.com/rasasaufar).*
