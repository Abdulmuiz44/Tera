import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from 'remotion';
import { COLORS } from '../utils/colors';
import { fadeIn, slideInFromLeft, slideInFromRight, scaleIn } from '../utils/animations';

export const Scene7MobileExperience: React.FC = () => {
  const frame = useCurrentFrame();

  const headerOpacity = fadeIn(frame, 0, 25);
  const headerScale = scaleIn(frame, 0, 25, 0.95);

  // Left phone animation (from left)
  const leftPhoneX = slideInFromLeft(frame, 40, 30);
  const leftPhoneOpacity = fadeIn(frame, 40, 30);
  const leftPhoneScale = scaleIn(frame, 40, 30, 0.85);

  // Right phone animation (from right)
  const rightPhoneX = slideInFromRight(frame, 60, 30);
  const rightPhoneOpacity = fadeIn(frame, 60, 30);
  const rightPhoneScale = scaleIn(frame, 60, 30, 0.85);

  // Floating animation for phones
  const leftPhoneFloat = interpolate(
    (frame - 40) % 60,
    [0, 30, 60],
    [0, -15, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const rightPhoneFloat = interpolate(
    (frame - 60) % 60,
    [0, 30, 60],
    [0, -15, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Section Title */}
        <div
          style={{
            opacity: headerOpacity,
            transform: `scale(${headerScale})`,
            marginBottom: '60px',
            textAlign: 'center',
            transformOrigin: 'center center',
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
            Available Everywhere
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: COLORS.teraSecondary,
              margin: 0,
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            Desktop, tablet, mobile — Tera goes where you go
          </p>
        </div>

        {/* Phones Container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
            width: '100%',
            maxWidth: '900px',
            position: 'relative',
          }}
        >
          {/* Left Phone (Chat Interface) */}
          <div
            style={{
              opacity: leftPhoneOpacity,
              transform: `translateX(${leftPhoneX}px) translateY(${leftPhoneFloat}px) scale(${leftPhoneScale})`,
              transformOrigin: 'center center',
            }}
          >
            <div
              style={{
                width: '220px',
                height: '440px',
                borderRadius: '40px',
                border: '12px solid #1a1a2e',
                backgroundColor: COLORS.teraPanel,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(138, 43, 226, 0.4)',
                position: 'relative',
              }}
            >
              {/* Phone status bar */}
              <div
                style={{
                  height: '28px',
                  backgroundColor: COLORS.teraBg,
                  borderBottom: `1px solid ${COLORS.teraBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingX: '16px',
                  fontSize: '10px',
                  color: COLORS.teraSecondary,
                  paddingLeft: '16px',
                  paddingRight: '16px',
                }}
              >
                <span>9:41</span>
                <span>●●●●●</span>
              </div>

              {/* Phone content */}
              <div
                style={{
                  flex: 1,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  overflowY: 'auto',
                }}
              >
                {/* Chat bubble 1 */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '10px 12px',
                      borderRadius: '12px 4px 12px 12px',
                      backgroundColor: '#8a2be2',
                      color: 'white',
                      fontSize: '12px',
                      lineHeight: '1.4',
                    }}
                  >
                    What is AI?
                  </div>
                </div>

                {/* Chat bubble 2 */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '10px 12px',
                      borderRadius: '4px 12px 12px 12px',
                      backgroundColor: COLORS.teraMuted,
                      color: COLORS.teraPrimary,
                      fontSize: '12px',
                      lineHeight: '1.4',
                    }}
                  >
                    AI is technology that mimics human intelligence...
                  </div>
                </div>

                {/* Input area */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '12px',
                    display: 'flex',
                    gap: '8px',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Ask..."
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: COLORS.teraBg,
                      color: COLORS.teraSecondary,
                      fontSize: '11px',
                      outline: 'none',
                    }}
                    disabled
                  />
                  <button
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#8a2be2',
                      color: 'white',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                    disabled
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Phone (Tools) */}
          <div
            style={{
              opacity: rightPhoneOpacity,
              transform: `translateX(${rightPhoneX}px) translateY(${rightPhoneFloat}px) scale(${rightPhoneScale})`,
              transformOrigin: 'center center',
            }}
          >
            <div
              style={{
                width: '220px',
                height: '440px',
                borderRadius: '40px',
                border: '12px solid #1a1a2e',
                backgroundColor: COLORS.teraPanel,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(138, 43, 226, 0.4)',
                position: 'relative',
              }}
            >
              {/* Phone status bar */}
              <div
                style={{
                  height: '28px',
                  backgroundColor: COLORS.teraBg,
                  borderBottom: `1px solid ${COLORS.teraBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  fontSize: '10px',
                  color: COLORS.teraSecondary,
                }}
              >
                <span>9:41</span>
                <span>●●●●●</span>
              </div>

              {/* Phone content - Tools grid */}
              <div
                style={{
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                }}
              >
                {['📋', '📝', '💡', '📊'].map((icon, i) => (
                  <div
                    key={i}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '12px',
                      backgroundColor: COLORS.teraMuted,
                      border: `1px solid ${COLORS.teraBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                    }}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature points */}
        <div
          style={{
            marginTop: '60px',
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            opacity: fadeIn(frame, 150, 30),
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📱</div>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: COLORS.teraSecondary,
                fontFamily: '"Inter", system-ui, sans-serif',
              }}
            >
              Native iOS/Android
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>☁️</div>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: COLORS.teraSecondary,
                fontFamily: '"Inter", system-ui, sans-serif',
              }}
            >
              Cloud Sync
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: COLORS.teraSecondary,
                fontFamily: '"Inter", system-ui, sans-serif',
              }}
            >
              Lightning Fast
            </p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
