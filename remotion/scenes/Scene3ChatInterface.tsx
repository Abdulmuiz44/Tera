import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { COLORS } from '../utils/colors';
import { fadeIn, slideInFromLeft, slideInFromRight, scaleIn } from '../utils/animations';

interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
}

const messages: ChatMessage[] = [
  {
    type: 'user',
    content: 'Explain photosynthesis in simple terms',
  },
  {
    type: 'ai',
    content:
      'Photosynthesis is how plants turn sunlight, water, and air into food and oxygen. Think of it like the plant\'s solar power system!',
  },
];

const ChatBubble: React.FC<{
  message: ChatMessage;
  index: number;
  startFrame: number;
}> = ({ message, index, startFrame }) => {
  const frame = useCurrentFrame();
  const isUser = message.type === 'user';

  const slideOffset = isUser
    ? slideInFromRight(frame, startFrame, 20)
    : slideInFromLeft(frame, startFrame, 20);

  const opacity = fadeIn(frame, startFrame, 20);
  const scale = scaleIn(frame, startFrame, 20, 0.95);

  // Type-out effect for AI message
  const textProgress = interpolate(
    frame,
    [startFrame + 20, startFrame + 80],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const displayText = isUser
    ? message.content
    : message.content.slice(0, Math.floor(message.content.length * textProgress));

  return (
    <div
      style={{
        marginBottom: '16px',
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        opacity,
        transform: `translateX(${slideOffset}px) scale(${scale})`,
        transformOrigin: isUser ? 'right center' : 'left center',
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          padding: '16px 20px',
          borderRadius: isUser ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
          backgroundColor: isUser ? '#ffffff' : '#2a2a2a',
          color: isUser ? '#000000' : COLORS.teraPrimary,
          fontSize: '16px',
          lineHeight: '1.6',
          fontFamily: '"Inter", system-ui, sans-serif',
          border: isUser ? 'none' : `1px solid #333333`,
          boxShadow: isUser
            ? '0 8px 24px rgba(255, 255, 255, 0.2)'
            : '0 8px 24px rgba(255, 255, 255, 0.1)',
          wordWrap: 'break-word',
        }}
      >
        {displayText}
        {!isUser && frame >= startFrame + 20 && (
          <span
            style={{
              animation: 'blink 0.8s infinite',
              marginLeft: '4px',
              display: 'inline-block',
            }}
          >
            ▌
          </span>
        )}
      </div>
    </div>
  );
};

export const Scene3ChatInterface: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = fadeIn(frame, 0, 25);
  const titleScale = scaleIn(frame, 0, 25, 0.95);

  const windowOpacity = fadeIn(frame, 40, 30);
  const windowScale = scaleIn(frame, 40, 30, 0.9);

  const inputOpacity = fadeIn(frame, 200, 25);

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
      {/* Background decorative elements */}
      <div
        style={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
          top: '-20%',
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
          maxWidth: '900px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Section Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
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
            AI-Powered Conversations
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: COLORS.teraSecondary,
              margin: 0,
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            Get instant, intelligent answers to any question
          </p>
        </div>

        {/* Chat Window - Realistic UI */}
        <div
          style={{
            opacity: windowOpacity,
            transform: `scale(${windowScale})`,
            transformOrigin: 'top center',
            backgroundColor: COLORS.teraPanel,
            borderRadius: '20px',
            padding: '30px',
            border: `1px solid ${COLORS.teraBorder}`,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingBottom: '20px',
              borderBottom: `1px solid ${COLORS.teraBorder}`,
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                fontWeight: 'bold',
                fontSize: '20px',
                marginRight: '12px',
              }}
            >
              T
            </div>
            <div>
              <h3
                style={{
                  margin: '0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: COLORS.teraPrimary,
                  fontFamily: '"Inter", system-ui, sans-serif',
                }}
              >
                Tera
              </h3>
              <p
                style={{
                  margin: '0',
                  fontSize: '12px',
                  color: COLORS.teraSecondary,
                  fontFamily: '"Inter", system-ui, sans-serif',
                }}
              >
                Always ready to help
              </p>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '20px',
            }}
          >
            {messages.map((message, index) => (
              <ChatBubble
                key={index}
                message={message}
                index={index}
                startFrame={80 + index * 90}
              />
            ))}
          </div>

          {/* Input Area */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              opacity: inputOpacity,
              paddingTop: '20px',
              borderTop: `1px solid ${COLORS.teraBorder}`,
            }}
          >
            <input
              type="text"
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: '12px',
                border: `1px solid ${COLORS.teraBorder}`,
                backgroundColor: '#0a0a0a',
                color: COLORS.teraPrimary,
                fontSize: '15px',
                fontFamily: '"Inter", system-ui, sans-serif',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              disabled
            />
            <button
              style={{
                padding: '14px 28px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#ffffff',
                color: '#000000',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: '"Inter", system-ui, sans-serif',
                boxShadow: '0 4px 16px rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s',
              }}
              disabled
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 49% {
            opacity: 1;
          }
          50%, 100% {
            opacity: 0;
          }
        }
        
        div::-webkit-scrollbar {
          width: 6px;
        }
        
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        
        div::-webkit-scrollbar-thumb {
          background: ${COLORS.teraBorder};
          border-radius: 3px;
        }
      `}</style>
    </AbsoluteFill>
  );
};
