#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const VOICEOVER_SCRIPT = [
    { text: "Learn anything. Master everything. Powered by AI.", timing: "0-5s" },
    { text: "Learning is hard. Getting help shouldn't be. Whether you're a student, teacher, or professional, Tera adapts to your needs.", timing: "5-10s" },
    { text: "Ask anything, get instant AI-powered answers with citations from trusted sources.", timing: "10-25s" },
    { text: "Search the web for real-time information, always with verified sources.", timing: "25-35s" },
    { text: "Specialized tools for every learning need. Lesson plans, worksheets, quizzes, rubrics, and more.", timing: "35-55s" },
    { text: "Simple, transparent pricing. Plans for everyone. Free forever, or upgrade to Pro or Plus.", timing: "55-70s" },
    { text: "Available on web and mobile. iOS, Android, and desktop. Sync everywhere, learn everywhere.", timing: "70-80s" },
    { text: "Ready to transform your learning? Start free today. No credit card required. Visit teraai dot chat.", timing: "80-90s" }
];

function generateVoiceover() {
    console.log("Voiceover generation requires API setup.");
    console.log("\nOption 1: Use ElevenLabs (Recommended)");
    console.log("  - Sign up at https://elevenlabs.io");
    console.log("  - Get your API key");
    console.log("  - Use their Node SDK");
    console.log("\nOption 2: Use Google Cloud Text-to-Speech");
    console.log("  - Setup credentials at https://cloud.google.com/docs/authentication");
    console.log("\nFor now, using free alternatives...");

    const audioDir = path.join('remotion', 'assets', 'audio');
    if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
    }
    console.log(`\nAudio directory created: ${audioDir}`);
    return audioDir;
}

if (require.main === module) {
    console.log("=".repeat(60));
    console.log("TERA VOICEOVER GENERATOR");
    console.log("=".repeat(60));

    generateVoiceover();

    console.log("\nVoiceover Script:");
    console.log("-".repeat(60));
    VOICEOVER_SCRIPT.forEach((segment, index) => {
        console.log(`${index + 1}. [${segment.timing}] ${segment.text}`);
    });
    console.log("-".repeat(60));

    console.log("\nNext steps:");
    console.log("1. Download background music from Pixabay Music or YouTube Audio Library");
    console.log("2. Save as: remotion/assets/audio/background-music.mp3");
    console.log("3. Generate voiceover using ElevenLabs or Google Cloud TTS");
    console.log("4. Save as: remotion/assets/audio/voiceover.mp3");
}
