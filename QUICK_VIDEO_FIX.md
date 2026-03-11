# Quick Video Fix - 3 Steps

## Problem
❌ No voice/audio in video  
❌ Video won't play locally  

## Solution

### 1. Add Background Music (5 min)
```
1. Download 90-second instrumental MP3 from:
   - Pixabay: https://pixabay.com/music/
   - YouTube Audio Library: https://www.youtube.com/audiolibrary/music
   
2. Save to: remotion/assets/audio/background-music.mp3
```

### 2. Add Voiceover (10 min)
```
Option A: ElevenLabs (Best Quality)
  1. Sign up: https://elevenlabs.io/sign-up (free tier)
  2. Text-to-speech using this script:

    from elevenlabs import generate, save
    
    script = """Learn anything. Master everything. Powered by AI.
    Learning is hard. Getting help shouldn't be. Whether you're a student, 
    teacher, or professional, Tera adapts to your needs.
    Ask anything, get instant AI-powered answers with citations from trusted sources.
    Search the web for real-time information, always with verified sources.
    Specialized tools for every learning need. Lesson plans, worksheets, quizzes.
    Simple, transparent pricing. Plans for everyone. Free forever.
    Available on web and mobile. iOS, Android, and desktop.
    Ready to transform your learning? Start free today. teraai dot chat."""
    
    audio = generate(text=script, voice="Rachel")
    save(audio, "remotion/assets/audio/voiceover.mp3")

Option B: Google Cloud TTS or Adobe Express
  - Free options available
  - Save output as: remotion/assets/audio/voiceover.mp3
```

### 3. Render Video with Audio
```bash
npm run remotion:render
```

Then (if video won't play):
```bash
# Install FFmpeg first
# Windows: choco install ffmpeg
# macOS: brew install ffmpeg

python scripts/fix_video_codec.py
```

## Expected Results
✅ Video with background music (0.5 volume)  
✅ Clear voiceover (0.8 volume)  
✅ Plays on all devices (Windows, Mac, iOS, Android)  

## Done!
Your `output.mp4` is ready to share.

---
See `VIDEO_FIX_GUIDE.md` for detailed instructions and troubleshooting.
