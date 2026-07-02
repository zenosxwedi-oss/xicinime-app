export type ApiSource =
  | 'otakudesu' | 'samehadaku' | 'donghua' | 'animasu' | 'kusonime'
  | 'anoboy' | 'oploverz' | 'animekuindo' | 'nimegami' | 'alqanime'
  | 'donghub' | 'winbu' | 'drachin' | 'dramabox' | 'kuramanime'
  | 'stream' | 'neko';

export type ContentType = 'anime' | 'movie' | 'series' | 'film' | 'donghua' | 'drama';

export interface ContentItem {
  id: string;
  title: string;
  poster: string;
  source: ApiSource;
  slug: string;
  contentType: ContentType;
  episodes?: string | number;
  status?: string;
  score?: string;
  genres?: string[];
  extraId?: string;  // kuramanime: numeric id
  bookId?: string;   // dramabox: bookId
}

export interface FavoriteItem extends ContentItem {
  savedAt: number;
}

export const SOURCE_LABELS: Record<ApiSource, string> = {
  otakudesu: 'Otakudesu',
  samehadaku: 'Samehadaku',
  donghua: 'Donghua',
  animasu: 'Animasu',
  kusonime: 'Kusonime',
  anoboy: 'Anoboy',
  oploverz: 'Oploverz',
  animekuindo: 'Animekuindo',
  nimegami: 'Nimegami',
  alqanime: 'Alqanime',
  donghub: 'Donghub',
  winbu: 'Winbu',
  drachin: 'Drachin',
  dramabox: 'Dramabox',
  kuramanime: 'Kuramanime',
  stream: 'Stream',
  neko: 'Nekopoi',
};

export const SOURCE_COLORS: Record<ApiSource, string> = {
  otakudesu: '#8B00FF',
  samehadaku: '#E91E63',
  donghua: '#FF6D00',
  animasu: '#00BCD4',
  kusonime: '#4CAF50',
  anoboy: '#FF5722',
  oploverz: '#9C27B0',
  animekuindo: '#3F51B5',
  nimegami: '#F44336',
  alqanime: '#009688',
  donghub: '#FF9800',
  winbu: '#2196F3',
  drachin: '#795548',
  dramabox: '#607D8B',
  kuramanime: '#673AB7',
  stream: '#0F9D58',
  neko: '#F50057',
};
