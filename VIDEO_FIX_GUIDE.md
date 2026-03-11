# Video Fix Guide - Add Voice & Fix Playback

Your video has two issues:
1. **No audio/voice** - Audio tracks are not included
2. **Codec incompatibility** - Video won't play on some devices

## Step 1: Add Background Music (5 minutes)

### Option A: Use Pixabay Music (Easiest)
1. Go to https://pixabay.com/music/
2. Search for: "uplifting", "energetic", "corporate"
3. Download a 90-second instrumental track (MP3)
4. Create folder: `remotion/assets/audio/`
5. Save file as: `remotion/assets/audio/background-music.mp3`

### Option B: Use YouTube Audio Library
1. Go to https://www.youtube.com/audiolibrary/music
2. Sign in to your Google account
3. Search for: "uplifting", "energetic", "modern"
4. Download 90-second instrumental MP3
5. Save as: `remotion/assets/audio/background-music.mp3`

## Step 2: Add Voiceover (10-15 minutes)

Choose one method:

### Option A: ElevenLabs (Recommended - Most Natural)
1. Sign up at https://elevenlabs.io/sign-up
2. Get free credits (~50k characters)
3. Use this Python script to generate:

```bash
pip install elevenlabs
```

Create `scripts/generate_voiceover_elevenlabs.py`:
```python
from elevenlabs import generate, save
from elevenlabs.api import API

# Your script from AUDIO_SETUP.md
script = """
Learn anything. Master everything. Powered by AI.
Learning is hard. Getting help shouldn't be. Whether you're a student, teacher, or professional, Tera adapts to your needs.
Ask anything, get instant AI-powered answers with citations from trusted sources.
Search the web for real-time information, always with verified sources.
Specialized tools for every learning need. Lesson plans, worksheets, quizzes, rubrics, and more.
Simple, transparent pricing. Plans for everyone. Free forever, or upgrade to Pro or Plus.
Available on web and mobile. iOS, Android, and desktop. Sync everywhere, learn everywhere.
Ready to transform your learning? Start free today. No credit card required. Visit teraai dot chat.
"""

audio = generate(text=script, voice="Rachel")  # or try "Adam", "Bella"
save(audio, "remotion/assets/audio/voiceover.mp3")
```

Run it:
```bash
python scripts/generate_voiceover_elevenlabs.py
```

### Option B: Google Cloud Text-to-Speech
1. Set up Google Cloud project: https://cloud.google.com/docs/authentication/getting-started
2. Create service account and download JSON key
3. Set environment variable: `GOOGLE_APPLICATION_CREDENTIALS=your-key.json`
4. Install: `pip install google-cloud-texttospeech`
5. Run script to generate voiceover

### Option C: Adobe Express / Other TTS Tools
1. Go to https://www.adobe.com/express/feature/text-to-speech
2. Paste voiceover script
3. Choose voice and generate
4. Download as MP3
5. Save as: `remotion/assets/audio/voiceover.mp3`

## Step 3: Enable Audio in Video Composition

Audio is already configured in the updated `remotion/TeraDemo.tsx`. 
Just ensure audio files are in the right place:
- `remotion/assets/audio/background-music.mp3` ✓
- `remotion/assets/audio/voiceover.mp3` ✓ (once generated)

## Step 4: Render Video with Audio

```bash
npm run remotion:render
```

This will:
- Create new `output.mp4` with audio included
- Include background music (0.5 volume)
- Include voiceover (0.8 volume)

## Step 5: Fix Video Codec for Playback (Optional but Recommended)

If your video doesn't play locally, convert it to universal H.264 format:

### Option A: Using FFmpeg (Recommended)

Install FFmpeg:
- **Windows**: `choco install ffmpeg`
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt-get install ffmpeg`

Then run:
```bash
python scripts/fix_video_codec.py
```

This converts `output.mp4` to:
- Video: H.264 (compatible with all players)
- Audio: AAC (standard format)
- Player: Works on Windows, Mac, Linux, iOS, Android

### Option B: Using Online Tool
1. Upload `output.mp4` to https://cloudconvert.com
2. Convert to "MP4 - MPEG-4 Video"
3. Settings: Video codec: H.264, Audio codec: AAC
4. Download fixed video

### Option C: Using VLC
1. Open `output.mp4` in VLC Media Player
2. Media → Convert
3. Profile: "Video - H.264 + MP3 (MP4)"
4. Save as `output_fixed.mp4`

## Quick Checklist

- [ ] Background music downloaded and saved to `remotion/assets/audio/background-music.mp3`
- [ ] Voiceover generated and saved to `remotion/assets/audio/voiceover.mp3`
- [ ] Run `npm run remotion:render` to create video with audio
- [ ] (Optional) Run `python scripts/fix_video_codec.py` to fix codec issues
- [ ] Test playing `output.mp4` locally

## Testing

### Preview Video with Audio
```bash
npm run remotion:preview
```
Select "TeraDemoVideo" and watch to verify audio plays.

### Test Local Playback
Open `output.mp4` in:
- Windows Media Player
- VLC Media Player
- QuickTime (macOS)
- Your phone

## Troubleshooting

**Audio not playing in preview?**
- Check file paths in `remotion/utils/audio.ts`
- Ensure files are in `remotion/assets/audio/`
- Disable browser audio blocking

**Video won't play on phone?**
- Run codec fix script: `python scripts/fix_video_codec.py`
- Check file size (should be under 100 MB)
- Try uploading to YouTube to test

**Audio is too loud/quiet?**
- Edit `remotion/utils/audio.ts`
- Adjust `volume` values (0-1 scale)
- Background: 0.5 is recommended
- Voiceover: 0.8 is recommended
- Re-render: `npm run remotion:render`

**Video takes too long to render?**
- Normal for 90 seconds with audio (5-10 minutes on most machines)
- Make sure no other apps are using CPU
- Close heavy applications

## File Structure

After setup, your audio files should be:
```
remotion/
├── assets/
│   └── audio/
│       ├── background-music.mp3  (90 seconds)
│       ├── voiceover.mp3         (90 seconds)
│       └── (optional sound effects)
├── TeraDemo.tsx                  (updated)
├── utils/
│   └── audio.ts                  (new)
└── ...
```

## Next Steps

Once video is complete:
1. Upload to YouTube for unlimited playback
2. Share on social media
3. Use for marketing/demos
4. Get feedback on content

Good luck!
