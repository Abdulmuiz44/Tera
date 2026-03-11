# Tera Demo Video - Quick Start Guide

## Your 90-Second Demo Video is Ready! 🎬

All 8 scenes are complete and ready to render. Here's how to get your video:

---

## 1. Install Remotion

```bash
npm install remotion@latest
```

---

## 2. Add Background Music (Optional but Recommended)

The video is fully functional without audio, but sounds much better with it.

### Quick Way (5 minutes):

1. Download a free track from:
   - **Pixabay Music:** https://pixabay.com/music/ (Search "uplifting" or "tech")
   - **Incompetech:** https://incompetech.com/ (Try "Sunny Days" or "Inspire")

2. Create folder:
   ```bash
   mkdir -p remotion/assets/audio
   ```

3. Place your MP3 file:
   ```
   remotion/assets/audio/background-music.mp3
   ```

4. Uncomment audio in `remotion/TeraDemo.tsx`:
   ```typescript
   <Audio 
     src="/audio/background-music.mp3"
     startFrom={0}
     volume={0.6}
   />
   ```

See `AUDIO_SETUP.md` for more details and recommendations.

---

## 3. Preview the Video

```bash
npm run remotion:preview
```

This opens a browser with an interactive preview. You can:
- Play/pause the video
- Scrub through scenes
- Test at different resolutions
- Check timing and animations

---

## 4. Render the Final Video

### Option A: Default (1080p, H.264)
```bash
npm run remotion:render
```

This creates `output.mp4` in your project root.

### Option B: 4K (3840x2160)
```bash
npx remotion render remotion/composition.ts TeraDemoVideo output-4k.mp4 --width 3840 --height 2160
```

### Option C: Custom Quality
```bash
npx remotion render remotion/composition.ts TeraDemoVideo output.mp4 --quality 95 --codec h264
```

**⏱️ Rendering times:**
- 1080p: 3-7 minutes (depending on your PC)
- 4K: 15-30 minutes
- Run while you work on other things!

---

## 5. Output

Your video will be:
- **Filename:** `output.mp4`
- **Resolution:** 1920×1080 (or your custom size)
- **Duration:** 90 seconds
- **Format:** MP4 (H.264 video codec)
- **File Size:** ~20-50 MB (depends on quality/music)

---

## Complete Video Breakdown

| Scene | Content | Duration |
|-------|---------|----------|
| 1 | Hero Intro - "Learn Anything. Master Everything." | 5s |
| 2 | Problem Statement - Student/Teacher/Professional personas | 5s |
| 3 | Chat Interface - Demo with typing effect | 15s |
| 4 | Web Search - Real-time results with citations | 10s |
| 5 | AI Tools - Lesson plans, worksheets, rubrics, etc. | 20s |
| 6 | Pricing - Free, Pro, Plus plans | 15s |
| 7 | Mobile - iPhone experience with screen transitions | 10s |
| 8 | Call-to-Action - "Start Free Today" + teraai.chat | 10s |

---

## File Structure

```
Tera/
├── remotion/
│   ├── composition.ts           # Root composition
│   ├── TeraDemo.tsx             # Main video (all scenes)
│   ├── scenes/
│   │   ├── Scene1HeroIntro.tsx
│   │   ├── Scene2ProblemStatement.tsx
│   │   ├── Scene3ChatInterface.tsx
│   │   ├── Scene4WebSearch.tsx
│   │   ├── Scene5AITools.tsx
│   │   ├── Scene6PricingTiers.tsx
│   │   ├── Scene7MobileExperience.tsx
│   │   └── Scene8CTA.tsx
│   ├── utils/
│   │   ├── colors.ts            # Color palette
│   │   ├── animations.ts        # Reusable animations
│   │   └── audio.ts             # Audio config
│   └── assets/
│       └── audio/
│           └── background-music.mp3 (optional)
├── REMOTION_SETUP.md
├── AUDIO_SETUP.md
└── output.mp4                   # Your finished video!
```

---

## Customization

### Change Colors
Edit `remotion/utils/colors.ts` to match your brand.

### Adjust Timing
Edit scene durations in `remotion/TeraDemo.tsx`:
```typescript
const SCENE1_DURATION = 150; // 5 seconds at 30fps
```

### Modify Text
Edit individual scene files in `remotion/scenes/`.

### Add Sound Effects
See `AUDIO_SETUP.md` for SFX options.

---

## Troubleshooting

### Video won't preview
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install remotion@latest
npm run remotion:preview
```

### Audio not playing
- Ensure file path is correct
- Check file format (MP3 recommended)
- Test audio file works independently

### Slow rendering
- Render at 1080p first (faster)
- Close other apps to free up CPU
- Use `-q 50` for lower quality (faster): `--quality 50`

### Colors look wrong
- Browser cache issue - hard refresh (Ctrl+Shift+R)
- Check your monitor color settings
- Colors may vary slightly between preview and final render

---

## Next Steps

1. **Render video:** `npm run remotion:render`
2. **Add to website:** Upload MP4 to your site or YouTube
3. **Share:** Post on social media, include in landing page
4. **Iterate:** Adjust based on feedback

---

## Pro Tips

✅ **Do:**
- Render a test at 1080p first before 4K
- Add subtitles using video editing software (CapCut, DaVinci Resolve)
- Use this video in your landing page hero section
- Share on LinkedIn, Twitter, YouTube, TikTok
- Create shorts (15s clips) from key scenes

❌ **Don't:**
- Render at massive resolutions unless needed (disk space)
- Add too much compression (keep quality high)
- Use copyrighted music without permission
- Upload without testing audio/timing first

---

## Resources

- **Remotion Docs:** https://www.remotion.dev/
- **Video Hosting:** YouTube, Vimeo, or embed on website
- **Background Music:** Pixabay, Incompetech, Epidemic Sound
- **Sound Effects:** Freesound, Mixkit, BBC Sound Effects
- **Subtitles:** CapCut (free), DaVinci Resolve (free), Adobe Premiere

---

## Support

Got questions?
- Check `REMOTION_SETUP.md` for technical details
- Check `AUDIO_SETUP.md` for audio/music issues
- Visit Remotion docs: https://www.remotion.dev/
- Check file structure in `remotion/` folder

---

## You're All Set! 🚀

Your demo video is ready to render. Go ahead and run:

```bash
npm run remotion:render
```

Come back in a few minutes for your finished video! ✨
