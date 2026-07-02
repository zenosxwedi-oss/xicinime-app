import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { ContentItem, FavoriteItem } from '@/types/api';

const STORAGE_KEY = 'xicinime_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setFavorites(JSON.parse(raw));
        } catch {
          setFavorites([]);
        }
      }
      setLoaded(true);
    });
  }, []);

  const save = useCallback(async (items: FavoriteItem[]) => {
    setFavorites(items);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const addFavorite = useCallback(
    async (item: ContentItem) => {
      const exists = favorites.some((f) => f.id === item.id && f.source === item.source);
      if (exists) return;
      const next = [{ ...item, savedAt: Date.now() }, ...favorites];
      await save(next);
    },
    [favorites, save],
  );

  const removeFavorite = useCallback(
    async (id: string, source: string) => {
      const next = favorites.filter((f) => !(f.id === id && f.source === source));
      await save(next);
    },
    [favorites, save],
  );

  const isFavorite = useCallback(
    (id: string, source: string) => favorites.some((f) => f.id === id && f.source === source),
    [favorites],
  );

  return { favorites, addFavorite, removeFavorite, isFavorite, loaded };
}
