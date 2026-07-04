import React, { useRef, useState, useEffect } from 'react';
import { Platform, View } from 'react-native';

const AD_UNIT_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/6300978111' // Google test banner ID
  : 'ca-app-pub-3848627834535677/5316005468';

export function AdBanner() {
  const BannerAdRef = useRef<any>(null);
  const BannerAdSizeRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    // Muat AdMob 3 detik setelah app terbuka — jauh setelah splash hilang
    // Ini mencegah SDK AdMob mempengaruhi startup app
    const t = setTimeout(async () => {
      try {
        const mod = require('react-native-google-mobile-ads');

        // Inisialisasi SDK eksplisit agar iklan lebih reliabel
        await mod.MobileAds().initialize();

        BannerAdRef.current = mod.BannerAd;
        BannerAdSizeRef.current = mod.BannerAdSize.ANCHORED_ADAPTIVE_BANNER;
        setReady(true);
      } catch {
        // SDK tidak tersedia atau crash — sembunyikan banner, jangan crash app
        setFailed(true);
      }
    }, 3000);

    return () => clearTimeout(t);
  }, []);

  if (
    Platform.OS !== 'android' ||
    !ready ||
    failed ||
    !BannerAdRef.current ||
    !BannerAdSizeRef.current
  ) {
    return null;
  }

  const BannerAdComponent = BannerAdRef.current;
  const bannerSize = BannerAdSizeRef.current;

  return (
    <View style={{ alignItems: 'center', backgroundColor: '#0A0A0A', paddingVertical: 4 }}>
      <BannerAdComponent
        unitId={AD_UNIT_ID}
        size={bannerSize}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}
