import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  role: 'user' | 'assistant';
  content: string;
}

/** Parse tera-ui spec blocks out of assistant content */
function parseTeraBlocks(content: string): Array<{ type: 'text'; value: string } | { type: 'tera-ui'; spec: any }> {
  const blocks: Array<{ type: 'text'; value: string } | { type: 'tera-ui'; spec: any }> = [];
  const regex = /```json:tera-ui\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }
    try {
      const spec = JSON.parse(match[1].trim());
      blocks.push({ type: 'tera-ui', spec });
    } catch {
      blocks.push({ type: 'text', value: match[0] });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    blocks.push({ type: 'text', value: content.slice(lastIndex) });
  }

  return blocks;
}

/** Get a human-readable label for a tera-ui component */
function getComponentLabel(spec: any): { icon: string; label: string; title?: string } {
  if (!spec?.root || !spec?.elements) return { icon: '📊', label: 'Visual' };
  const rootEl = spec.elements[spec.root];
  if (!rootEl) return { icon: '📊', label: 'Visual' };
  const typeMap: Record<string, { icon: string; label: string }> = {
    Chart: { icon: '📊', label: 'Chart' },
    MermaidDiagram: { icon: '🔀', label: 'Diagram' },
    Quiz: { icon: '❓', label: 'Quiz' },
    Spreadsheet: { icon: '📋', label: 'Spreadsheet' },
    RichText: { icon: '📝', label: 'Text' },
  };
  const info = typeMap[rootEl.type] || { icon: '📊', label: rootEl.type };
  return { ...info, title: rootEl.props?.title || rootEl.props?.topic };
}

export default function ChatBubble({ role, content }: Props) {
  const isUser = role === 'user';

  // For user messages or non-assistant, render plain
  if (isUser) {
    return (
      <View style={[styles.container, styles.userContainer]}>
        <View style={[styles.bubble, styles.userBubble]}>
          <Text style={[styles.text, styles.userText]}>{content}</Text>
        </View>
      </View>
    );
  }

  // For assistant: detect tera-ui blocks
  const blocks = parseTeraBlocks(content);

  return (
    <View style={[styles.container, styles.assistantContainer]}>
      <View style={[styles.bubble, styles.assistantBubble]}>
        {blocks.map((block, i) => {
          if (block.type === 'text') {
            return block.value.trim() ? (
              <Text key={i} style={[styles.text, styles.assistantText]}>
                {block.value.trim()}
              </Text>
            ) : null;
          }
          // tera-ui card
          const { icon, label, title } = getComponentLabel(block.spec);
          return (
            <View key={i} style={styles.visualCard}>
              <Text style={styles.visualIcon}>{icon}</Text>
              <View style={styles.visualInfo}>
                <Text style={styles.visualLabel}>{label}</Text>
                {title ? <Text style={styles.visualTitle}>{title}</Text> : null}
                <Text style={styles.visualHint}>View on web for full interactive visual</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#00d4ff',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#000',
    fontWeight: '500',
  },
  assistantText: {
    color: '#fff',
  },
  visualCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d0d0d',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#00d4ff33',
  },
  visualIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  visualInfo: {
    flex: 1,
  },
  visualLabel: {
    color: '#00d4ff',
    fontSize: 14,
    fontWeight: '600',
  },
  visualTitle: {
    color: '#fff',
    fontSize: 13,
    marginTop: 2,
  },
  visualHint: {
    color: '#666',
    fontSize: 11,
    marginTop: 4,
  },
});
