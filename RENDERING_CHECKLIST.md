# Rendering Checklist

## Pre-Render Verification

- [ ] All 8 scenes created
- [ ] Animations tested in preview
- [ ] Colors look correct
- [ ] Text is readable
- [ ] Timing feels right
- [ ] Total duration is 90 seconds
- [ ] All imports are working

## Installation

- [ ] Node.js 18+ installed
- [ ] `npm install remotion@latest` completed
- [ ] No dependency errors
- [ ] `npm run remotion:preview` works

## Optional: Audio Setup

- [ ] Background music file ready (90 seconds MP3)
- [ ] Place in `remotion/assets/audio/background-music.mp3`
- [ ] Uncommented Audio tag in `TeraDemo.tsx`
- [ ] Volume set appropriately (0.6 recommended)

## System Preparation

- [ ] Closed unnecessary applications
- [ ] Freed up disk space (at least 2GB)
- [ ] Internet connection stable (optional, for fonts)
- [ ] Monitor color settings normal
- [ ] Computer won't sleep during render

## Rendering Decision

Choose one:

### Option A: Fast Render (Recommended First)
```bash
npm run remotion:render
```
- Time: 5-7 minutes
- Quality: Good for web/social
- File size: ~40MB
- Resolution: 1920×1080

**Choose this if:**
- First time rendering
- Need video quickly
- Publishing to web/social only
- Want to test before 4K

### Option B: 4K Quality
```bash
npx remotion render remotion/composition.ts TeraDemoVideo output-4k.mp4 --width 3840 --height 2160
```
- Time: 20-30 minutes
- Quality: Excellent, future-proof
- File size: ~200MB
- Resolution: 3840×2160

**Choose this if:**
- Need highest quality
- Printing/archival
- Have rendering time
- Want to reuse elsewhere

### Option C: Custom Quality
```bash
npx remotion render remotion/composition.ts TeraDemoVideo output.mp4 --quality 95
```
- Time: 10-15 minutes
- Quality: Very high
- File size: ~80MB
- Resolution: 1920×1080

**Choose this if:**
- Want balance of quality/time
- Publishing to YouTube
- Need crisp visuals

## Rendering Process

### Step 1: Preview (5 minutes)
```bash
npm run remotion:preview
```
Check:
- All scenes display correctly
- Animations are smooth
- Colors are accurate
- Audio syncs (if enabled)
- No console errors

### Step 2: Render (5-30 minutes depending on choice)
```bash
npm run remotion:render
```
Watch terminal output for:
- Frame progress counter
- No error messages
- Successful completion message

### Step 3: Check Output
Verify `output.mp4`:
- [ ] File created successfully
- [ ] File size is reasonable (~40-200MB)
- [ ] Plays without errors
- [ ] All 90 seconds present
- [ ] Audio in sync (if enabled)
- [ ] Colors correct
- [ ] Text readable
- [ ] No stuttering or artifacts

## Quality Checks

### Video Playback
- [ ] Plays in VLC Media Player
- [ ] Plays in Windows Media Player
- [ ] Plays on YouTube/browser
- [ ] Audio sounds good (if enabled)
- [ ] No glitches or stutters

### Content Verification
- [ ] All 8 scenes present
- [ ] Scene order: Hero → Problem → Chat → Search → Tools → Pricing → Mobile → CTA
- [ ] Animations smooth
- [ ] Text visible
- [ ] Colors match Tera brand
- [ ] Logos/images display correctly
- [ ] Duration is exactly 90 seconds

### Device Testing
- [ ] Plays on desktop/laptop
- [ ] Plays on phone (YouTube)
- [ ] Plays on tablet
- [ ] Plays on TV (optional)

## Post-Render Steps

### Organization
- [ ] Move `output.mp4` to a safe location
- [ ] Backup original file
- [ ] Rename to descriptive name: `tera-demo-video-1080p.mp4`
- [ ] Note creation date and settings

### Distribution Prep
- [ ] Create 15-second teaser clip (Scenes 1-2)
- [ ] Create 30-second highlight (best moments)
- [ ] Create YouTube thumbnail
- [ ] Write video description/captions
- [ ] Prepare social media posts

### Publishing
- [ ] Upload to YouTube
- [ ] Add to Tera landing page
- [ ] Share on LinkedIn
- [ ] Share on Twitter
- [ ] Share on other platforms

## Troubleshooting

If something goes wrong:

| Issue | Solution |
|-------|----------|
| Preview blank | Restart: `npm run remotion:preview` |
| Preview error | Check console, verify all imports |
| Render fails | Close other apps, try 1080p, reduce quality |
| Audio missing | Check file path, ensure uncommented |
| Colors wrong | Hard refresh (Ctrl+Shift+R), check monitor |
| Slow rendering | Close apps, render at 1080p, use `--quality 50` |
| File corrupted | Re-render, verify output plays immediately |

## Success Indicators

You'll know it worked when:

✅ `output.mp4` exists in project root
✅ File is 30-200MB (depending on quality)
✅ Video plays without errors
✅ All 90 seconds present
✅ Animations smooth (30 FPS)
✅ Colors accurate
✅ Audio synced (if enabled)
✅ Text readable on all devices

## Final Approval

Before sharing publicly:

- [ ] Watched entire video 2+ times
- [ ] Checked on different devices
- [ ] Audio levels appropriate
- [ ] No embarrassing mistakes
- [ ] Branding matches Tera
- [ ] Call-to-action clear
- [ ] Video represents Tera well
- [ ] Ready to share!

---

## Important Notes

**Rendering Times:**
- First render may be slower (system caching)
- Subsequent renders use cached data (faster)
- 4K renders take significantly longer
- Close other apps to speed up

**File Management:**
- Keep backup of output.mp4
- Note settings used (quality, codec)
- Store in cloud for safety
- Document creation date

**Next Iterations:**
- Make notes of changes needed
- Plan edits for version 2
- Update this checklist for future renders

---

## You're Ready!

Follow this checklist and you'll have a professional demo video ready to showcase Tera.

**Next Action:** `npm run remotion:preview`

Good luck! 🚀
