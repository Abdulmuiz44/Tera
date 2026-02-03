"use client"

import React, { useRef } from 'react'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ScatterChart,
    Scatter,
    ComposedChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    ZAxis
} from 'recharts'

interface ChartData {
    type: 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'scatter' | 'composed'
    title?: string
    xAxisKey?: string
    yAxisKey?: string
    zAxisKey?: string // For bubble charts or scatter weights
    data: any[]
    series: Array<{
        key: string
        color: string
        name?: string
        type?: 'line' | 'bar' | 'area' | 'scatter' // For composed charts
        data?: any[]
    }>
}

interface ChartRendererProps {
    config: ChartData
}

const COLORS = ['#00FFA3', '#00B8D9', '#FF5630', '#FFAB00', '#36B37E', '#6554C0', '#FF00E6', '#2979FF']

export default function ChartRenderer({ config }: ChartRendererProps) {
    // Helper to check data availability
    const hasRootData = Array.isArray(config?.data) && config.data.length > 0
    const hasSeries = Array.isArray(config?.series) && config.series.length > 0
    const firstSeries = config?.series?.[0] as any
    const hasNestedData = hasSeries && Array.isArray(firstSeries?.data)

    // Auto-generate series from data keys if series is missing but data is present
    let effectiveSeries = config?.series
    let effectiveData = config?.data

    if (hasRootData && !hasSeries) {
        // Infer series from data keys (exclude common axis keys)
        const axisKeys = ['name', 'label', 'category', 'date', 'year', 'month', 'x', 'axis', config?.xAxisKey].filter(Boolean) as string[]
        const firstDataItem = effectiveData?.[0] || {}
        const inferredSeriesKeys = Object.keys(firstDataItem).filter(k => {
            const val = firstDataItem[k]
            const keyLower = k.toLowerCase()
            if (axisKeys.includes(keyLower)) return false
            // Accept numbers OR numeric strings
            return typeof val === 'number' || (typeof val === 'string' && !isNaN(parseFloat(val)) && val.trim() !== '')
        })

        if (inferredSeriesKeys.length > 0) {
            effectiveSeries = inferredSeriesKeys.map((key, i) => ({
                key,
                color: COLORS[i % COLORS.length],
                name: key.charAt(0).toUpperCase() + key.slice(1)
            }))
        }
    }

    const hasEffectiveSeries = Array.isArray(effectiveSeries) && effectiveSeries.length > 0

    // Validate config - require either root data or nested series data
    if (!config || (!hasRootData && !hasNestedData) || !hasEffectiveSeries) {
        return (
            <div className="w-full my-4 rounded-xl border border-white/10 bg-[#0A0A0A] p-4 text-white/50 text-sm">
                <p className="font-semibold text-red-400">Chart Configuration Error</p>
                <p className="mt-1">Missing: {!hasRootData && !hasNestedData ? 'data array' : ''} {!hasEffectiveSeries ? 'series (could not infer from data)' : ''}</p>
                <pre className="mt-2 text-xs bg-black/30 p-2 rounded overflow-x-auto">{JSON.stringify(config, null, 2)}</pre>
            </div>
        )
    }

    // Initialize variables with defaults, using the potentially auto-generated series
    let { type, xAxisKey = 'name', yAxisKey, zAxisKey, title } = config
    let data = effectiveData
    let series = effectiveSeries

    // Normalize data: convert string numbers to actual numbers for Recharts
    if (Array.isArray(data)) {
        data = data.map(item => {
            const normalized: any = {}
            for (const [key, val] of Object.entries(item)) {
                if (typeof val === 'string' && !isNaN(parseFloat(val)) && val.trim() !== '' && key !== xAxisKey) {
                    normalized[key] = parseFloat(val)
                } else {
                    normalized[key] = val
                }
            }
            return normalized
        })
    }

    // Auto-transform nested series data to flat data (Recharts format) if root data is missing
    if (!hasRootData && hasNestedData) {
        const dataMap = new Map<string, any>()
        let detectedAxisKey = xAxisKey

        // First pass: Detect axis key from first item if default 'name' isn't found
        if (xAxisKey === 'name') {
            const firstItem = firstSeries.data[0] || {}
            // Find a key that is likely the axis (e.g. 'axis', 'category', 'year', 'date')
            // or just the first key that isn't 'value'
            const candidate = Object.keys(firstItem).find(k => k !== 'value')
            if (candidate) detectedAxisKey = candidate
            xAxisKey = detectedAxisKey
        }

        series.forEach((s: any) => {
            if (Array.isArray(s.data)) {
                s.data.forEach((item: any) => {
                    const axisValue = item[detectedAxisKey]
                    if (axisValue !== undefined) {
                        if (!dataMap.has(axisValue)) {
                            dataMap.set(axisValue, { [detectedAxisKey]: axisValue })
                        }
                        // Use the series key as the value key in the flat object
                        // If item has 'value', use it. Otherwise assume item is number/value?
                        let val = item.value !== undefined ? item.value : item

                        // Fix for "Objects are not valid as a React child":
                        // If val is still an object (e.g. {x, y} from scatter data), extract a primitive.
                        if (typeof val === 'object' && val !== null) {
                            if (Array.isArray(val)) val = val[1] // Handle [x, y] format
                            else val = val.y ?? val.value ?? val.count ?? val.score ?? val.amount ?? 0
                        }

                        dataMap.get(axisValue)[s.key] = val
                    }
                })
            }
        })
        data = Array.from(dataMap.values())
    }
    const chartRef = useRef<HTMLDivElement>(null)

    const handleDownload = () => {
        if (!chartRef.current) return

        const svg = chartRef.current.querySelector('svg')
        if (!svg) return

        // Create a canvas to draw the SVG
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const svgData = new XMLSerializer().serializeToString(svg)

        // Add minimal styling to ensure it looks good on white background if transparent
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)

        const img = new Image()
        img.onload = () => {
            canvas.width = svg.clientWidth || 600
            canvas.height = svg.clientHeight || 400
            if (ctx) {
                ctx.fillStyle = '#0A0A0A' // Match container bg
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(img, 0, 0)

                const pngUrl = canvas.toDataURL('image/png')
                const downloadLink = document.createElement('a')
                downloadLink.href = pngUrl
                downloadLink.download = `${title ? title.replace(/\s+/g, '_') : 'tera_chart'}.png`
                document.body.appendChild(downloadLink)
                downloadLink.click()
                document.body.removeChild(downloadLink)
                URL.revokeObjectURL(url)
            }
        }
        img.src = url
    }

    const normalizedType = (type || '').toLowerCase()

    const renderChart = () => {
        switch (normalizedType) {
            case 'line':
            case 'linechart':
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey={xAxisKey} stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        {series.map((s, i) => (
                            <Line
                                key={s.key}
                                type="monotone"
                                dataKey={s.key}
                                stroke={s.color || COLORS[i % COLORS.length]}
                                name={s.name || s.key}
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#111', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                )
            case 'bar':
            case 'barchart':
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey={xAxisKey} stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        {series.map((s, i) => (
                            <Bar
                                key={s.key}
                                dataKey={s.key}
                                fill={s.color || COLORS[i % COLORS.length]}
                                name={s.name || s.key}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}
                    </BarChart>
                )
            case 'area':
            case 'areachart':
                return (
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey={xAxisKey} stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        {series.map((s, i) => (
                            <Area
                                key={s.key}
                                type="monotone"
                                dataKey={s.key}
                                stroke={s.color || COLORS[i % COLORS.length]}
                                fill={s.color || COLORS[i % COLORS.length]}
                                fillOpacity={0.3}
                                name={s.name || s.key}
                            />
                        ))}
                    </AreaChart>
                )
            case 'radar':
            case 'radarchart':
                return (
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis dataKey={xAxisKey} tick={{ fill: '#888', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#888' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        {series.map((s, i) => (
                            <Radar
                                key={s.key}
                                name={s.name || s.key}
                                dataKey={s.key}
                                stroke={s.color || COLORS[i % COLORS.length]}
                                fill={s.color || COLORS[i % COLORS.length]}
                                fillOpacity={0.4}
                            />
                        ))}
                    </RadarChart>
                )
            case 'scatter':
            case 'scatterplot':
                return (
                    <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis type="number" dataKey={xAxisKey || 'x'} name={xAxisKey} stroke="#888" />
                        <YAxis type="number" dataKey={yAxisKey || 'y'} name="Y" stroke="#888" />
                        {zAxisKey && <ZAxis type="number" dataKey={zAxisKey} range={[60, 400]} name={zAxisKey} />}
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        {series.map((s, i) => (
                            <Scatter
                                key={s.key}
                                name={s.name || s.key}
                                data={s.data || data}
                                fill={s.color || COLORS[i % COLORS.length]}
                            />
                        ))}
                    </ScatterChart>
                )
            case 'composed':
            case 'composedchart':
            case 'combo':
                return (
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey={xAxisKey} stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        {series.map((s, i) => {
                            const color = s.color || COLORS[i % COLORS.length]
                            if (s.type === 'bar') return <Bar key={s.key} dataKey={s.key} fill={color} name={s.name || s.key} radius={[4, 4, 0, 0]} />
                            if (s.type === 'area') return <Area key={s.key} type="monotone" dataKey={s.key} fill={color} stroke={color} fillOpacity={0.3} name={s.name || s.key} />
                            return <Line key={s.key} type="monotone" dataKey={s.key} stroke={color} strokeWidth={2} dot={{ r: 4, fill: '#111' }} name={s.name || s.key} />
                        })}
                    </ComposedChart>
                )
            case 'pie':
            case 'piechart':
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey={series[0]?.key || 'value'}
                            nameKey={xAxisKey}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    </PieChart>
                )
            default:
                return null
        }
    }

    return (
        <div className="w-full my-4 space-y-3">
            {/* Code Section */}
            <div className="rounded-lg border border-white/10 bg-[#0a0a0a]/60 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                    <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                        📝 Chart Configuration (JSON)
                    </h3>
                </div>
                <pre className="p-4 text-xs text-white/70 overflow-x-auto max-h-[200px]">
                    <code>{JSON.stringify({ type, data, series, xAxisKey, yAxisKey }, null, 2)}</code>
                </pre>
            </div>

            {/* Chart Rendering Section */}
            <div ref={chartRef} className="w-full rounded-xl border border-white/10 bg-[#0A0A0A] p-4 shadow-lg overflow-hidden relative group">
                {title && (
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider text-center flex-1 flex items-center justify-center gap-2">
                            <span>✨</span>
                            {title}
                        </h3>
                        <button
                            onClick={handleDownload}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-white/40 hover:text-tera-neon"
                            title="Download Chart"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 12 12 16.5m0 0 4.5-4.5M12 16.5V3" />
                            </svg>
                        </button>
                    </div>
                )}
                <div className="h-[300px] w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart() || (
                            <div className="flex flex-col items-center justify-center h-full text-white/40 space-y-2">
                                <span>Invalid Chart Config</span>
                                <span className="text-xs font-mono text-white/20">
                                    Type received: {String(type || 'undefined')}
                                </span>
                            </div>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
