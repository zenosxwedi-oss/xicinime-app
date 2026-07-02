import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator, Linking, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import {
  otakudesu, samehadaku, donghua, anoboy,
  oploverz, alqanime, donghub, animasu, kusonime,
  animekuindo, winbu, nimegami,
} from '@/services/api';
import { ApiSource, SOURCE_COLORS, SOURCE_LABELS } from '@/types/api';

type Params = {
  source: string;
  slug: string;
  title: string;
  animeName: string;
  extraId?: string;
  animeSlug?: string;
  episodeIndex?: string;
};

interface StreamLink {
  label: string;
  url: string;
  serverId?: string;
  quality?: string;
}

// ── Fetch raw episode data ───────────────────────────────────────────────────
async function fetchEpisode(source: ApiSource, slug: string, episodeIndex: number): Promise<any> {
  switch (source) {
    case 'otakudesu':    return otakudesu.episode(slug);
    case 'samehadaku':   return samehadaku.episode(slug);
    case 'donghua':      return donghua.episode(slug);
    case 'anoboy':       return anoboy.episode(slug);
    case 'oploverz':     return oploverz.episode(slug);
    case 'alqanime':     return alqanime.episode(slug);
    case 'donghub':      return donghub.episode(slug);
    case 'animasu':      return animasu.episode(slug);
    case 'kusonime':     return kusonime.episode(slug);
    case 'animekuindo':  return animekuindo.episode(slug);
    case 'winbu':        return winbu.episode(slug);
    case 'nimegami': {
      // nimegami has no dedicated episode endpoint; try generic detail path
      const d = await nimegami.detail(slug);
      return d;
    }
    default: return null;
  }
}

// ── Extract streaming links with correct field paths per source ──────────────
function extractStreamLinks(source: ApiSource, raw: any): StreamLink[] {
  if (!raw) return [];
  const d = raw.data ?? raw;
  const links: StreamLink[] = [];
  const seen = new Set<string>();

  function add(label: string, url: string, quality?: string, serverId?: string) {
    const key = url || serverId || '';
    if (!key || seen.has(key)) return;
    seen.add(key);
    links.push({ label, url: url || '', quality, serverId: serverId || undefined });
  }

  // ── 1. defaultStreamingUrl — otakudesu / samehadaku ───────────────────────
  if (d.defaultStreamingUrl) {
    add('▶ Tonton Langsung', d.defaultStreamingUrl, 'default');
  }

  // ── 2. server.qualities[].serverList[] — otakudesu / samehadaku ──────────
  //    Structure: { qualities: [{ title: "720p", serverList: [{title:"filedon", serverId:"..."}] }] }
  const qualities: any[] = d.server?.qualities ?? [];
  for (const q of qualities) {
    const qualLabel = q.title ?? '';
    for (const s of (q.serverList ?? [])) {
      const label = `${qualLabel} – ${s.title ?? 'Server'}`;
      if (s.url || s.embedUrl) {
        add(label, s.url ?? s.embedUrl, qualLabel);
      } else if (s.serverId) {
        add(label, '', qualLabel, s.serverId);
      }
    }
  }

  // ── 3. streaming.servers[] — donghua ──────────────────────────────────────
  //    Structure: { streaming: { main_url: {name, url}, servers: [{name, url}] } }
  const streamingServers: any[] = d.streaming?.servers ?? [];
  for (const s of streamingServers) {
    if (s.url) add(s.name ?? 'Server', s.url);
  }
  if (d.streaming?.main_url?.url) {
    add(d.streaming.main_url.name ?? 'Main', d.streaming.main_url.url);
  }

  // ── 4. streams[] — anoboy / donghub ───────────────────────────────────────
  //    anoboy:  { streams: [{name, url}] }
  //    donghub: { streams: [{server, url}] }
  const streams: any[] = d.streams ?? [];
  for (const s of streams) {
    const url = s.url ?? s.href ?? '';
    const label = s.name ?? s.server ?? s.title ?? 'Stream';
    if (url) add(label, url);
  }

  // ── 5. Generic direct URL fallbacks ─────────────────────────────────────
  const direct = d.videoUrl ?? d.streamUrl ?? d.embedUrl ?? d.mp4Url ?? d.url ?? '';
  if (direct) add('Stream', direct);

  return links;
}

