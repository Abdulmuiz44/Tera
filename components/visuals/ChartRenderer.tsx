"use client"

import React from 'react'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts'

interface ChartData {
    type: 'line' | 'bar' | 'area' | 'pie'
    title?: string
    xAxisKey?: string
    data: any[]
    series: Array<{
        key: string
        color: string
        name?: string
    }>
}

interface ChartRendererProps {
    config: ChartData
}

const COLORS = ['#00FFA3', '#00B8D9', '#FF5630', '#FFAB00', '#36B37E', '#6554C0']

export default function ChartRenderer({ config }: ChartRendererProps) {
    const { type, data, series, xAxisKey = 'name', title } = config

    const renderChart = () => {
        switch (type) {
            case 'line':
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey={xAxisKey} stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                            itemStyle={{ color: '#fff' }}
                        />
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
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey={xAxisKey} stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                            itemStyle={{ color: '#fff' }}
                        />
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
                return (
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey={xAxisKey} stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                            itemStyle={{ color: '#fff' }}
                        />
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
            case 'pie':
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
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    </PieChart>
                )
            default:
                return null
        }
    }

    return (
        <div className="w-full my-4 rounded-xl border border-white/10 bg-[#0A0A0A] p-4 shadow-lg overflow-hidden">
            {title && (
                <h3 className="mb-4 text-sm font-semibold text-white/80 uppercase tracking-wider text-center">
                    {title}
                </h3>
            )}
            <div className="h-[300px] w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart() || <div className="flex items-center justify-center h-full text-white/40">Invalid Chart Config</div>}
                </ResponsiveContainer>
            </div>
        </div>
    )
}
