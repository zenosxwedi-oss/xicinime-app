import { Feather } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ContentItem } from '@/types/api';
import { AnimeCard } from './AnimeCard';
import { SkeletonLoader } from './SkeletonLoader';

interface Props {
  title: string;
  data: ContentItem[] | undefined;
  isLoading?: boolean;
  onSeeAll?: () => void;
  cardWidth?: number;
  cardHeight?: number;
}

export function SectionRow({ title, data, isLoading, onSeeAll, cardWidth, cardHeight }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} style={styles.seeAll}>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
            <Feather name="chevron-right" size={14} color="#8B00FF" />
          </TouchableOpacity>
        )}
      </View>
      {isLoading ? (
        <SkeletonLoader count={5} width={cardWidth} height={cardHeight} />
      ) : !data || data.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Tidak ada konten</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, i) => `${item.source}-${item.id}-${i}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <AnimeCard item={item} width={cardWidth} height={cardHeight} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    color: '#8B00FF',
    fontSize: 12,
    fontWeight: '600',
  },
  list: { paddingLeft: 16 },
  empty: { paddingLeft: 16 },
  emptyText: { color: '#6B7280', fontSize: 13 },
});
