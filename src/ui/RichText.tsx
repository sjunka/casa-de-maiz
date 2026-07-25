import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, type Theme } from '../theme/useTheme';
import type { RichTextDocument, RichTextNode } from '../models/richText';

const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_STRIKETHROUGH = 4;
const FORMAT_UNDERLINE = 8;
const FORMAT_CODE = 16;

type Props = {
  document: RichTextDocument;
  onLinkPress: (href: string) => void;
};

export const RichText = ({ document, onLinkPress }: Props) => {
  const { colors } = useTheme();

  return (
    <View>
      {document.root.children.map((node, index) => (
        <RichTextBlock key={index} node={node} onLinkPress={onLinkPress} colors={colors} />
      ))}
    </View>
  );
};

type NodeProps = { node: RichTextNode; onLinkPress: (href: string) => void; colors: Theme['colors'] };

const RichTextBlock = ({ node, onLinkPress, colors }: NodeProps): ReactNode => {
  switch (node.type) {
    case 'paragraph':
      return (
        <Text style={[styles.paragraph, { color: colors.text }]} selectable>
          {renderInline(node.children ?? [], onLinkPress, colors)}
        </Text>
      );
    case 'heading':
      return (
        <Text
          style={[styles.paragraph, headingStyle(node.tag), { color: colors.text }]}
          selectable
          accessibilityRole="header"
        >
          {renderInline(node.children ?? [], onLinkPress, colors)}
        </Text>
      );
    case 'list':
      return (
        <View style={styles.list}>
          {(node.children ?? []).map((item, index) => (
            <View key={index} style={styles.listItemRow}>
              <Text style={[styles.paragraph, { color: colors.text }]}>
                {node.listType === 'number' ? `${index + 1}.` : '•'}
              </Text>
              <Text style={[styles.paragraph, styles.listItemText, { color: colors.text }]} selectable>
                {renderInline(item.children ?? [], onLinkPress, colors)}
              </Text>
            </View>
          ))}
        </View>
      );
    default:
      if (!node.children?.length) {
        return null;
      }
      return (
        <>
          {node.children.map((child, index) => (
            <RichTextBlock key={index} node={child} onLinkPress={onLinkPress} colors={colors} />
          ))}
        </>
      );
  }
};

const renderInline = (nodes: RichTextNode[], onLinkPress: (href: string) => void, colors: Theme['colors']): ReactNode =>
  nodes.map((node, index) => {
    switch (node.type) {
      case 'text':
        return (
          <Text key={index} style={textFormatStyle(node.format)}>
            {node.text}
          </Text>
        );
      case 'linebreak':
        return '\n';
      case 'link': {
        const href = node.fields?.url;
        return (
          <Text
            key={index}
            style={[styles.link, { color: colors.link }]}
            accessibilityRole="link"
            onPress={href ? () => onLinkPress(href) : undefined}
          >
            {renderInline(node.children ?? [], onLinkPress, colors)}
          </Text>
        );
      }
      default:
        return node.children?.length ? (
          <Text key={index}>{renderInline(node.children, onLinkPress, colors)}</Text>
        ) : null;
    }
  });

const textFormatStyle = (format?: number | string) => {
  const bits = typeof format === 'number' ? format : 0;
  if (!bits) {
    return undefined;
  }
  return [
    (bits & FORMAT_BOLD) !== 0 && styles.bold,
    (bits & FORMAT_ITALIC) !== 0 && styles.italic,
    (bits & FORMAT_STRIKETHROUGH) !== 0 && styles.strikethrough,
    (bits & FORMAT_UNDERLINE) !== 0 && styles.underline,
    (bits & FORMAT_CODE) !== 0 && styles.code,
  ];
};

const headingStyle = (tag?: string) => {
  switch (tag) {
    case 'h1':
      return styles.h1;
    case 'h2':
      return styles.h2;
    default:
      return styles.h3;
  }
};

const styles = StyleSheet.create({
  paragraph: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  h1: { fontSize: 24, fontWeight: '700' },
  h2: { fontSize: 20, fontWeight: '700' },
  h3: { fontSize: 17, fontWeight: '700' },
  list: { marginBottom: 12 },
  listItemRow: { flexDirection: 'row', gap: 8 },
  listItemText: { flex: 1 },
  link: { textDecorationLine: 'underline' },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  strikethrough: { textDecorationLine: 'line-through' },
  underline: { textDecorationLine: 'underline' },
  code: { fontFamily: 'Courier' },
});
