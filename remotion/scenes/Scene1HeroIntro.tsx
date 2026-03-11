import React from 'react';
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { COLORS } from '../utils/colors';
import { fadeIn, scaleIn, pulse } from '../utils/animations';

// SVG Logo Component
const TeraLogo: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer circle */}
    <circle cx="100" cy="100" r="95" stroke="#ffffff" strokeWidth="8" />
    
    {/* Letter T */}
    <g>
      {/* Top horizontal bar */}
      <rect x="60" y="50" width="80" height="12" fill="#ffffff" />
      {/* Vertical bar */}
      <rect x="90" y="62" width="20" height="80" fill="#ffffff" />
    </g>
  </svg>
);

export const Scene1HeroIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneDuration = 150;

  // Hero title spring animation
  const titleScale = spring({
    frame: frame,
    fps: fps,
    config: {
      damping: 10,
      mass: 1.2,
      overshootClamping: false,
      restSpeedThreshold: 0.001,
      restDisplacementThreshold: 0.001,
    },
    delay: 10,
  });

  const titleOpacity = interpolate(frame, [10, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const subtitleOpacity = interpolate(frame, [50, 85], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Logo animation with pulse
  const logoScale = spring({
    frame: frame,
    fps: fps,
    config: {
      damping: 8,
      mass: 1,
      overshootClamping: false,
      restSpeedThreshold: 0.001,
      restDisplacementThreshold: 0.001,
    },
    delay: 80,
  });

  const logoPulse = pulse(frame - 80, 0.08);
  const logoOpacity = interpolate(frame, [80, 110], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const ctaOpacity = interpolate(frame, [100, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.darkGradient,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Animated background elements - subtle for B&W */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
          top: '-10%',
          left: '-5%',
          filter: 'blur(80px)',
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200, 200, 200, 0.05) 0%, transparent 70%)',
          bottom: '-15%',
          right: '-10%',
          filter: 'blur(100px)',
          opacity: 0.5,
        }}
      />

      {/* Main content with animations */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: '1200px',
          padding: '0 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px',
        }}
      >
        {/* Main Title */}
        <h1
          style={{
            fontSize: '88px',
            fontWeight: 900,
            color: '#ffffff',
            margin: 0,
            lineHeight: '1.1',
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
            letterSpacing: '-3px',
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
          }}
        >
          Learn Anything.{' '}
          <span
            style={{
              color: '#ffffff',
              opacity: 0.9,
            }}
          >
            Master Everything.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '40px',
            fontWeight: 300,
            color: '#c0c0c0',
            margin: 0,
            opacity: subtitleOpacity,
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            letterSpacing: '0.5px',
          }}
        >
          Your AI Learning Companion
        </p>

        {/* Tera Logo - SVG */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale * logoPulse})`,
            display: 'inline-block',
            filter: `drop-shadow(0 10px 40px rgba(255, 255, 255, 0.3))`,
          }}
        >
          <TeraLogo size={140} />
        </div>

        {/* CTA Text */}
        <div
          style={{
            opacity: ctaOpacity,
            fontSize: '18px',
            color: '#808080',
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            letterSpacing: '1px',
          }}
        >
          Free • Powerful • Always Learning
        </div>
      </div>

      {/* Decorative animated particles */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${4 + i * 2}px`,
            height: `${4 + i * 2}px`,
            borderRadius: '50%',
            background: '#ffffff',
            top: `${15 + i * 15}%`,
            left: `${10 + i * 18}%`,
            opacity: 0.2 + i * 0.08,
            animation: `float ${6 + i}s ease-in-out infinite`,
          }}
        />
      ))}

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-40px) translateX(20px);
          }
        }
      `}</style>
    </AbsoluteFill>
  );
};
