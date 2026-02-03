'use client'

import React, { useEffect, useState } from 'react'

interface UniversalVisualRendererProps {
  code: string
  language?: string
  title?: string
}

export default function UniversalVisualRenderer({
  code,
  language = 'html',
  title = 'Generated Visual'
}: UniversalVisualRendererProps) {
  const [srcDoc, setSrcDoc] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setError(null)

      // Determine if we need to wrap code for canvas/script execution
      // or if it's full HTML
      const isFullHtml = code.includes('<!DOCTYPE html>') || code.includes('<html')

      let finalHtml = ''

      if (isFullHtml) {
        finalHtml = code
      } else {
        // Construct a robust environment with common libraries
        const htmlStart = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <!-- Libraries -->
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
            <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
            <script src="https://d3js.org/d3.v7.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
            <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
            
            <style>
              html, body { 
                width: 100%; height: 100%; margin: 0; padding: 0;
                background: #0a0a0a; color: #ffffff;
                font-family: -apple-system, system-ui, sans-serif;
                overflow: auto;
              }
              body { padding: 1rem; box-sizing: border-box; }
              #root { 
                width: 100%; min-height: 100%; 
                display: flex; flex-direction: column; align-items: center; justify-content: center;
              }
              canvas { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <div id="root">
              <!-- Default Canvas for script usage -->
              <canvas id="canvas"></canvas>
            </div>
            <script>
              // Error Handling
              window.onerror = function(msg, url, line, col, error) {
                document.body.innerHTML = '<div style="color:#ff6b6b;padding:20px;font-family:monospace;white-space:pre-wrap;">' + 
                  'Runtime Error: ' + msg + '</div>';
              };
            </script>
        `

        let scriptContent = code
        // Simple heuristic: if code looks like just JS (no tags), wrap in <script>
        if (!code.trim().startsWith('<')) {
          scriptContent = `<script>\n(function(){\ntry{\n${code}\n}catch(e){console.error(e);throw e;}\n})()\n</script>`
        }

        finalHtml = htmlStart + `\n` + scriptContent + `\n</body></html>`
      }

      setSrcDoc(finalHtml)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to prepare visual')
    }
  }, [code, language])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="w-full my-4 space-y-3">
      {/* Header */}
      <div className="rounded-t-lg border border-white/10 bg-white/5 flex items-center justify-between px-4 py-2">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          📝 {title}
        </h3>
        <button
          onClick={handleCopyCode}
          className="p-1.5 text-white/40 hover:text-tera-neon transition-colors"
          title="Copy code"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Main Container */}
      <div className="rounded-b-xl border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-lg h-[500px] relative">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-red-400 bg-red-500/10">
            <p>Renderer Error: {error}</p>
          </div>
        ) : (
          <iframe
            srcDoc={srcDoc}
            title="Generated Visual"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-presentation"
          />
        )}
      </div>
    </div>
  )
}
