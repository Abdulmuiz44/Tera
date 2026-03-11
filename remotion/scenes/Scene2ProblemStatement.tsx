import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { COLORS } from '../utils/colors';
import { fadeIn, slideInFromLeft, slideInFromRight, scaleIn } from '../utils/animations';

const Problem: React.FC<{
  icon: string;
  title: string;
  description: string;
  startFrame: number;
}> = ({ icon, title, description, startFrame }) => {
  const frame = useCurrentFrame();

  const opacity = fadeIn(frame, startFrame, 20);
  const slideOffset = slideInFromLeft(frame, startFrame, 25);
  const scale = scaleIn(frame, startFrame, 25, 0.9);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '30px',
        opacity,
        transform: `translateX(${slideOffset}px) scale(${scale})`,
        transformOrigin: 'left center',
      }}
    >
      {/* Icon box */}
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* Text content */}
      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: COLORS.teraPrimary,
            margin: '0 0 8px 0',
            fontFamily: '"Inter", system-ui, sans-serif',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '16px',
            color: COLORS.teraSecondary,
            margin: 0,
            lineHeight: '1.5',
            fontFamily: '"Inter", system-ui, sans-serif',
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export const Scene2ProblemStatement: React.FC = () => {
  const frame = useCurrentFrame();

  const headerOpacity = fadeIn(frame, 0, 20);
  const headerScale = scaleIn(frame, 0, 20);

  const problems = [
    {
      icon: '📚',
      title: 'Learning is Hard',
      description: 'Complex concepts are overwhelming and difficult to grasp.',
    },
    {
      icon: '⏰',
      title: 'Time is Limited',
      description: 'Juggling school, work, and personal growth feels impossible.',
    },
    {
      icon: '🔍',
      title: 'Knowledge is Scattered',
      description: 'Finding trustworthy information across the internet is exhausting.',
    },
  ];

  return (
    <AbsoluteFill
      style={{
        background: COLORS.darkGradient,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        padding: '60px 40px',
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
          top: '-10%',
          right: '-15%',
          filter: 'blur(100px)',
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1000px',
          width: '100%',
        }}
      >
        {/* Section header */}
        <div
          style={{
            opacity: headerOpacity,
            transform: `scale(${headerScale})`,
            marginBottom: '60px',
            transformOrigin: 'left center',
          }}
        >
          <h2
            style={{
              fontSize: '56px',
              fontWeight: 800,
              color: COLORS.teraPrimary,
              margin: '0 0 16px 0',
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            The Problem
          </h2>
          <p
            style={{
              fontSize: '20px',
              color: COLORS.teraSecondary,
              margin: 0,
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            Learning should be simple, personal, and powerful
          </p>
        </div>

        {/* Problems list with staggered animations */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {problems.map((problem, index) => (
            <Problem
              key={index}
              icon={problem.icon}
              title={problem.title}
              description={problem.description}
              startFrame={60 + index * 50}
            />
          ))}
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: interpolate(frame, [100, 130], [0, 200], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          height: '3px',
          background: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
          borderRadius: '2px',
        }}
      />
    </AbsoluteFill>
  );
};
