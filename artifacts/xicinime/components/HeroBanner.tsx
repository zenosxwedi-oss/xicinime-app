import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ApiSource, ContentItem, SOURCE_COLORS, SOURCE_LABELS } from '@/types/api';
import { Feather } from '@expo/vector-icons';

const { width: W } = Dimensions.get('window');
const HERO_H = 380;

interface Props {
  items: ContentItem[];
}

export function HeroBanner({ items }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % items.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  const handlePress = (item: ContentItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const params: Record<string, string> = {
      source: item.source,
      slug: item.slug,
      contentType: item.contentType,
      title: item.title,
      poster: item.poster,
    };
    if (item.extraId) params.extraId = item.extraId;
    if (item.bookId) params.bookId = item.bookId;
    router.push({ pathname: '/detail', params });
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={items}
        keyExtractor={(item, i) => `${item.source}-${item.id}-${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / W);
          setActiveIndex(idx);
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.slide}
            onPress={() => handlePress(item)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: item.poster }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(10,10,10,0.6)', 'rgba(10,10,10,1)']}
              style={styles.gradient}
            />
            <View style={styles.info}>
              <Text style={[styles.sourceBadge, { backgroundColor: (SOURCE_COLORS as Record<string, string>)[item.source] ?? '#8B00FF' }]}>
                {(SOURCE_LABELS as Record<string, string>)[item.source] ?? item.source}
              </Text>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              {item.episodes != null && (
                <Text style={styles.meta}>{item.episodes} Episode</Text>
              )}
              <TouchableOpacity style={styles.playBtn} onPress={() => handlePress(item)}>
                <Feather name="play" size={16} color="#000" />
                <Text style={styles.playText}>Tonton</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
      {/* Dots */}
      <View style={styles.dots}>
        {items.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: HERO_H },
  slide: { width: W, height: HERO_H },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  info: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
  },
  sourceBadge: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 8,
    overflow: 'hidden',
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    color: '#FFB800',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  playText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  dots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#8B00FF',
    width: 18,
  },
});
