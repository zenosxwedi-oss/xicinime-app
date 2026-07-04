import React, { useState, useEffect } from 'react';
import { Platform, View } from 'react-native';

const AD_UNIT_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/6300978111' // Google test banner ID
  : 'ca-app-pub-3848627834535677/5316005468';

// Lazy import AdMob agar tidak crash saat inisialisasi
let BannerAdComponent: any = null;
let BannerAdSizeVal: any = null;

export function AdBanner() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    // Muat AdMob setelah 3 detik, jauh setelah app terbuka
    const t = setTimeout(() => {
      try {
        const mod = require('react-native-google-mobile-ads');
        BannerAdComponent = mod.BannerAd;
        BannerAdSizeVal = mod.BannerAdSize.ANCHORED_ADAPTIVE_BANNER;
        setReady(true);
      } catch {
        setFailed(true);
      }
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  if (Platform.OS !== 'android' || !ready || failed || !BannerAdComponent) {
    return null;
  }

  return (
    <View style={{ alignItems: 'center', backgroundColor: '#0A0A0A', paddingVertical: 4 }}>
      <BannerAdComponent
        unitId={AD_UNIT_ID}
        size={BannerAdSizeVal}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}
