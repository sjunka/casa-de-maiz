import { StyleSheet, Text, View } from 'react-native';
import { useDestinationNavigation } from '@navigation/useDestinationNavigation';
import { useTheme } from '../theme/useTheme';
import { AppPressable } from '../ui/AppPressable';
import { CmsImage } from '../ui/CmsImage';
import { RichText } from '../ui/RichText';
import type { GenericBlock as GenericBlockData } from '@core/contract/models/block';

type Props = { block: GenericBlockData };

// Best-effort renderer for block types the OpenAPI contract declares but
// doesn't shape. Reads only recognised optional fields; anything
// else renders nothing rather than guessing at an unpublished schema.
export const GenericBlock = ({ block }: Props) => {
  const navigateToDestination = useDestinationNavigation();
  const { colors } = useTheme();

  const title = block.heading ?? block.title;
  const richText = block.richText ?? block.content;
  const media = block.media ?? block.image;
  const href = block.link ?? block.href;
  const label = block.label;

  if (!title && !richText && !media && !href && !label) {
    return null;
  }

  return (
    <View style={styles.container}>
      {title ? <Text style={[styles.title, { color: colors.text }]}>{title}</Text> : null}
      {media ? <CmsImage image={media} style={[styles.image, { backgroundColor: colors.imagePlaceholder }]} /> : null}
      {richText ? <RichText document={richText} onLinkPress={navigateToDestination} /> : null}
      {href ? (
        <AppPressable
          accessibilityRole="button"
          accessibilityLabel={label ?? href}
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={() => navigateToDestination(href)}
        >
          {label ? <Text style={[styles.buttonLabel, { color: colors.onAccent }]}>{label}</Text> : null}
        </AppPressable>
      ) : label ? (
        <Text style={[styles.title, { color: colors.text }]}>{label}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  image: { width: '100%', marginBottom: 8 },
  button: {
    marginTop: 8,
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonLabel: { fontSize: 16, fontWeight: '600' },
});
