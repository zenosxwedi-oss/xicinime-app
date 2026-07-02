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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';
import {
  otakudesu, samehadaku, donghua, anoboy, animasu,
  nimegami, winbu, drachin, dramabox, kusonime,
} from '@/services/api';
import { AnimeCard } from '@/components/AnimeCard';
import { ContentItem } from '@/types/api';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - 16 * 2 - 10) / 2;
const CARD_H = CARD_W * 1.4;

type SourceTab = 'Semua' | 'Anime' | 'Donghua' | 'Drama' | 'Movie';
const TABS: SourceTab[] = ['Semua', 'Anime', 'Donghua', 'Drama', 'Movie'];

function normalize(items: any[], source: ContentItem['source'], contentType: ContentItem['contentType']): ContentItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((i: any) => i?.title && (i?.poster || i?.image))
    .map((i: any) => ({
      id: i.animeId ?? i.id ?? i.slug ?? i.title,
      title: i.title,
      poster: i.poster ?? i.image ?? i.thumbnail ?? '',
      source,
      slug: i.animeId ?? i.id ?? i.slug ?? '',
      contentType,
      episodes: i.episodes ?? undefined,
      bookId: i.bookId,
    }));
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [activeTab, setActiveTab] = useState<SourceTab>('Semua');

  const isEnabled = submitted.length >= 2;

  const { data: d1, isFetching: f1 } = useQuery({
    queryKey: ['search-otakudesu', submitted],
    queryFn: () => otakudesu.search(submitted),
    enabled: isEnabled && (activeTab === 'Semua' || activeTab === 'Anime'),
  });
  const { data: d2, isFetching: f2 } = useQuery({
    queryKey: ['search-samehadaku', submitted],
    queryFn: () => samehadaku.search(submitted),
    enabled: isEnabled && (activeTab === 'Semua' || activeTab === 'Anime' || activeTab === 'Movie'),
  });
  const { data: d3, isFetching: f3 } = useQuery({
    queryKey: ['search-donghua', submitted],
    queryFn: () => donghua.search(submitted),
    enabled: isEnabled && (activeTab === 'Semua' || activeTab === 'Donghua'),
  });
  const { data: d4, isFetching: f4 } = useQuery({
    queryKey: ['search-anoboy', submitted],
    queryFn: () => anoboy.search(submitted),
    enabled: isEnabled && (activeTab === 'Semua' || activeTab === 'Anime'),
  });
  const { data: d5, isFetching: f5 } = useQuery({
    queryKey: ['search-winbu', submitted],
    queryFn: () => winbu.search(submitted),
    enabled: isEnabled && (activeTab === 'Semua' || activeTab === 'Anime' || activeTab === 'Movie' || activeTab === 'Drama'),
  });
  const { data: d6, isFetching: f6 } = useQuery({
    queryKey: ['search-drachin', submitted],
    queryFn: () => drachin.search(submitted),
    enabled: isEnabled && (activeTab === 'Semua' || activeTab === 'Drama'),
  });
  const { data: d7, isFetching: f7 } = useQuery({
    queryKey: ['search-dramabox', submitted],
    queryFn: () => dramabox.search(submitted),
    enabled: isEnabled && (activeTab === 'Semua' || activeTab === 'Drama'),
  });
  const { data: d8, isFetching: f8 } = useQuery({
    queryKey: ['search-nimegami', submitted],
    queryFn: () => nimegami.search(submitted),
    enabled: isEnabled && (activeTab === 'Semua' || activeTab === 'Anime'),
  });
  const { data: d9, isFetching: f9 } = useQuery({
    queryKey: ['search-animasu', submitted],
    queryFn: () => animasu.search(submitted),
    enabled: isEnabled && (activeTab === 'Semua' || activeTab === 'Anime'),
  });
  const { data: d10, isFetching: f10 } = useQuery({
    queryKey: ['search-kusonime', submitted],
    queryFn: () => kusonime.search(submitted),
    enabled: isEnabled && (activeTab === 'Semua' || activeTab === 'Anime'),
  });

  const results: ContentItem[] = [
    ...normalize(d1?.data?.animeList ?? d1?.data ?? [], 'otakudesu', 'anime'),
    ...normalize(d2?.data?.animeList ?? d2?.data ?? [], 'samehadaku', 'anime'),
    ...normalize(d3?.data?.animeList ?? d3?.data ?? [], 'donghua', 'donghua'),
    ...normalize(d4?.data?.animeList ?? d4?.data ?? [], 'anoboy', 'anime'),
    ...normalize(d5?.data?.animeList ?? d5?.data?.items ?? [], 'winbu', 'anime'),
    ...normalize(d6?.data?.animeList ?? d6?.data ?? [], 'drachin', 'drama'),
    ...normalize(Array.isArray(d7?.data) ? d7.data : [], 'dramabox', 'drama'),
    ...normalize(d8?.data?.animeList ?? d8?.data ?? [], 'nimegami', 'anime'),
    ...normalize(d9?.data?.animeList ?? d9?.data ?? [], 'animasu', 'anime'),
    ...normalize(d10?.data?.animeList ?? d10?.data ?? [], 'kusonime', 'anime'),
  ];

  const isLoading = f1 || f2 || f3 || f4 || f5 || f6 || f7 || f8 || f9 || f10;

  const handleSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSubmitted(query.trim());
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Feather name="search" size={18} color="#6B7280" />
        <TextInput
          style={styles.input}
          placeholder="Cari anime, donghua, drama, film..."
          placeholderTextColor="#6B7280"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setSubmitted(''); }}>
            <Feather name="x" size={16} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      {isLoading && submitted && (
        <View style={styles.loading}>
          <ActivityIndicator color="#8B00FF" size="large" />
        </View>
      )}
      {!isLoading && submitted && results.length === 0 && (
        <View style={styles.empty}>
          <Feather name="search" size={40} color="#1F1F1F" />
          <Text style={styles.emptyTitle}>Tidak ditemukan</Text>
          <Text style={styles.emptyText}>Coba kata kunci lain</Text>
        </View>
      )}
      {!submitted && (
        <View style={styles.empty}>
          <Feather name="tv" size={40} color="#1F1F1F" />
          <Text style={styles.emptyTitle}>Cari konten favoritmu</Text>
          <Text style={styles.emptyText}>Anime, Donghua, Drama, Movie</Text>
        </View>
      )}
      {results.length > 0 && !isLoading && (
        <FlatList
          data={results}
          keyExtractor={(item, i) => `${item.source}-${item.id}-${i}`}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <AnimeCard item={item} width={CARD_W} height={CARD_H} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  input: { flex: 1, color: '#FFF', fontSize: 15 },
  tabs: { marginBottom: 12 },
  tabsContent: { paddingHorizontal: 16, gap: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
  },
  tabActive: { backgroundColor: '#8B00FF' },
  tabText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptyText: { color: '#6B7280', fontSize: 13 },
  grid: { paddingHorizontal: 16, paddingBottom: 100 },
  row: { gap: 10, marginBottom: 10 },
});
