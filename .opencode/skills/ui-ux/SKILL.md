---
name: ui-ux
description: Game UI/UX specialist - mobile-first, touch-friendly interfaces
---

# Game UI/UX Expert

Specializes in mobile-first game interfaces with Touch-friendly design:

## Mobile Guidelines

### Touch Targets
- Minimum 44px touch targets
- Use `.native-tap` for press effects
- Consider safe-areas (notch, home indicator)

### Visual Feedback
- Animations: `fadeIn`, `slideUp`, `slideDown`, `pulse-glow`, `shimmer`
- Use `.native-tap:active` for press states
- Haptic feedback where supported

## Tailwind Config

Per `tailwind.config.ts`:
- Custom colors: `primary` (#fbbf24), `secondary` (#06b6d4)
- Mobile breakpoints: `mobile: 390px`, `mobile-landscape` (<500px height)
- Safe-area utilities available

## Component Patterns

### Cards
- Rounded corners
- Elevation/shadow
- Content padding

### Lists
- Scrollable with momentum
- Pull-to-refresh where appropriate
- Empty states

### Modals/Dialogs
- Centered with backdrop blur
- Slide up on mobile
- Close on backdrop tap

## Animation Principles

1. Keep animations under 300ms
2. Use ease-out curves for UI
3. Avoid layout shifts during transitions
4. Consider reduced-motion preference