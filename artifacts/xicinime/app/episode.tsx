import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  otakudesu, samehadaku, donghua, animasu, kusonime,
  anoboy, oploverz, alqanime, kuramanime,
  donghub, winbu, drachin,
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

async function fetchEpisode(source: ApiSource, slug: string, extraId?: string, episodeIndex?: number): Promise<any> {
  switch (source) {
    case 'otakudesu': return otakudesu.episode(slug);
    case 'samehadaku': return samehadaku.episode(slug);
    case 'donghua': return donghua.episode(slug);
    case 'animasu': return animasu.episode(slug);
    case 'kusonime': return kusonime.episode(slug);
    case 'anoboy': return anoboy.episode(slug);
    case 'oploverz': return oploverz.episode(slug);
    case 'alqanime': return alqanime.episode(slug);
    case 'donghub': return donghub.episode(slug);
    case 'winbu': return winbu.episode(slug);
    case 'drachin': return drachin.episode(slug, episodeIndex ?? 1);
    case 'kuramanime': {
      const parts = slug.split('/');
      return kuramanime.watch(extraId ?? parts[0], parts[1] ?? '', Number(parts[2] ?? episodeIndex ?? 1));
    }
    default: return null;
  }
}

function extractStreamingLinks(source: ApiSource, raw: any): Array<{ label: string; url: string; serverId?: string }> {
  if (!raw) return [];
  const d = raw.data ?? raw;
  const links: Array<{ label: string; url: string; serverId?: string }> = [];

  // Generic: look for servers array with direct URLs
  const servers: any[] = d.servers ?? d.server ?? d.streamingLink ?? d.links ?? [];
  if (Array.isArray(servers)) {
    servers.forEach((s: any) => {
      const url = s.url ?? s.href ?? s.streamUrl ?? s.link ?? s.embed ?? s.embedUrl ?? '';
      const sid = s.serverId ?? s.id ?? '';
      const label = s.quality ?? s.serverName ?? s.name ?? s.resolution ?? 'Stream';
      if (url) links.push({ label, url });
      else if (sid) links.push({ label, url: '', serverId: sid });
    });
  }

  // Otakudesu / Samehadaku: serverList with IDs needing resolution
  const serverList: any[] = d.serverList ?? d.streamingServer ?? d.mirrorList ?? [];
  if (Array.isArray(serverList)) {
    serverList.forEach((s: any) => {
      const sid = s.serverId ?? s.id ?? '';
      const url = s.streamUrl ?? s.embedUrl ?? s.url ?? s.mirror ?? '';
      const label = s.serverName ?? s.quality ?? s.name ?? 'Server';
      if (url) links.push({ label, url });
      else if (sid) links.push({ label, url: '', serverId: sid });
    });
  }

  // Direct video / embed URLs
  const directUrl = d.videoUrl ?? d.streamUrl ?? d.embedUrl ?? d.mp4Url ?? d.url ?? '';
  if (directUrl && !links.find((l) => l.url === directUrl)) {
    links.push({ label: 'Tonton Sekarang', url: directUrl });
  }

  // Drachin: direct MP4
  const mp4 = d.mp4 ?? d.video ?? d.source ?? '';
  if (mp4 && !links.find((l) => l.url === mp4)) {
    links.push({ label: 'MP4 Direct', url: mp4 });
  }

  return links;
}

export default function EpisodeScreen() {
  const params = useLocalSearchParams<Params>();
  const insets = useSafeAreaInsets();
  const source = params.source as ApiSource;
  const episodeIndex = Number(params.episodeIndex ?? 1);

  const { data: rawEpisode, isLoading } = useQuery({
    queryKey: ['episode', source, params.slug],
    queryFn: () => fetchEpisode(source, params.slug, params.extraId, episodeIndex),
    staleTime: 10 * 60 * 1000,
  });

  const rawLinks = extractStreamingLinks(source, rawEpisode);
  const badgeColor = (SOURCE_COLORS as Record<string, string>)[source] ?? '#8B00FF';

  // Resolve server IDs to embed URLs using the provider's server endpoint
  const { data: resolvedLinks, isLoading: resolvingServers } = useQuery({
    queryKey: ['resolve-servers', source, params.slug, rawLinks.map((l) => l.serverId).join(',')],
    queryFn: async (): Promise<Array<{ label: string; url: string }>> => {
      const results: Array<{ label: string; url: string }> = [];
      for (const link of rawLinks) {
        if (link.url) {
          results.push({ label: link.label, url: link.url });
        } else if (link.serverId) {
          try {
            let resolved: any;
            if (source === 'otakudesu') {
              resolved = await otakudesu.server(link.serverId);
            } else if (source === 'samehadaku') {
              resolved = await samehadaku.server(link.serverId);
            }
            const url = resolved?.data?.url ?? resolved?.data?.embedUrl ?? resolved?.url ?? '';
            if (url) results.push({ label: link.label, url });
          } catch {
            // skip unresolvable servers
          }
        }
      }
      return results;
    },
    enabled: rawLinks.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  const links = resolvedLinks ?? rawLinks.filter((l) => l.url).map(({ label, url }) => ({ label, url }));
  const linksLoading = isLoading || resolvingServers;

  const handleWatch = async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!url) return;
    try {
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: '#0A0A0A',
        controlsColor: '#8B00FF',
      });
    } catch {
      try {
        await Linking.openURL(url);
      } catch {
        // noop
      }
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

      {/* Source badge */}
      <View style={styles.sourceBadgeWrap}>
        <Text style={[styles.sourceBadge, { backgroundColor: badgeColor }]}>
          {(SOURCE_LABELS as Record<string, string>)[source] ?? source}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {linksLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#8B00FF" size="large" />
            <Text style={styles.loadingText}>Memuat link streaming...</Text>
          </View>
        ) : links.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="alert-circle" size={40} color="#1F1F1F" />
            <Text style={styles.emptyTitle}>Link tidak tersedia</Text>
            <Text style={styles.emptyText}>Coba kembali atau pilih episode lain</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Pilih Server Streaming</Text>
            {links.map((link, i) => (
              <TouchableOpacity
                key={i}
                style={styles.serverBtn}
                onPress={() => handleWatch(link.url)}
                activeOpacity={0.7}
              >
                <View style={styles.serverIcon}>
                  <Feather name="play" size={18} color="#8B00FF" />
                </View>
                <View style={styles.serverInfo}>
                  <Text style={styles.serverLabel}>{link.label}</Text>
                  <Text style={styles.serverUrl} numberOfLines={1}>{link.url}</Text>
                </View>
                <Feather name="external-link" size={16} color="#6B7280" />
              </TouchableOpacity>
            ))}
            <Text style={styles.note}>
              * Streaming akan dibuka di browser bawaan perangkat
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: { flex: 1 },
  animeName: { color: '#9CA3AF', fontSize: 12, marginBottom: 2 },
  episodeTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  sourceBadgeWrap: { paddingHorizontal: 16, paddingTop: 12 },
  sourceBadge: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  content: { padding: 16, paddingBottom: 60 },
  loading: { paddingTop: 60, alignItems: 'center', gap: 12 },
  loadingText: { color: '#6B7280', fontSize: 14 },
  empty: { paddingTop: 60, alignItems: 'center', gap: 10 },
  emptyTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginTop: 8 },
  emptyText: { color: '#6B7280', fontSize: 13, textAlign: 'center' },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  serverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  serverIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(139,0,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serverInfo: { flex: 1 },
  serverLabel: { color: '#FFF', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  serverUrl: { color: '#6B7280', fontSize: 10 },
  note: {
    color: '#4B5563',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
});
