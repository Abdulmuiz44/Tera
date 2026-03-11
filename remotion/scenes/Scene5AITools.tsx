import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { COLORS } from '../utils/colors';
import { fadeIn, scaleIn, rotateIn, pulse } from '../utils/animations';

interface Tool {
  icon: string;
  name: string;
  description: string;
}

const ToolCard: React.FC<{
  tool: Tool;
  index: number;
  startFrame: number;
}> = ({ tool, index, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = fadeIn(frame, startFrame, 25);
  const scale = scaleIn(frame, startFrame, 25, 0.85);

  const pulseScale = spring({
    frame: frame - startFrame,
    fps: fps,
    config: {
      damping: 15,
      mass: 1,
      overshootClamping: false,
      restSpeedThreshold: 0.001,
      restDisplacementThreshold: 0.001,
    },
    delay: 25,
  });

  // Hover lift effect animation
  const yOffset = interpolate(
    (frame - startFrame) % 60,
    [0, 30, 60],
    [0, -10, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale}) translateY(${yOffset}px)`,
        transformOrigin: 'center center',
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.teraPanel,
          borderRadius: '16px',
          padding: '28px',
          border: `2px solid ${COLORS.teraBorder}`,
          textAlign: 'center',
          height: '260px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${COLORS.teraPanel} 0%, rgba(255, 255, 255, 0.03) 100%)`,
          boxShadow: '0 8px 32px rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background animated gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at ${30 + index * 20}% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 60%)`,
            opacity: 0.5,
          }}
        />

        {/* Icon container with animation */}
        <div
          style={{
            fontSize: '56px',
            marginBottom: '16px',
            position: 'relative',
            zIndex: 1,
            transform: `scale(${pulseScale * (1 + Math.sin(frame * 0.05) * 0.05)})`,
            transformOrigin: 'center center',
          }}
        >
          {tool.icon}
        </div>

        {/* Tool name */}
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            fontWeight: 700,
            color: COLORS.teraPrimary,
            fontFamily: '"Inter", system-ui, sans-serif',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {tool.name}
        </h3>

        {/* Description */}
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: COLORS.teraSecondary,
            lineHeight: '1.5',
            fontFamily: '"Inter", system-ui, sans-serif',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {tool.description}
        </p>

        {/* Accent line at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #8a2be2, transparent)',
            opacity: 0.5,
          }}
        />
      </div>
    </div>
  );
};

export const Scene5AITools: React.FC = () => {
  const frame = useCurrentFrame();

  const headerOpacity = fadeIn(frame, 0, 25);
  const headerScale = scaleIn(frame, 0, 25, 0.95);

  const tools: Tool[] = [
    {
      icon: '📋',
      name: 'Lesson Plans',
      description: 'Generate complete, standards-aligned lesson plans in seconds',
    },
    {
      icon: '📝',
      name: 'Quizzes',
      description: 'Create engaging assessments with answer keys',
    },
    {
      icon: '💡',
      name: 'Concept Explainer',
      description: 'Break down complex ideas into simple terms',
    },
    {
      icon: '📊',
      name: 'Spreadsheets',
      description: 'Build and edit interactive data sheets',
    },
    {
      icon: '🎯',
      name: 'Rubrics',
      description: 'Develop scalable rubrics with detailed criteria',
    },
    {
      icon: '📧',
      name: 'Communications',
      description: 'Draft professional emails to parents and students',
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
      {/* Multiple background elements for depth */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
          top: '-10%',
          left: '-15%',
          filter: 'blur(100px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 70%)',
          bottom: '-15%',
          right: '-10%',
          filter: 'blur(100px)',
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Section Title */}
        <div
          style={{
            opacity: headerOpacity,
            transform: `scale(${headerScale})`,
            marginBottom: '50px',
            transformOrigin: 'left center',
          }}
        >
          <h2
            style={{
              fontSize: '48px',
              fontWeight: 800,
              color: COLORS.teraPrimary,
              margin: '0 0 12px 0',
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            Specialized AI Tools
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: COLORS.teraSecondary,
              margin: 0,
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            Powerful features for every learning scenario
          </p>
        </div>

        {/* Tools Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            width: '100%',
          }}
        >
          {tools.map((tool, index) => (
            <ToolCard
              key={index}
              tool={tool}
              index={index}
              startFrame={80 + index * 40}
            />
          ))}
        </div>

        {/* Bottom feature highlight */}
        <div
          style={{
            marginTop: '50px',
            padding: '24px',
            borderRadius: '16px',
            backgroundColor: 'rgba(138, 43, 226, 0.1)',
            border: `1px solid ${COLORS.teraBorder}`,
            textAlign: 'center',
            opacity: fadeIn(frame, 250, 30),
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '16px',
              color: COLORS.teraPrimary,
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            ✨ All tools work together seamlessly in one unified interface
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
