import { useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
  type ViewToken,
} from 'react-native';
import { CmsImage } from '../ui/CmsImage';
import type { CarouselBlock as CarouselBlockData } from '../models/block';

type Slide = CarouselBlockData['slides'][number];
type Props = { block: CarouselBlockData };

const SCREEN_WIDTH = Dimensions.get('window').width;

const Slide = ({ item }: ListRenderItemInfo<Slide>) => (
  <View style={styles.slide}>
    <CmsImage image={item.image} mobileImage={item.mobileImage} style={styles.image} />
    {item.title ? <Text style={styles.title}>{item.title}</Text> : null}
    {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
  </View>
);

export const CarouselBlock = ({ block }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const slideCount = block.slides.length;

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, slideCount - 1));
    setActiveIndex(clamped);
    try {
      listRef.current?.scrollToIndex({ index: clamped, animated: true });
    } catch {
      // out of range on some platforms during fast paging; state already updated above
    }
    AccessibilityInfo.announceForAccessibility(`Slide ${clamped + 1} of ${slideCount}`);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (first?.index != null) {
      setActiveIndex(first.index);
    }
  }).current;

  if (slideCount === 0) {
    return null;
  }

  return (
    <View>
      <FlatList
        ref={listRef}
        data={block.slides}
        keyExtractor={(_, index) => `slide-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={Slide}
      />
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous slide"
          disabled={activeIndex === 0}
          onPress={() => goTo(activeIndex - 1)}
          style={[styles.button, activeIndex === 0 && styles.buttonDisabled]}
        >
          <Text>‹</Text>
        </Pressable>
        <Text
          accessibilityLiveRegion="polite"
          accessibilityLabel={`Slide ${activeIndex + 1} of ${slideCount}`}
          style={styles.position}
        >
          {activeIndex + 1} / {slideCount}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next slide"
          disabled={activeIndex === slideCount - 1}
          onPress={() => goTo(activeIndex + 1)}
          style={[styles.button, activeIndex === slideCount - 1 && styles.buttonDisabled]}
        >
          <Text>›</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: { padding: 16, width: SCREEN_WIDTH },
  image: { borderRadius: 8, backgroundColor: '#eee' },
  title: { marginTop: 8, fontSize: 18, fontWeight: '600' },
  description: { marginTop: 4, fontSize: 14, color: '#666' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 8,
  },
  button: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.3 },
  position: { fontSize: 13, color: '#666' },
});