export default function EpisodeScreen() {
  const params = useLocalSearchParams<Params>();
  const insets = useSafeAreaInsets();
  const source = params.source as ApiSource;
  const episodeIndex = Number(params.episodeIndex ?? 1);

  // Step 1: Fetch raw episode data
  const { data: rawEpisode, isLoading: loadingEpisode } = useQuery({
    queryKey: ['episode', source, params.slug],
    queryFn: () => fetchEpisode(source, params.slug, episodeIndex),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const rawLinks = extractStreamLinks(source, rawEpisode);
  const badgeColor = (SOURCE_COLORS as Record<string, string>)[source] ?? '#8B00FF';

  // Step 2: Resolve server IDs → embed URLs (otakudesu / samehadaku)
  const needsResolution = rawLinks.some((l) => l.serverId && !l.url);
  const { data: resolvedLinks, isLoading: resolving } = useQuery({
    queryKey: ['resolve-servers', source, params.slug, rawLinks.map((l) => l.serverId ?? l.url).join('|')],
    queryFn: async (): Promise<StreamLink[]> => {
      const out: StreamLink[] = [];
      for (const link of rawLinks) {
        if (link.url) {
          out.push(link);
        } else if (link.serverId) {
          try {
            let resolved: any;
            if (source === 'otakudesu') {
              resolved = await otakudesu.server(link.serverId);
            } else if (source === 'samehadaku') {
              resolved = await samehadaku.server(link.serverId);
            }
            // Server response: { data: { url: "https://..." } }
            const embedUrl = resolved?.data?.url ?? resolved?.data?.embedUrl ?? resolved?.url ?? '';
            if (embedUrl) out.push({ ...link, url: embedUrl });
          } catch {
            // skip unresolvable server
          }
        }
      }
      return out;
    },
    enabled: !loadingEpisode && needsResolution,
    staleTime: 10 * 60 * 1000,
  });

  // Use resolved links if we resolved, otherwise use raw links with direct URLs only
  const links: StreamLink[] = needsResolution
    ? (resolvedLinks ?? rawLinks.filter((l) => !!l.url))
    : rawLinks.filter((l) => !!l.url);

  const isLoading = loadingEpisode || (needsResolution && resolving);

  const handleWatch = async (url: string) => {
    if (!url) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: '#0A0A0A',
        controlsColor: '#8B00FF',
        enableDefaultShareMenuItem: false,
      });
    } catch {
      try { await Linking.openURL(url); } catch { /* noop */ }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.animeName} numberOfLines={1}>{params.animeName}</Text>
          <Text style={styles.episodeTitle} numberOfLines={1}>{params.title}</Text>
        </View>
      </View>

      <View style={styles.sourceBadgeWrap}>
        <Text style={[styles.sourceBadge, { backgroundColor: badgeColor }]}>
          {(SOURCE_LABELS as Record<string, string>)[source] ?? source}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color="#8B00FF" size="large" />
            <Text style={styles.loadingText}>
              {resolving ? 'Memproses server streaming...' : 'Memuat episode...'}
            </Text>
          </View>
        ) : links.length === 0 ? (
          <View style={styles.centered}>
            <Feather name="alert-circle" size={48} color="#2D1F4E" />
            <Text style={styles.emptyTitle}>Link tidak tersedia</Text>
            <Text style={styles.emptyText}>
              Sumber ini belum mendukung streaming langsung, atau episode ini belum tersedia.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Pilih Server Streaming</Text>
            <Text style={styles.hint}>Tap server untuk menonton. Streaming dibuka di browser.</Text>
            {links.map((link, i) => (
              <TouchableOpacity
                key={i}
                style={styles.serverBtn}
                onPress={() => handleWatch(link.url)}
                activeOpacity={0.75}
              >
                <View style={[styles.serverIcon, { backgroundColor: `${badgeColor}25` }]}>
                  <Feather name="play-circle" size={22} color={badgeColor} />
                </View>
                <View style={styles.serverInfo}>
                  <Text style={styles.serverLabel} numberOfLines={1}>{link.label}</Text>
                  {link.quality ? (
                    <View style={styles.qualityBadge}>
                      <Text style={styles.qualityText}>{link.quality}</Text>
                    </View>
                  ) : null}
                </View>
                <Feather name="external-link" size={16} color="#4B5563" />
              </TouchableOpacity>
            ))}
            <Text style={styles.note}>
              Jika satu server tidak jalan, coba server lain di bawahnya.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    borderBottomWidth: 1, borderBottomColor: '#1F1F1F',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center',
  },
  headerInfo: { flex: 1 },
  animeName: { color: '#9CA3AF', fontSize: 12, marginBottom: 2 },
  episodeTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  sourceBadgeWrap: { paddingHorizontal: 16, paddingTop: 12 },
  sourceBadge: {
    color: '#FFF', fontSize: 10, fontWeight: '700',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5,
    alignSelf: 'flex-start', overflow: 'hidden',
  },
  content: { padding: 16, paddingBottom: 60 },
  centered: { paddingTop: 60, alignItems: 'center', gap: 12 },
  loadingText: { color: '#6B7280', fontSize: 14, textAlign: 'center' },
  emptyTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginTop: 8 },
  emptyText: { color: '#6B7280', fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  hint: { color: '#4B5563', fontSize: 12, marginBottom: 16 },
  serverBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#141414', borderRadius: 14,
    padding: 14, marginBottom: 10, gap: 12,
    borderWidth: 1, borderColor: '#1F1F1F',
  },
  serverIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  serverInfo: { flex: 1, gap: 4 },
  serverLabel: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  qualityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(139,0,255,0.2)',
    borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  qualityText: { color: '#8B00FF', fontSize: 10, fontWeight: '700' },
  note: {
    color: '#4B5563', fontSize: 11, textAlign: 'center',
    marginTop: 20, lineHeight: 17,
  },
});
