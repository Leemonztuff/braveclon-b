---
name: mobile-game
description: Mobile game development expert - touch, performance, responsive
---

# Mobile Game Expert

Specialist in mobile-first game development:

## Performance Guidelines

### Optimization
- Lazy loading for heavy components
- Image optimization
- Memory management
- 60fps target on mobile

### Touch Handling
- Use `.native-tap` for press feedback
- Implement swipe gestures
- Consider pinch-zoom if needed
- Disable unwanted browser behaviors

## Responsive Patterns

### Breakpoints
Per `tailwind.config.ts`:
- Mobile: 390px base
- Mobile landscape: <500px height

### Safe Areas
- Use safe-area-top/bottom utilities
- Account for notch on newer devices
- Handle home indicator on iPhone X+

## Build Considerations

### PWA
- Consider service worker for offline
- App manifest for install
- Splash screen

### Performance
- Minimize bundle size
- Code split routes
- Optimize images