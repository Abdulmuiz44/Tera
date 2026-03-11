/**
 * Audio configuration for Tera demo video
 */

export const AUDIO_CONFIG = {
  backgroundMusic: {
    path: '/audio/background-music.mp3',
    volume: 0.5,
    startFrame: 0,
  },
  voiceover: {
    path: '/audio/voiceover.mp3',
    volume: 0.8,
    startFrame: 0,
  },
  soundEffects: {
    whoosh: {
      path: '/audio/whoosh.mp3',
      volume: 0.3,
    },
    pop: {
      path: '/audio/pop.mp3',
      volume: 0.2,
    },
    chime: {
      path: '/audio/chime.mp3',
      volume: 0.4,
    },
  },
};

/**
 * Helper function to enable/disable audio tracks
 */
export const useAudio = {
  background: true,
  voiceover: true,
  effects: true,
};
