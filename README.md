# Tableau de bord Booksa

Base d'application React + TypeScript construite avec Vite, Tailwind CSS, Zustand, React Query, des services prêts pour Firebase et des primitives d'interface riches en animation.

## Installation

```bash
npm create vite@latest my-dashboard -- --template react-ts
cd my-dashboard
npm install
npm install react-router-dom axios zustand @tanstack/react-query firebase react-hook-form zod dayjs react-hot-toast @tanstack/react-table recharts @amcharts/amcharts5 gsap @gsap/react animejs framer-motion lucide-react @heroicons/react @fluentui/react-icons react-icons
npm install tailwindcss @tailwindcss/vite
```

For Zod form resolution, this scaffold also uses:

```bash
npm install @hookform/resolvers
```

## Exécution

```bash
npm run dev
npm run build
npm run preview
```

## Notes

- La validation des formulaires avec Zod utilise `@hookform/resolvers` en plus des paquets ci-dessus.
- L'initialisation Firebase peut rester non configurée pendant le développement local.
- Des données factices sont incluses pour afficher l'application immédiatement sans backend.

## Netlify

- Le projet est prêt pour un déploiement Netlify via `netlify.toml`.
- Utilisez `.env.example` pour renseigner les variables `VITE_*` dans Netlify.
- Si vous ne voulez pas passer en production, connectez d’abord le dépôt en `Deploy Preview` ou en déploiement de branche.
