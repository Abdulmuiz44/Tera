'use client'

import { useEffect, useState, useRef } from 'react'

type VoiceControlsProps = {
    text: string
    messageId: string
}

export default function VoiceControls({ text, messageId }: VoiceControlsProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
    const [selectedVoice, setSelectedVoice] = useState<string>('')
    const [speed, setSpeed] = useState(1.0)
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
    const [showControls, setShowControls] = useState(false)

    useEffect(() => {
        if ('speechSynthesis' in window) {
            const loadVoices = () => {
                const availableVoices = window.speechSynthesis.getVoices()
                setVoices(availableVoices)

                // Select default English voice
                const defaultVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0]
                if (defaultVoice) {
                    setSelectedVoice(defaultVoice.name)
                }
            }

            loadVoices()
            window.speechSynthesis.onvoiceschanged = loadVoices
        }

        return () => {
            if (utteranceRef.current) {
                window.speechSynthesis.cancel()
            }
        }
    }, [])

    const handlePlay = () => {
        if (isPaused) {
            window.speechSynthesis.resume()
            setIsPaused(false)
            setIsPlaying(true)
        } else {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            utteranceRef.current = utterance

            // Apply settings
            utterance.rate = speed
            const voice = voices.find(v => v.name === selectedVoice)
            if (voice) {
                utterance.voice = voice
            }

            utterance.onstart = () => {
                setIsPlaying(true)
                setIsPaused(false)
            }

            utterance.onend = () => {
                setIsPlaying(false)
                setIsPaused(false)
            }

            utterance.onerror = () => {
                setIsPlaying(false)
                setIsPaused(false)
            }

            window.speechSynthesis.speak(utterance)
        }
    }

    const handlePause = () => {
        window.speechSynthesis.pause()
        setIsPaused(true)
        setIsPlaying(false)
    }

    const handleStop = () => {
        window.speechSynthesis.cancel()
        setIsPlaying(false)
        setIsPaused(false)
    }

    if (!('speechSynthesis' in window)) {
        return null // Browser doesn't support speech synthesis
    }

    return (
        <div className="mt-3 flex items-center gap-2">
            {/* Compact toggle button */}
            <button
                onClick={() => setShowControls(!showControls)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 text-xs transition border border-white/10"
                title="Voice controls"
            >
                <span className="text-sm">🔊</span>
                {showControls ? 'Hide' : 'Voice'}
            </button>

            {showControls && (
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Play/Pause/Stop Controls */}
                    <div className="flex items-center gap-1">
                        {!isPlaying && !isPaused && (
                            <button
                                onClick={handlePlay}
                                className="p-1.5 rounded-lg bg-tera-neon/20 hover:bg-tera-neon/30 text-tera-neon transition"
                                title="Play"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                            </button>
                        )}

                        {isPlaying && (
                            <button
                                onClick={handlePause}
                                className="p-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 transition"
                                title="Pause"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                                </svg>
                            </button>
                        )}

                        {isPaused && (
                            <button
                                onClick={handlePlay}
                                className="p-1.5 rounded-lg bg-tera-neon/20 hover:bg-tera-neon/30 text-tera-neon transition"
                                title="Resume"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                            </button>
                        )}

                        {(isPlaying || isPaused) && (
                            <button
                                onClick={handleStop}
                                className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-500 transition"
                                title="Stop"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5.25 3A2.25 2.25 0 003 5.25v9.5A2.25 2.25 0 005.25 17h9.5A2.25 2.25 0 0017 14.75v-9.5A2.25 2.25 0 0014.75 3h-9.5z" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Voice Selection */}
                    <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80 text-xs focus:border-tera-neon focus:outline-none hover:bg-white/10 transition"
                        disabled={isPlaying}
                    >
                        {voices.map((voice) => (
                            <option key={voice.name} value={voice.name} className="bg-tera-panel">
                                {voice.name} ({voice.lang})
                            </option>
                        ))}
                    </select>

                    {/* Speed Control */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-white/60">Speed:</label>
                        <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.1"
                            value={speed}
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-20 accent-tera-neon"
                            disabled={isPlaying}
                        />
                        <span className="text-xs text-white/60 w-8">{speed.toFixed(1)}x</span>
                    </div>
                </div>
            )}
        </div>
    )
}
