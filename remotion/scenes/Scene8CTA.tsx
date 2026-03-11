import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { COLORS } from '../utils/colors';
import { fadeIn, scaleIn, pulse } from '../utils/animations';

export const Scene8CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneDuration = 300;

  // Main title animations
  const titleOpacity = fadeIn(frame, 20, 35);
  const titleScale = scaleIn(frame, 20, 35, 0.8);

  // CTA button animations
  const buttonScale = spring({
    frame: frame - 80,
    fps: fps,
    config: {
      damping: 10,
      mass: 1.1,
      overshootClamping: false,
      restSpeedThreshold: 0.001,
      restDisplacementThreshold: 0.001,
    },
    delay: 0,
  });

  const buttonOpacity = fadeIn(frame, 80, 30);

  // Pulse effect on button
  const buttonPulse = pulse(frame - 80, 0.04);

  // Secondary text
  const subtitleOpacity = fadeIn(frame, 70, 30);

  // Background animation
  const bgRotation = interpolate(frame, [0, sceneDuration], [0, 10], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Floating particles
  const particlePositions = [...Array(6)].map((_, i) => ({
    x: interpolate(frame, [0, sceneDuration], [i * 50, i * 50 + 100], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    opacity: interpolate(frame, [0, sceneDuration / 2, sceneDuration], [0, 0.6, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  }));

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
      {/* Animated background orbs */}
      <div
        style={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(138, 43, 226, 0.3) 0%, transparent 70%)',
          top: '-15%',
          left: '-20%',
          filter: 'blur(100px)',
          opacity: 0.7,
          animation: `drift 8s ease-in-out infinite`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 110, 196, 0.25) 0%, transparent 70%)',
          bottom: '-10%',
          right: '-15%',
          filter: 'blur(80px)',
          opacity: 0.6,
          animation: `drift-reverse 10s ease-in-out infinite`,
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: '900px',
          padding: '0 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '40px',
        }}
      >
        {/* Main CTA Title */}
        <div>
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 900,
              color: '#ffffff',
              margin: '0 0 24px 0',
              opacity: titleOpacity,
              transform: `scale(${titleScale})`,
              lineHeight: '1.2',
              letterSpacing: '-2px',
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            Ready to{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #8a2be2 0%, #ff6ec4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Transform Your Learning?
            </span>
          </h1>

          <p
            style={{
              fontSize: '20px',
              color: COLORS.teraSecondary,
              margin: 0,
              opacity: subtitleOpacity,
              fontFamily: '"Inter", system-ui, sans-serif',
              letterSpacing: '0.5px',
            }}
          >
            Join thousands of students and educators using Tera today
          </p>
        </div>

        {/* CTA Button with animation */}
        <div
          style={{
            opacity: buttonOpacity,
            transform: `scale(${buttonScale * buttonPulse})`,
            transformOrigin: 'center center',
          }}
        >
          <button
            style={{
              padding: '18px 56px',
              borderRadius: '16px',
              border: 'none',
              backgroundColor: COLORS.teraNeon,
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: '"Inter", system-ui, sans-serif',
              boxShadow: '0 20px 60px rgba(138, 43, 226, 0.6)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
            disabled
          >
            Start Free Today
          </button>
        </div>

        {/* Secondary CTA */}
        <p
          style={{
            fontSize: '16px',
            color: COLORS.teraSecondary,
            margin: 0,
            opacity: fadeIn(frame, 140, 30),
            fontFamily: '"Inter", system-ui, sans-serif',
          }}
        >
          No credit card required • Forever free tier included
        </p>

        {/* Features grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '30px',
            marginTop: '30px',
            width: '100%',
            opacity: fadeIn(frame, 170, 40),
          }}
        >
          {[
            { icon: '⚡', text: 'Instant Answers' },
            { icon: '🎯', text: 'Personalized' },
            { icon: '🔒', text: 'Secure & Private' },
          ].map((feature, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '40px' }}>{feature.icon}</div>
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  color: COLORS.teraPrimary,
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontWeight: 600,
                }}
              >
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Animated particles floating around */}
      {particlePositions.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${3 + i * 1}px`,
            height: `${3 + i * 1}px`,
            borderRadius: '50%',
            background: i % 2 === 0 ? '#8a2be2' : '#ff6ec4',
            left: `calc(${pos.x}% - 50%)`,
            bottom: `${20 + (i % 3) * 25}%`,
            opacity: pos.opacity,
            filter: 'blur(1px)',
          }}
        />
      ))}

      {/* Animated logo/brand at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          opacity: fadeIn(frame, 200, 50),
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8a2be2 0%, #ff6ec4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
          }}
        >
          T
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            color: COLORS.teraSecondary,
            fontFamily: '"Inter", system-ui, sans-serif',
            fontWeight: 500,
          }}
        >
          teraai.chat
        </p>
      </div>

      <style>{`
        @keyframes drift {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(30px, -50px);
          }
        }
        
        @keyframes drift-reverse {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-30px, 50px);
          }
        }
      `}</style>
    </AbsoluteFill>
  );
};
