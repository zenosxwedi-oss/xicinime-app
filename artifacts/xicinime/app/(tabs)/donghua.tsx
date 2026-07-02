import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';
import { donghua, donghub, drachin, dramabox, winbu } from '@/services/api';
import { AnimeCard } from '@/components/AnimeCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { ContentItem } from '@/types/api';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - 16 * 2 - 10) / 2;
const CARD_H = CARD_W * 1.4;

type SourceKey = 'donghua' | 'donghub' | 'drachin' | 'dramabox' | 'winbu';
type Category = 'Terbaru' | 'Ongoing' | 'Completed' | 'Populer';

const SOURCES: { key: SourceKey; label: string; icon: string }[] = [
  { key: 'donghua', label: 'Donghua', icon: '🐉' },
  { key: 'donghub', label: 'Donghub', icon: '🐼' },
  { key: 'drachin', label: 'Drachin', icon: '🎭' },
  { key: 'dramabox', label: 'Dramabox', icon: '📺' },
  { key: 'winbu', label: 'Winbu', icon: '⚡' },
];

const CATEGORIES: Category[] = ['Terbaru', 'Ongoing', 'Completed', 'Populer'];

function normalize(items: any[], source: ContentItem['source'], contentType: ContentItem['contentType']): ContentItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((i: any) => i?.title && (i?.poster || i?.image || i?.thumbnail))
    .map((i: any) => ({
      id: i.animeId ?? i.id ?? i.slug ?? i.bookId ?? i.title,
      title: i.title,
      poster: i.poster ?? i.image ?? i.thumbnail ?? '',
      source,
      slug: i.animeId ?? i.id ?? i.slug ?? '',
      contentType,
      episodes: i.episodes ?? i.episode ?? undefined,
      bookId: i.bookId,
    }));
}

function useDonghuaData(source: SourceKey, category: Category) {
  return useQuery({
    queryKey: ['donghua-browse', source, category],
    queryFn: async (): Promise<ContentItem[]> => {
      let raw: any;
      if (source === 'donghua') {
        if (category === 'Ongoing') raw = await donghua.ongoing();
        else if (category === 'Completed') raw = await donghua.completed();
        else raw = await donghua.latest();
      } else if (source === 'donghub') {
        if (category === 'Populer') raw = await donghub.popular();
        else raw = await donghub.latest();
      } else if (source === 'drachin') {
        if (category === 'Populer') raw = await drachin.popular();
        else raw = await drachin.latest();
      } else if (source === 'dramabox') {
        if (category === 'Populer') raw = await dramabox.trending();
        else raw = await dramabox.latest();
      } else if (source === 'winbu') {
        raw = await winbu.home();
      }
      const list =
        raw?.data?.animeList ??
        raw?.data?.items ??
        raw?.data?.dramas ??
        (Array.isArray(raw?.data) ? raw.data : []);
      const contentType: ContentItem['contentType'] =
        source === 'drachin' || source === 'dramabox' ? 'drama' : 'donghua';
      return normalize(Array.isArray(list) ? list : [], source, contentType);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default function DonghuaScreen() {
  const insets = useSafeAreaInsets();
  const [activeSource, setActiveSource] = useState<SourceKey>('donghua');
  const [activeCategory, setActiveCategory] = useState<Category>('Terbaru');

  const { data, isLoading } = useDonghuaData(activeSource, activeCategory);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <Text style={styles.screenTitle}>🐉 Donghua & Drama</Text>

      {/* Source Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow} contentContainerStyle={styles.tabsContent}>
        {SOURCES.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.tab, activeSource === s.key && styles.tabActive]}
            onPress={() => { Haptics.selectionAsync(); setActiveSource(s.key); }}
          >
            <Text style={[styles.tabText, activeSource === s.key && styles.tabTextActive]}>
              {s.icon} {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={styles.tabsContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catTab, activeCategory === cat && styles.catTabActive]}
            onPress={() => { Haptics.selectionAsync(); setActiveCategory(cat); }}
          >
            <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.skeletonWrap}>
          <SkeletonLoader count={6} width={CARD_W} height={CARD_H} />
        </View>
      ) : !data || data.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="globe" size={40} color="#1F1F1F" />
          <Text style={styles.emptyText}>Tidak ada konten</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, i) => `${item.source}-${item.id}-${i}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <AnimeCard item={item} width={CARD_W} height={CARD_H} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  screenTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabsRow: { marginBottom: 4 },
  catRow: { marginBottom: 12 },
  tabsContent: { paddingHorizontal: 16, gap: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
  },
  tabActive: { backgroundColor: '#FF6D00' },
  tabText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  catTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  catTabActive: { borderColor: '#FF6D00', backgroundColor: 'rgba(255,109,0,0.1)' },
  catText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  catTextActive: { color: '#FF6D00' },
  skeletonWrap: { paddingLeft: 16, paddingTop: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { color: '#6B7280', fontSize: 14 },
  grid: { paddingHorizontal: 16, paddingBottom: 100 },
  row: { gap: 10, marginBottom: 10 },
});
