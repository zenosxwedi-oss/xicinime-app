import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFavorites } from '@/hooks/useFavorites';
import { AnimeCard } from '@/components/AnimeCard';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - 16 * 2 - 10) / 2;
const CARD_H = CARD_W * 1.4;

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { favorites, removeFavorite, loaded } = useFavorites();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : 0;

  const handleRemove = (id: string, source: string, title: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Hapus Favorit', `Hapus "${title}" dari favorit?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => removeFavorite(id, source),
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <Text style={styles.title}>❤️ Favorit</Text>
      <Text style={styles.subtitle}>{favorites.length} konten tersimpan</Text>

      {loaded && favorites.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="heart" size={48} color="#1F1F1F" />
          <Text style={styles.emptyTitle}>Belum ada favorit</Text>
          <Text style={styles.emptyText}>Tambahkan anime, donghua, atau drama favoritmu</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => `${item.source}-${item.id}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.grid, { paddingBottom: 100 + botPad }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <AnimeCard item={item} width={CARD_W} height={CARD_H} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemove(item.id, item.source, item.title)}
              >
                <Feather name="trash-2" size={12} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 13,
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 2,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptyText: { color: '#6B7280', fontSize: 13, textAlign: 'center' },
  grid: { paddingHorizontal: 16 },
  row: { gap: 10, marginBottom: 10 },
  cardWrap: { position: 'relative' },
  removeBtn: {
    position: 'absolute',
    bottom: 30,
    right: 6,
    backgroundColor: 'rgba(239,68,68,0.85)',
    borderRadius: 12,
    padding: 4,
  },
});
