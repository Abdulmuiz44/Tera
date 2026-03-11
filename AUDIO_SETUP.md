# Audio Setup for Tera Demo Video

## Background Music

Your Remotion video needs background music. Here's how to add it:

### Step 1: Get Audio Files

Choose one of these sources for royalty-free background music:

**Free Options:**
- **Pixabay Music** - https://pixabay.com/music/
- **Incompetech** - https://incompetech.com/
- **YouTube Audio Library** - https://www.youtube.com/audiolibrary/music
- **Freepik** - https://www.freepik.com/videos/stock-music (some free tracks)

**Premium Options (Recommended):**
- **Epidemic Sound** - https://www.epidemicsound.com/ (15,000+ tracks)
- **Artlist** - https://artlist.io/ (20,000+ tracks)
- **AudioJungle** - https://audiojungle.net/

### Step 2: Music Recommendations

For Tera's vibe, look for:
- **Tempo:** 110-130 BPM (uplifting, energetic)
- **Genre:** Electronic, ambient pop, modern corporate
- **Mood:** Inspiring, positive, forward-thinking
- **Duration:** Exactly 90 seconds (or loop-able)
- **Vocals:** Instrumental preferred (keeps focus on visuals)

**Popular Tracks That Match Tera:**
- "Sunny Days" by Anno Domini Beats
- "Inspire" by Anno Domini Beats (Epidemic Sound)
- "Future" by Lil Viola (YouTube Audio Library)
- "Bright Future" by Michael Christoffersen (Incompetech)
- "Energetic" by Kevin MacLeod (Incompetech)

### Step 3: Add Audio to Your Project

1. **Create audio directory:**
   ```bash
   mkdir -p remotion/assets/audio
   ```

2. **Add your audio file:**
   ```
   remotion/assets/audio/background-music.mp3
   ```

3. **Update the audio config** in `remotion/utils/audio.ts`:
   - Set the correct path
   - Adjust volume (0-1 scale)
   - Set duration to 90 (full video length)

### Step 4: Import Audio in TeraDemo

Update `remotion/TeraDemo.tsx`:

```typescript
import { Audio } from 'remotion';
import { AUDIO_CONFIG } from './utils/audio';

// Inside your MainVideo component:
<Audio 
  src={AUDIO_CONFIG.backgroundMusic.path}
  startFrom={0}
  volume={AUDIO_CONFIG.backgroundMusic.volume}
/>
```

## Sound Effects (Optional)

For a polished video, add subtle sound effects:

### Transition Whoosh
- Duration: ~0.3 seconds
- Volume: 0.3 (subtle)
- Times: Between scene transitions (5s, 10s, 25s, 35s, 55s, 70s, 80s)

### Pop Sounds
- Duration: ~0.2 seconds
- Volume: 0.2 (very subtle)
- When: Cards/tools appear on screen

### Success Chime
- Duration: ~1 second
- Volume: 0.4
- When: CTA button appears (Scene 8)

### Where to Find SFX:

- **Freesound.org** - https://freesound.org/
- **Zapsplat** - https://www.zapsplat.com/
- **Epidemic Sound** - Sound effects library included
- **Mixkit** - https://mixkit.co/free-sound-effects/
- **BBC Sound Effects** - https://www.bbc.co.uk/sounds/search?q=&category=sound-effects

## Voiceover (Optional)

If you want to add narration:

1. Write a script (90 seconds of narration)
2. Record or use text-to-speech:
   - **Google Cloud Text-to-Speech** - Free tier available
   - **ElevenLabs** - Realistic AI voices
   - **Adobe Express** - Built-in text-to-speech
3. Add to `remotion/assets/audio/voiceover.mp3`
4. Enable in `AUDIO_CONFIG`

### Sample Script (if needed):

```
Scene 1 (0-5s): "Learn anything. Master everything. Powered by AI."

Scene 2 (5-10s): "Learning is hard. Getting help shouldn't be. 
Whether you're a student, teacher, or professional, Tera adapts to your needs."

Scene 3 (10-25s): "Ask anything, get instant AI-powered answers with citations 
from trusted sources like Grokipedia."

Scene 4 (25-35s): "Search the web for real-time information, 
always with verified sources and proper citations."

Scene 5 (35-55s): "Specialized tools for every learning need. 
Lesson plans, worksheets, quizzes, rubrics, and more."

Scene 6 (55-70s): "Simple, transparent pricing. Plans for everyone. 
Free forever, or upgrade to Pro or Plus."

Scene 7 (70-80s): "Available on web and mobile. iOS, Android, and desktop. 
Sync everywhere, learn everywhere."

Scene 8 (80-90s): "Ready to transform your learning? Start free today. 
No credit card required. Visit teraai.chat"
```

## Testing Audio

1. **Preview with audio:**
   ```bash
   npm run remotion:preview
   # Then select TeraDemoVideo composition and play
   ```

2. **Render with audio:**
   ```bash
   npm run remotion:render
   # Audio will be included automatically if configured
   ```

## Troubleshooting

**Audio not playing in preview:**
- Check file path in `audio.ts`
- Ensure file is in `remotion/assets/audio/`
- Verify browser audio permissions

**Audio quality issues:**
- Use MP3 format (most compatible)
- 128-192 kbps bitrate is sufficient
- Sample rate: 44100 Hz or 48000 Hz

**Volume too loud/quiet:**
- Adjust `volume` in `AUDIO_CONFIG` (0 = silent, 1 = max)
- Typical background music: 0.5-0.7
- Sound effects: 0.2-0.4

## Recommended Setup

For best results:
1. **Background music:** 60 seconds of intro, 30 seconds of outro/finale
2. **Subtle SFX:** Whooshes between scenes (very quiet)
3. **No voiceover:** Keeps video short and punchy
4. **Total audio:** ~90 seconds, perfectly synced

This creates a professional, modern demo video that showcases Tera effectively.
