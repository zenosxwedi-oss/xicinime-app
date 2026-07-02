import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HeroBanner } from '@/components/HeroBanner';
import { SectionRow } from '@/components/SectionRow';
import { otakudesu, samehadaku, donghua, winbu, dramabox, animasu } from '@/services/api';
import { ContentItem } from '@/types/api';

function normalize(items: any[], source: ContentItem['source'], contentType: ContentItem['contentType']): ContentItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((i: any) => i?.title && (i?.poster || i?.image || i?.thumbnail))
    .map((i: any) => ({
      id: i.animeId ?? i.id ?? i.bookId ?? i.slug ?? i.title,
      title: i.title,
      poster: i.poster ?? i.image ?? i.thumbnail ?? '',
      source,
      slug: i.animeId ?? i.id ?? i.slug ?? '',
      contentType,
      episodes: i.episodes ?? i.episode ?? undefined,
      status: i.status,
      bookId: i.bookId,
    }));
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const { data: animeHome, isLoading: l1, refetch: r1 } = useQuery({
    queryKey: ['anime-home'],
    queryFn: otakudesu.home,
    staleTime: 5 * 60 * 1000,
  });
  const { data: moviesData, isLoading: l2, refetch: r2 } = useQuery({
    queryKey: ['samehadaku-movies'],
    queryFn: () => samehadaku.movies(1),
    staleTime: 5 * 60 * 1000,
  });
  const { data: donghuaLatest, isLoading: l3, refetch: r3 } = useQuery({
    queryKey: ['donghua-latest'],
    queryFn: () => donghua.latest(1),
    staleTime: 5 * 60 * 1000,
  });
  const { data: winbuHome, isLoading: l4, refetch: r4 } = useQuery({
    queryKey: ['winbu-home'],
    queryFn: winbu.home,
    staleTime: 5 * 60 * 1000,
  });
  const { data: dramaboxTrending, isLoading: l5, refetch: r5 } = useQuery({
    queryKey: ['dramabox-trending'],
    queryFn: dramabox.trending,
    staleTime: 5 * 60 * 1000,
  });
  const { data: animasuHome, isLoading: l6, refetch: r6 } = useQuery({
    queryKey: ['animasu-home'],
    queryFn: () => animasu.home(1),
    staleTime: 5 * 60 * 1000,
  });

  const ongoingAnime = normalize(
    animeHome?.data?.ongoing?.animeList ?? [],
    'otakudesu', 'anime',
  );
  const popularAnime = normalize(
    animeHome?.data?.popular?.animeList ?? animeHome?.data?.ongoing?.animeList ?? [],
    'otakudesu', 'anime',
  );
  const movies = normalize(
    moviesData?.data?.movies?.animeList ?? moviesData?.data?.animeList ?? [],
    'samehadaku', 'movie',
  );
  const donghuaItems = normalize(
    donghuaLatest?.data?.animeList ?? donghuaLatest?.data ?? [],
    'donghua', 'donghua',
  );
  const winbuItems: ContentItem[] = (() => {
    const raw: any[] = winbuHome?.data?.animeList ?? winbuHome?.data?.items ?? [];
    return normalize(raw, 'winbu', 'anime');
  })();
  const dramaboxItems = normalize(
    Array.isArray(dramaboxTrending?.data) ? dramaboxTrending.data : [],
    'dramabox', 'drama',
  );
  const animasuItems = normalize(
    animasuHome?.data?.animeList ?? animasuHome?.data ?? [],
    'animasu', 'anime',
  );

  const heroItems = [
    ...ongoingAnime.slice(0, 3),
    ...movies.slice(0, 2),
    ...donghuaItems.slice(0, 2),
  ].filter((i) => i.poster);

  const isRefreshing = false;
  const handleRefresh = () => {
    r1(); r2(); r3(); r4(); r5(); r6();
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 + botPad }}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#8B00FF" />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.headerTitle}>XICINIME</Text>
      </View>

      {/* Hero */}
      {heroItems.length > 0 && <HeroBanner items={heroItems} />}

      <View style={styles.sections}>
        <SectionRow
          title="🔥 Anime Terbaru"
          data={ongoingAnime}
          isLoading={l1}
        />
        <SectionRow
          title="🎬 Movie Anime"
          data={movies}
          isLoading={l2}
        />
        <SectionRow
          title="🐉 Donghua Terbaru"
          data={donghuaItems}
          isLoading={l3}
        />
        <SectionRow
          title="⚡ Winbu — Anime & Film"
          data={winbuItems}
          isLoading={l4}
        />
        <SectionRow
          title="📺 Drama Populer"
          data={dramaboxItems}
          isLoading={l5}
        />
        <SectionRow
          title="🌟 Animasu"
          data={animasuItems}
          isLoading={l6}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  logo: { width: 36, height: 36, borderRadius: 8 },
  headerTitle: {
    color: '#8B00FF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  sections: { marginTop: 8 },
});
