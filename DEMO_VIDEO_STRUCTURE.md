# Tera Demo Video Structure (Remotion)

## Video Overview
- **Duration:** 90 seconds
- **Target:** Students, Teachers, Professionals
- **Tone:** Educational, inspiring, fast-paced

---

## Scene Breakdown

### Scene 1: Hero Intro (0-5s)
**Duration:** 5 seconds  
**Visual:**
- Animated gradient background (tera-neon to tera-bg)
- Large text: "Learn Anything. Master Everything."
- Subtitle: "Powered by AI"
- Tera logo appears with scale animation

**Animation:**
- Title slides in from bottom (Spring)
- Subtitle fades in below
- Logo bounces in

**Audio:** Uplifting music intro

---

### Scene 2: Problem Statement (5-10s)
**Duration:** 5 seconds  
**Visual:**
- Split screen showing 3 user personas:
  - 📚 Student (confused at desk)
  - 👨‍🏫 Teacher (overwhelmed with papers)
  - 💼 Professional (at computer)
- Text: "Learning is hard. Getting help shouldn't be."

**Animation:**
- Each persona image slides in from left/right
- Text animates word-by-word

---

### Scene 3: Chat Interface Demo (10-25s)
**Duration:** 15 seconds  
**Visual:**
- Animated chat window showing real conversation
- User message: "Explain photosynthesis"
- AI responds with formatted answer
- Grokipedia links highlighted with 📖 icon

**Animation:**
- Chat bubbles slide in smoothly
- Text types out naturally
- Links fade in with color highlight
- Smooth scroll through response

**Audio:** Subtle keyboard sounds, friendly voiceover: "Ask anything, get instant answers with AI"

---

### Scene 4: Web Search Feature (25-35s)
**Duration:** 10 seconds  
**Visual:**
- Chat window showing web search question
- Live search results appear inline
- Citation badges appear

**Animation:**
- Search query types out
- Results fade in one by one
- Citation badges pulse

**Audio:** "Real-time information from across the web"

---

### Scene 5: AI Tools Showcase (35-55s)
**Duration:** 20 seconds  
**Visual:**
- Grid layout showing 6 tools (appears in sequence):
  1. 📋 Lesson Plan Generator
  2. 📝 Worksheet & Quiz Generator
  3. 💡 Concept Explainer
  4. 📊 Rubric Builder
  5. 📧 Parent Communication
  6. 📈 Spreadsheet Editor

- Each tool has an icon and description
- Quick animation showing the tool in action

**Animation:**
- Tools pop in with scale + fade (staggered)
- Icons spin/rotate on entrance
- Text slides in beneath each tool

**Audio:** "Specialized tools for any learning need"

---

### Scene 6: Pricing Tiers (55-70s)
**Duration:** 15 seconds  
**Visual:**
- 3 pricing cards (Free / Pro / Plus) side-by-side
- Highlight key differences:
  - Free: Unlimited AI conversations, 5 web searches/month
  - Pro ($5): 100 web searches, Deep Research Mode
  - Plus ($15): Unlimited everything, Team collab, API access

**Animation:**
- Cards slide in from left/right alternating
- Checkmarks appear for included features
- Pro card has a subtle highlight/glow

**Audio:** "Plans for everyone"

---

### Scene 7: Mobile Experience (70-80s)
**Duration:** 10 seconds  
**Visual:**
- iPhone mockup showing Tera mobile app
- Quick swipe through 3 screens:
  1. Chat screen
  2. History
  3. Settings

**Animation:**
- Phone slides in from right
- Screens swipe left-to-right
- Content morphs between screens

**Audio:** "Available on web and mobile"

---

### Scene 8: Call-to-Action (80-90s)
**Duration:** 10 seconds  
**Visual:**
- Clean background with centered content
- "Ready to transform your learning?"
- Large button: "Start Free Today"
- URL: teraai.chat

**Animation:**
- Text animates in
- Button has hover state (grows slightly)
- URL appears at bottom with fade

**Audio:** "Join thousands of learners"

---

## Animation Patterns

### Transitions Between Scenes
- **Fade:** Default between most scenes (0.5s)
- **Slide:** For tool/pricing cards (0.3s per card)
- **Scale:** For introductions and highlights

### Text Animation
- **Typing effect:** For user queries
- **Word-by-word fade:** For explanations
- **Sequential stagger:** For lists/grids (100ms offset)

### Color Usage
- Primary: tera-neon (for highlights)
- Background: tera-bg
- Text: tera-primary
- Accents: Gradient backgrounds

---

## Technical Notes

### Video Specs
- Resolution: 1920x1080 (16:9)
- FPS: 30
- Codec: H.264

### Remotion Components Needed
1. `Composition` - Main video container
2. `Sequence` - Each scene
3. `interpolate` - Smooth value changes
4. `Spring` - Bouncy animations
5. `AbsoluteFill` - Positioning
6. `Img` - User persona images
7. `Audio` - Background music

### Assets to Prepare
- Logo (SVG)
- User persona illustrations (3x)
- Tool icons (6x)
- Background gradient texture
- Audio track (90s)
- Font files (for title text)

---

## Total Duration
- Scene 1: 5s
- Scene 2: 5s
- Scene 3: 15s
- Scene 4: 10s
- Scene 5: 20s
- Scene 6: 15s
- Scene 7: 10s
- Scene 8: 10s
- **TOTAL: 90 seconds**
