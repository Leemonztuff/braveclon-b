# AGENTS.md

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Braveclon Game Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + TailwindCSS 4 + Motion
- **State**: Local storage persistido (no backend)
- **Audio**: Web Audio API

### Project Structure
```
app/           # Next.js pages (page.tsx = main game)
components/    # UI screens y componentes
  ├── battle/  # Componentes de batalla
hooks/         # useGameApp, useBattle, useMobile
lib/           # gameTypes, gameData, gameState, utils
```

### Core Systems (lib/gameData.ts)
- **6 Elements**: Fire, Water, Earth, Thunder, Light, Dark
- **Unit System**: templates → instances → equip/fuse/evolve
- **Battle**: turn-based con BB gauge, elemental weakness
- **Equipment**: weapon, armor, accessory (slots)

### Key Entry Points
- `app/page.tsx`: Main game router (currentScreen state)
- `hooks/useGameApp.ts`: Global game state + actions
- `hooks/useBattle.ts`: Battle logic
- `lib/gameState.ts`: State persistence

## OpenCode Game Studio

Configuración global instalada en `~/.config/opencode/`.

### Directorios
- `agents/`: 48 agentes especializados
- `skills/`: 37 workflows (slash commands)
- `docs/`: Documentación y templates

### Usage

```bash
# Iniciar sesión
opencode

# Usar agentes
@game-designer "Diseña un nuevo sistema de batalla"
@lead-programmer "Revisa la arquitectura del código"
@creative-director "Define la visión del juego"

# Usar skills
/code-review
/balance-check
/prototype
/playtest-report
/start
/sprint-plan
```

### Agents Útiles para Braveclon

| Task | Agent |
|------|-------|
| Diseño de mecánicas | @game-designer |
| Sistema de batalla | @gameplay-programmer |
| UI/UX | @ui-programmer, @ux-designer |
| Performance | @performance-analyst |
| Code review | @lead-programmer |
| Audio | @sound-designer |
| QA | @qa-tester |
| Balance economy | @economy-designer |
