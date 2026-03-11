# Remotion Setup Guide

## Installation

```bash
npm install remotion@latest
npm install --save-dev @types/remotion
```

Or with pnpm:
```bash
pnpm add remotion
pnpm add -D @types/remotion
```

## Project Structure

```
remotion/
├── composition.ts          # Root Remotion composition registration
├── TeraDemo.tsx           # Main video composition (all scenes)
├── scenes/
│   ├── Scene1HeroIntro.tsx
│   ├── Scene2ProblemStatement.tsx
│   ├── Scene3ChatInterface.tsx
│   ├── Scene4WebSearch.tsx
│   ├── Scene5AITools.tsx
│   ├── Scene6PricingTiers.tsx
│   ├── Scene7MobileExperience.tsx
│   └── Scene8CTA.tsx
├── utils/
│   ├── animations.ts       # Reusable animation helpers
│   ├── colors.ts          # Color palette
│   └── fonts.ts           # Font loading
└── assets/
    ├── icons/
    ├── images/
    └── audio/
```

## Video Specs

- **Resolution:** 1920x1080 (16:9)
- **FPS:** 30
- **Duration:** 90 seconds (270 frames)
- **Codec:** H.264 (MP4)

## Running Scene 1

```bash
# Preview the first scene
npx remotion preview remotion/composition.ts

# Render to MP4
npx remotion render remotion/composition.ts TeraDemoVideo output.mp4

# Render specific scene at 4K
npx remotion render remotion/composition.ts TeraDemoVideo output.mp4 --width 3840 --height 2160
```

## Customizing Scene 1

Edit `remotion/scenes/Scene1HeroIntro.tsx`:

- **Font:** Change `fontFamily` (currently system-ui)
- **Colors:** Update gradient colors in the style prop
- **Timing:** Adjust `delay` values in `spring()` and `interpolate()` calls
- **Logo:** Replace the "T" div with actual SVG or image

## Animation Primitives Used in Scene 1

- `spring()` - Bouncy title and logo entrance
- `interpolate()` - Smooth opacity transitions
- `useCurrentFrame()` - Get current frame number
- `useVideoConfig()` - Access video settings (fps, dimensions)

## Completed Scenes

1. ✅ Scene 1: Hero Intro (5s) - Animated title, subtitle, bouncing logo
2. ✅ Scene 2: Problem Statement (5s) - 3 persona cards, problem headline
3. ✅ Scene 3: Chat Interface Demo (15s) - Chat window, typing effect, interactive
4. ✅ Scene 4: Web Search Feature (10s) - Search results, source citations
5. ✅ Scene 5: AI Tools Showcase (20s) - 3x2 grid of tool cards with rotating icons
6. ✅ Scene 6: Pricing Tiers (15s) - Free, Pro, Plus cards with features
7. ✅ Scene 7: Mobile Experience (10s) - iPhone mockup with screen transitions
8. ✅ Scene 8: Call-to-Action (10s) - Main headline, CTA button, teraai.chat

**Total Duration: 90 seconds**

## Next Steps

1. ✅ Build all 8 scenes
2. Add background music and sound effects
3. Test preview: `npm run remotion:preview`
4. Render final video: `npm run remotion:render`
5. (Optional) Customize colors in `remotion/utils/colors.ts`
6. (Optional) Adjust timing in `remotion/TeraDemo.tsx`
