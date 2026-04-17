# AGENTS.md

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Developer Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run lint` | ESLint check (only validation) |
| `npm run clean` | Clear Next.js cache |
| `npm run vercel-build` | Vercel production build (same as build) |

## Architecture

### Tech Stack
- Next.js 15 (App Router) + React 19
- TailwindCSS 4 + Motion (animations)
- State: localStorage persistence (no backend required)
- Audio: Web Audio API

### Entry Points
- `/app/landing/` - Main game UI (page.tsx redirects here)
- `hooks/useGameApp.ts` - Global state + actions
- `hooks/useBattle.ts` - Battle system logic
- `lib/gameState.ts` - State persistence
- `lib/gameData.ts` - Game data definitions

### Key Systems
- **Elements**: Fire, Water, Earth, Thunder, Light, Dark
- **Units**: templates → instances → equip/fuse/evolve
- **Battle**: turn-based with BB gauge, OD gauge, elemental weakness
- **Equipment**: weapon, armor, accessory slots

### Path Aliases
`@/*` maps to project root (used in imports)

### Mobile Support
- Custom safe-area utilities in tailwind.config.ts
- `use-mobile.ts` hook for mobile detection
- Mobile breakpoints: `mobile: 390px`, `mobile-landscape` (<500px height)

## Build Quirks
- TypeScript `ignoreBuildErrors: true` in next.config.ts (builds pass despite TS errors)
- `transpilePackages: ['motion']` enabled for Framer Motion

## Touch/Input Utilities
- `.native-tap` - touch-friendly press effect (opacity on active)
- `.user-select-none` - disables text selection
- `.touch-none` / `.touch-auto` - touch action control

## Style Conventions

- Custom color tokens: `primary` (#fbbf24), `secondary` (#06b6d4), etc.
- Font size `micro`: 0.6875rem
- Animations: `fadeIn`, `slideUp`, `slideDown`, `pulse-glow`, `shimmer`
- Touch-friendly: `.native-tap`, `.user-select-none` classes available
