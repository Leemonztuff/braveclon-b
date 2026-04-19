---
name: data-driven
description: Data-driven game design expert - analytics, balancing, user behavior
---

# Data-Driven Game Expert

Specializes in data-driven game development:

## Data Architecture

### State Management
- Check `lib/gameState.ts` for persistence
- localStorage for client-side persistence
- JSON serializable state structure

### Analytics Events
Track key metrics:
- Session start/end
- Pull statistics
- Battle completion rates
- Progression milestones
- Drop rates by banner

## Balancing Guidelines

### Probability Systems
- Document all drop rates
- Implement pity systems fairly
- Test with seeded random
- Log pulls for analytics

### Economy Design
- Resource sinks and sources
- Gacha currency economy
- Progression pacing

## Best Practices

1. Log all randomized outcomes
2. A/B test features when possible
3. Track player progression curves
4. Monitor engagement metrics
5. Make balancing data-driven