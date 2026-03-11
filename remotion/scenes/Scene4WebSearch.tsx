import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from 'remotion';
import { COLORS } from '../utils/colors';
import { fadeIn, slideInFromLeft, slideInFromRight, scaleIn } from '../utils/animations';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

const SearchResultCard: React.FC<{
  result: SearchResult;
  index: number;
  startFrame: number;
}> = ({ result, index, startFrame }) => {
  const frame = useCurrentFrame();

  const opacity = fadeIn(frame, startFrame, 20);
  const slideOffset = slideInFromLeft(frame, startFrame, 25);
  const scale = scaleIn(frame, startFrame, 25, 0.95);

  return (
    <div
      style={{
        marginBottom: '20px',
        opacity,
        transform: `translateX(${slideOffset}px) scale(${scale})`,
        transformOrigin: 'left center',
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.teraPanel,
          borderRadius: '12px',
          padding: '16px',
          border: `1px solid ${COLORS.teraBorder}`,
          transition: 'all 0.3s',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000',
              fontSize: '14px',
            }}
          >
            🌐
          </div>
          <h4
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: COLORS.teraPrimary,
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            {result.title}
          </h4>
        </div>
        <p
          style={{
            fontSize: '13px',
            color: COLORS.teraSecondary,
            margin: '8px 0',
            lineHeight: '1.5',
            fontFamily: '"Inter", system-ui, sans-serif',
          }}
        >
          {result.snippet}
        </p>
        <p
          style={{
            fontSize: '12px',
            color: '#a0a0a0',
            margin: '8px 0 0 0',
            fontFamily: '"Inter", monospace',
          }}
        >
          {result.url}
        </p>
      </div>
    </div>
  );
};

export const Scene4WebSearch: React.FC = () => {
  const frame = useCurrentFrame();

  const searchResults: SearchResult[] = [
    {
      title: 'What is Photosynthesis',
      url: 'wikipedia.com',
      snippet:
        'Photosynthesis is a biochemical process in which plants, algae, and some bacteria harness energy from sunlight to convert water and carbon dioxide into oxygen...',
    },
    {
      title: 'Photosynthesis Explained for Kids',
      url: 'sciencekids.co.nz',
      snippet:
        'Plants make their own food using energy from the sun. This process is called photosynthesis and it is the foundation of the food chain on earth.',
    },
    {
      title: 'The Stages of Photosynthesis',
      url: 'britannica.com',
      snippet:
        'Photosynthesis occurs in two stages: light-dependent reactions in the thylakoid membrane and light-independent reactions in the stroma.',
    },
  ];

  const headerOpacity = fadeIn(frame, 0, 25);
  const headerScale = scaleIn(frame, 0, 25, 0.95);

  const windowOpacity = fadeIn(frame, 35, 30);
  const windowScale = scaleIn(frame, 35, 30, 0.9);

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
          bottom: '-15%',
          left: '-10%',
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
            Real-Time Web Search
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: COLORS.teraSecondary,
              margin: 0,
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            Verified answers with live sources from the internet
          </p>
        </div>

        {/* Search Results Container */}
        <div
          style={{
            opacity: windowOpacity,
            transform: `scale(${windowScale})`,
            transformOrigin: 'top center',
            backgroundColor: COLORS.teraPanel,
            borderRadius: '20px',
            padding: '30px',
            border: `1px solid ${COLORS.teraBorder}`,
            boxShadow: '0 20px 60px rgba(138, 43, 226, 0.3)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Search Header */}
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
                fontSize: '20px',
                marginRight: '12px',
              }}
            >
              🔍
            </div>
            <input
              type="text"
              placeholder="Photosynthesis"
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: COLORS.teraBg,
                color: COLORS.teraPrimary,
                fontSize: '15px',
                fontFamily: '"Inter", system-ui, sans-serif',
                outline: 'none',
              }}
              disabled
            />
            <div
              style={{
                marginLeft: '12px',
                fontSize: '14px',
                color: COLORS.teraSecondary,
              }}
            >
              5 results
            </div>
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {searchResults.map((result, index) => (
              <SearchResultCard
                key={index}
                result={result}
                index={index}
                startFrame={80 + index * 60}
              />
            ))}
          </div>

          {/* Search Badge */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: `1px solid ${COLORS.teraBorder}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: COLORS.teraSecondary,
              opacity: fadeIn(frame, 150, 25),
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#00d084',
              }}
            />
            Powered by real-time web search
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
