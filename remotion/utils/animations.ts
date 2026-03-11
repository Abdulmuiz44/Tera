import { interpolate, spring, Easing } from 'remotion';

export const springConfig = {
  bouncy: {
    damping: 8,
    mass: 1,
    overshootClamping: false,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
  },
  smooth: {
    damping: 15,
    mass: 1,
    overshootClamping: false,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
  },
  fast: {
    damping: 20,
    mass: 1,
    overshootClamping: false,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
  },
};

export const slideInFromLeft = (
  frame: number,
  startFrame: number,
  duration: number
) => {
  return interpolate(frame, [startFrame, startFrame + duration], [-500, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

export const slideInFromRight = (
  frame: number,
  startFrame: number,
  duration: number
) => {
  return interpolate(frame, [startFrame, startFrame + duration], [500, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

export const slideInFromTop = (
  frame: number,
  startFrame: number,
  duration: number
) => {
  return interpolate(frame, [startFrame, startFrame + duration], [-500, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

export const slideInFromBottom = (
  frame: number,
  startFrame: number,
  duration: number
) => {
  return interpolate(frame, [startFrame, startFrame + duration], [500, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

export const fadeIn = (
  frame: number,
  startFrame: number,
  duration: number
) => {
  return interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

export const fadeOut = (
  frame: number,
  startFrame: number,
  duration: number
) => {
  return interpolate(frame, [startFrame, startFrame + duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

export const scaleIn = (
  frame: number,
  startFrame: number,
  duration: number,
  startScale = 0.8
) => {
  return interpolate(frame, [startFrame, startFrame + duration], [startScale, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

export const scaleOut = (
  frame: number,
  startFrame: number,
  duration: number,
  endScale = 0.8
) => {
  return interpolate(frame, [startFrame, startFrame + duration], [1, endScale], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

export const rotateIn = (
  frame: number,
  startFrame: number,
  duration: number,
  startRotation = -180
) => {
  return interpolate(frame, [startFrame, startFrame + duration], [startRotation, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

export const bounce = (
  frame: number,
  startFrame: number,
  duration: number
) => {
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return Math.sin(progress * Math.PI) * 50;
};

export const pulse = (
  frame: number,
  speed = 0.05
) => {
  return 1 + Math.sin(frame * speed) * 0.1;
};

export const staggerChildren = (
  childIndex: number,
  staggerDelay: number
): number => {
  return childIndex * staggerDelay;
};

export const wave = (
  frame: number,
  startFrame: number,
  wavelength: number
) => {
  const progress = (frame - startFrame) / wavelength;
  return Math.sin(progress * Math.PI * 2) * 20;
};

export const parallax = (
  frame: number,
  startFrame: number,
  maxOffset: number,
  duration: number
) => {
  return interpolate(frame, [startFrame, startFrame + duration], [0, maxOffset], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};
