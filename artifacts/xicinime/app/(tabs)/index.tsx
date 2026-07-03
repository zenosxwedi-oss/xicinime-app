import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HeroBanner } from '@/components/HeroBanner';
import { SectionRow } from '@/components/SectionRow';
import { otakudesu, samehadaku, donghua, winbu, animasu, anoboy, donghub } from '@/services/api';
import { ContentItem } from '@/types/api';

/** Universal normalizer — handles real field names from each API */
function norm(
  items: any[],
  source: ContentItem['source'],
  contentType: ContentItem['contentType'],
  directToEpisode = false,
): ContentItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((i: any) => i?.title && (i?.poster || i?.image || i?.thumbnail))
    .map((i: any) => ({
      id: i.animeId ?? i.id ?? i.slug ?? i.bookId ?? i.title,
      // donghub titles contain tabs like "Title\t\t\t\tTitle Episode N"
      title: String(i.title ?? '').split('\t')[0].trim(),
      poster: (i.poster ?? i.image ?? i.thumbnail ?? '').split('\t')[0].trim(),
      source,
      slug: i.animeId ?? i.id ?? i.slug ?? '',
      contentType,
      episodes: i.episodes ?? i.episode ?? undefined,
      status: i.status,
      directToEpisode,
    }));
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const { data: home, isLoading: l1, refetch: r1 } = useQuery({
    queryKey: ['home-otakudesu'],
    queryFn: otakudesu.home,
    staleTime: 5 * 60 * 1000,
  });
  const { data: movies, isLoading: l2, refetch: r2 } = useQuery({
    queryKey: ['home-samehadaku-movies'],
    queryFn: () => samehadaku.movies(1),
    staleTime: 5 * 60 * 1000,
  });
  const { data: donghuaLatest, isLoading: l3, refetch: r3 } = useQuery({
    queryKey: ['home-donghua-latest'],
    queryFn: () => donghua.latest(1),
    staleTime: 5 * 60 * 1000,
  });
  const { data: winbuHome, isLoading: l4, refetch: r4 } = useQuery({
    queryKey: ['home-winbu'],
    queryFn: winbu.home,
    staleTime: 5 * 60 * 1000,
  });
  const { data: animasuHome, isLoading: l5, refetch: r5 } = useQuery({
    queryKey: ['home-animasu'],
    queryFn: () => animasu.home(1),
    staleTime: 5 * 60 * 1000,
  });
  const { data: anoboyHome, isLoading: l6, refetch: r6 } = useQuery({
    queryKey: ['home-anoboy'],
    queryFn: () => anoboy.home(1),
    staleTime: 5 * 60 * 1000,
  });
  const { data: donghubHome, isLoading: l7, refetch: r7 } = useQuery({
    queryKey: ['home-donghub'],
    queryFn: donghub.home,
    staleTime: 5 * 60 * 1000,
  });

  // Extract with correct field names per API.
  // IMPORTANT: some sources have NO "data" wrapper (anoboy, donghua, animasu, nimegami)
  // while others do (otakudesu, samehadaku, winbu, donghub).
  // Use ?? fallback: raw?.data?.field ?? raw?.field
  const ongoingAnime  = norm(home?.data?.ongoing?.animeList   ?? [], 'otakudesu', 'anime');
  const completedAnime= norm(home?.data?.completed?.animeList ?? [], 'otakudesu', 'anime');
  const movieItems    = norm(movies?.data?.animeList           ?? [], 'samehadaku', 'movie');
  // donghua: no data wrapper → r.latest_donghua
  const donghuaItems  = norm(donghuaLatest?.latest_donghua     ?? [], 'donghua', 'donghua');
  // winbu: has data wrapper → r.data.latest_anime
  const winbuItems    = norm(winbuHome?.data?.latest_anime     ?? [], 'winbu', 'anime');
  // animasu: no data wrapper → r.ongoing / r.recent
  const animasuItems  = norm(animasuHome?.ongoing ?? animasuHome?.recent ?? [], 'animasu', 'anime');
  // anoboy: no data wrapper → r.anime_list; episode-level items → go to player directly
  const anoboyItems   = norm(anoboyHome?.anime_list            ?? [], 'anoboy', 'anime', true);
  // donghub: has data wrapper → r.data.latest / r.data.popular; episode-level items
  const donghubItems  = norm(
    donghubHome?.data?.latest ?? donghubHome?.data?.popular ?? [],
    'donghub', 'donghua', true,
  );

  const heroItems = [
    ...ongoingAnime.slice(0, 3),
    ...movieItems.slice(0, 2),
    ...donghuaItems.slice(0, 2),
  ].filter((i) => i.poster);

  const handleRefresh = () => { r1(); r2(); r3(); r4(); r5(); r6(); r7(); };
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor="#8B00FF" />}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Image source={require('../../assets/images/icon.png')} style={styles.logo} contentFit="contain" />
        <Text style={styles.headerTitle}>XICINIME</Text>
      </View>

      {heroItems.length > 0 && <HeroBanner items={heroItems} />}

      <View style={styles.sections}>
        <SectionRow title="🔥 Anime Terbaru" data={ongoingAnime} isLoading={l1} />
        <SectionRow title="✅ Anime Selesai" data={completedAnime} isLoading={l1} />
        <SectionRow title="🎬 Movie Anime" data={movieItems} isLoading={l2} />
        <SectionRow title="🐉 Donghua Terbaru" data={donghuaItems} isLoading={l3} />
        <SectionRow title="⚡ Winbu — Anime & Film" data={winbuItems} isLoading={l4} />
        <SectionRow title="🌟 Animasu" data={animasuItems} isLoading={l5} />
        <SectionRow title="📺 Anoboy Update" data={anoboyItems} isLoading={l6} />
        <SectionRow title="🐼 Donghub Update" data={donghubItems} isLoading={l7} />
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
  headerTitle: { color: '#8B00FF', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  sections: { marginTop: 8 },
});
