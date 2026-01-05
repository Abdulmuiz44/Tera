'use client'

import React, { useEffect, useRef, useState } from 'react'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!containerRef.current) return

    try {
      setError(null)
      setIsLoading(true)

      if (language === 'html' || language === 'jsx' || language === 'javascript') {
        renderHTML()
      } else if (language === 'svg') {
        renderSVG()
      } else if (language === 'canvas' || language === 'javascript:canvas') {
        renderCanvas()
      } else {
        renderHTML() // Default to HTML
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to render visual'
      setError(errorMsg)
      console.error('Visual rendering error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [code, language])

  const renderHTML = () => {
    if (!containerRef.current) return

    // Create a sandboxed iframe to safely execute user code
    const iframe = document.createElement('iframe')
    iframe.sandbox.add('allow-scripts')
    iframe.style.border = 'none'
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.borderRadius = '8px'

    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(iframe)
    iframeRef.current = iframe

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) {
      setError('Cannot access iframe document')
      return
    }

    // Provide utilities and libraries via script tags
    const wrappedHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"><\/script>
        <script src="https://cdn.plot.ly/plotly-latest.min.js"><\/script>
        <script src="https://d3js.org/d3.v7.min.js"><\/script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"><\/script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"><\/script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { 
            width: 100%;
            height: 100%;
            background: #0a0a0a; 
            color: #ffffff; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
          }
          body { 
            padding: 20px;
            overflow: auto;
          }
          #root {
            width: 100%;
            min-height: 100%;
          }
          canvas { 
            display: block;
            max-width: 100%;
            height: auto;
          }
          svg {
            max-width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script>
          window.onerror = function(msg, url, lineNo, columnNo, error) {
            console.error('Global error:', msg, error);
            document.body.innerHTML = '<div style="color: #ff6b6b; padding: 20px; font-family: monospace; white-space: pre-wrap; word-break: break-word;">' + 
              'Error: ' + msg + 
              (error && error.stack ? '\\n\\nStack:\\n' + error.stack : '') + 
              '</div>';
            return false;
          };
          
          (function() {
            try {
              ${code}
            } catch (e) {
              console.error('Code execution error:', e);
              document.body.innerHTML = '<div style="color: #ff6b6b; padding: 20px; font-family: monospace; white-space: pre-wrap; word-break: break-word;">' + 
                'Error: ' + (e.message || e) + 
                (e.stack ? '\\n\\nStack:\\n' + e.stack : '') + 
                '</div>';
            }
          })();
        <\/script>
      </body>
      </html>
    `

    doc.open()
    doc.write(wrappedHTML)
    doc.close()
  }

  const renderSVG = () => {
    if (!containerRef.current) return

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 1000 600')
    svg.style.width = '100%'
    svg.style.height = '100%'
    svg.style.borderRadius = '12px'

    // Create SVG content safely
    try {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = code
      const svgContent = tempDiv.querySelector('svg') || tempDiv.innerHTML
      
      if (svgContent instanceof SVGElement) {
        containerRef.current.appendChild(svgContent)
      } else {
        svg.innerHTML = code
        containerRef.current.appendChild(svg)
      }
    } catch (err) {
      setError('Invalid SVG code')
    }
  }

  const renderCanvas = () => {
    if (!containerRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = 1000
    canvas.height = 600
    canvas.style.borderRadius = '12px'
    canvas.style.border = '1px solid rgba(255, 255, 255, 0.1)'
    canvas.style.display = 'block'
    canvas.style.maxWidth = '100%'
    canvas.style.height = 'auto'

    containerRef.current.appendChild(canvas)

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setError('Cannot get canvas context')
      return
    }

    try {
      new Function('canvas', 'ctx', code)(canvas, ctx)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Canvas rendering failed')
    }
  }

  const handleDownload = () => {
    if (iframeRef.current?.contentDocument?.documentElement) {
      const html = iframeRef.current.contentDocument.documentElement.outerHTML
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.replace(/\s+/g, '_')}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleRefresh = () => {
    setIsLoading(true)
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }
    setTimeout(() => {
      if (containerRef.current) {
        try {
          renderHTML()
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to render visual'
          setError(errorMsg)
        } finally {
          setIsLoading(false)
        }
      }
    }, 100)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    // Show toast would be nice, but keeping it simple for now
  }

  const handleFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen().catch(err => console.error(err))
    }
  }

  return (
    <div className="w-full my-4 space-y-3">
      {/* Code Section */}
      <div className="rounded-lg border border-white/10 bg-[#0a0a0a]/60 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            📝 {title} Code
          </h3>
          <button
            onClick={handleCopyCode}
            className="p-1.5 text-white/40 hover:text-tera-neon transition-colors"
            title="Copy code"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3.75H19.5A2.25 2.25 0 0121.75 6v10.5A2.25 2.25 0 0119.5 18.75h-2.25m-16.5 0h2.25m0 0v2.25m0-2.25v-8.25m0 0H3.75A2.25 2.25 0 015.25 5.25H7.5" />
            </svg>
          </button>
        </div>
        <pre className="p-4 text-xs text-white/70 overflow-x-auto max-h-[200px]">
          <code>{code}</code>
        </pre>
      </div>

      {/* Visual Rendering Section */}
      <div className="rounded-xl border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
            <span>✨</span>
            Generated Visual
          </h3>
          <div className="flex items-center gap-2">
            {error && (
              <div className="flex items-center gap-1 text-red-400 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c.866-1.5 2.845-2.751 5.169-2.751s4.303 1.253 5.169 2.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-9a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                </svg>
                Error
              </div>
            )}
            {!error && (
              <>
                <button
                  onClick={handleRefresh}
                  className="p-2 text-white/40 hover:text-tera-neon transition-colors"
                  title="Refresh"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>
                <button
                  onClick={handleFullscreen}
                  className="p-2 text-white/40 hover:text-tera-neon transition-colors"
                  title="Fullscreen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-white/40 hover:text-tera-neon transition-colors"
                  title="Download"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.72-4.72a.75.75 0 011.06 0l4.72 4.72M9 18.75h6" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Visual Container */}
        <div className="relative overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center bg-gradient-to-b from-black/30 to-black/60 py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-tera-neon rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-tera-neon rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-tera-neon rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-white/70 text-sm font-medium">Processing visual code...</span>
              </div>
            </div>
          )}

          {error ? (
            <div className="p-6 bg-red-500/10 border border-red-500/20">
              <div className="flex gap-3 text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0 mt-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c.866-1.5 2.845-2.751 5.169-2.751s4.303 1.253 5.169 2.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-9a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                </svg>
                <div>
                  <p className="font-semibold text-sm">Error Rendering Visual</p>
                  <p className="text-xs mt-1 text-red-300/80 font-mono">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="w-full min-h-[400px] max-h-[800px] bg-[#0a0a0a]"
              style={{ aspectRatio: '16/9' }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
