import { useState } from 'react';
import {
  Image,
  PixelRatio,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { resolveImageSource } from '@data/repository/media';
import type { MediaAsset } from '@core/contract/models/media';

type Props = {
  image?: MediaAsset | null;
  mobileImage?: MediaAsset | null;
  style?: StyleProp<ViewStyle>;
};

export const CmsImage = ({ image, mobileImage, style }: Props) => {
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const source =
    containerWidth > 0 ? resolveImageSource({ image, mobileImage }, containerWidth, PixelRatio.get()) : null;

  return (
    <View
      onLayout={onLayout}
      style={[style, source?.aspectRatio ? { aspectRatio: source.aspectRatio } : undefined]}
    >
      {source && (
        <Image
          source={{ uri: source.uri }}
          accessible={Boolean(source.alt)}
          accessibilityLabel={source.alt || undefined}
          style={styles.image}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
});
