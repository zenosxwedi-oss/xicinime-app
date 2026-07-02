import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ContentItem, SOURCE_COLORS, SOURCE_LABELS } from '@/types/api';

const { width: SCREEN_W } = Dimensions.get('window');

interface Props {
  item: ContentItem;
  width?: number;
  height?: number;
}

export function AnimeCard({ item, width = SCREEN_W * 0.38, height = 200 }: Props) {
  const handlePress = () => {
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

  const badgeColor = (SOURCE_COLORS as Record<string, string>)[item.source] ?? '#8B00FF';

  return (
    <TouchableOpacity style={[styles.card, { width, height }]} onPress={handlePress} activeOpacity={0.8}>
      <Image
        source={{ uri: item.poster }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.gradient}
      />
      <View style={styles.badge} >
        <Text style={[styles.badgeText, { backgroundColor: badgeColor }]}>
          {SOURCE_LABELS[item.source]}
        </Text>
      </View>
      {item.episodes != null && (
        <View style={styles.epBadge}>
          <Text style={styles.epBadgeText}>Ep {item.episodes}</Text>
        </View>
      )}
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    marginRight: 10,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  epBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  epBadgeText: {
    color: '#FFB800',
    fontSize: 9,
    fontWeight: '700',
  },
  title: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
