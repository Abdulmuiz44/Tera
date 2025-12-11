# Visualization Code Generation Guide

This guide helps users and the AI generate proper visualization code that Tera can render.

## How Visualizations Work

When a user asks for a visual, the AI should respond with a **code block** containing:
- Pure HTML/JavaScript
- Canvas drawing code
- SVG graphics
- Or combinations of the above

The code will be executed in a **sandboxed iframe** with access to libraries:
- **Three.js** - 3D graphics
- **D3.js** - Data visualization
- **Chart.js** - Charts and graphs
- **Plotly** - Interactive plots
- **Anime.js** - Animations

## Code Block Format

### For HTML/JavaScript Visualizations
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Your CSS here */
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    // Your JavaScript here - can use Three.js, D3.js, etc.
  </script>
</body>
</html>
```

### For Canvas-Based Visualizations
```javascript
// canvas and ctx are provided automatically
ctx.fillStyle = '#00ff00';
ctx.fillRect(10, 10, 100, 100);
// More drawing commands...
```

### For SVG Visualizations
```svg
<svg viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
  <circle cx="500" cy="300" r="100" fill="#00ff00" />
  <!-- More SVG elements -->
</svg>
```

## What Works ✅

### 3D Graphics (Three.js)
- Rotating globes
- Animated models
- Particle systems
- Lighting effects

Example prompt to AI:
> "Create an animated 3D globe with Three.js. The globe should have:
> - A textured sphere showing continents in green and ocean in blue
> - Slow rotation around Y axis
> - Stars in the background
> - Ambient and directional lighting
> - Window resize handling
> Return ONLY the complete HTML code in a code block."

### Data Visualizations (D3.js, Plotly)
- Interactive charts
- Network diagrams
- Animated transitions
- Custom visualizations

### Canvas Graphics
- Particle effects
- Fractals
- Real-time animations
- Custom drawing

### SVG Graphics
- Icons and logos
- Diagrams
- Scalable graphics
- Animated SVG elements

## What Doesn't Work ❌

### Don't Use:
- Mermaid diagrams (unless specifically requested)
- React/Vue components
- External API calls
- Form submissions
- Server-side code
- Node.js packages

### Invalid Responses:
```
// ❌ WRONG - This is a flowchart, not a visual
graph TD
    A[Start] --> B{Decision}
    B --> C[End]

// ❌ WRONG - This is React code (won't work)
export function Globe() {
  return <div>Globe</div>;
}

// ❌ WRONG - Missing <!DOCTYPE html>
<script>
  // Bare JS without HTML wrapper
</script>
```

## Proper Response Examples

### Example 1: Animated 3D Globe ✅
```html
<!DOCTYPE html>
<html>
<head>
  <style>body { margin: 0; overflow: hidden; background: #000; }</style>
</head>
<body>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script>
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create globe geometry
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);

    camera.position.z = 5;

    function animate() {
      requestAnimationFrame(animate);
      globe.rotation.y += 0.001;
      renderer.render(scene, camera);
    }
    animate();
  </script>
</body>
</html>
```

### Example 2: Canvas Animation ✅
```javascript
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
let time = 0;

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#00ff00';
  for (let i = 0; i < 100; i++) {
    const x = Math.sin(time * 0.01 + i) * 200 + canvas.width / 2;
    const y = Math.cos(time * 0.01 + i) * 200 + canvas.height / 2;
    ctx.fillRect(x, y, 10, 10);
  }
  
  time++;
  requestAnimationFrame(animate);
}
animate();
```

### Example 3: SVG Visualization ✅
```svg
<svg viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .spinner { animation: spin 2s linear infinite; }
    </style>
  </defs>
  <circle cx="500" cy="300" r="100" fill="none" stroke="#00ff00" stroke-width="20" class="spinner" />
</svg>
```

## How to Request Visualizations

### Good Prompts to Tera:
```
"Create an animated 3D globe with Earth texture using Three.js. Include stars, rotating animation, and realistic lighting."

"Build an interactive bar chart showing sales data with D3.js. Include smooth transitions and hover effects."

"Generate a canvas-based particle system with moving particles that bounce off walls."

"Make an SVG animated flowchart with connecting lines and animated nodes."
```

### Bad Prompts:
```
❌ "Create an animated globe" (too vague)
❌ "Make a flowchart" (returns Mermaid, not visual)
❌ "Build a dashboard" (too complex, needs clarification)
❌ "Create a visualization" (too generic)
```

## Debugging Failed Visuals

### If you see: "Failed to render diagram"
- The AI returned a Mermaid diagram instead of visualization code
- Ask again with specific instructions: "Use Three.js, not Mermaid"
- Specify: "Return HTML with <script> tags"

### If you see: "Invalid Chart Config"
- The code wasn't valid JSON for chart renderer
- Ask for HTML/Canvas code instead of JSON

### If nothing appears
- Check browser console (F12)
- Look for JavaScript errors
- The code might reference external resources that failed to load

## Testing Visualizations

You can test code locally before asking Tera:

1. Create an `.html` file
2. Copy the visualization code
3. Open in browser
4. If it works locally, Tera can render it

## Reference Files

- Example 3D globe: `public/examples/animated-3d-globe.html`
- Settings page: `app/settings/page.tsx`
- Renderer component: `components/visuals/UniversalVisualRenderer.tsx`

---

**Pro Tip**: Always ask for "complete HTML code" or "full JavaScript code" to ensure proper formatting!
