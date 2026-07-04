import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-3848627834535677/5316005468';

export function AdBanner() {
  const [failed, setFailed] = useState(false);

  // Hanya tampil di Android, dan kalau tidak error
  if (Platform.OS !== 'android' || failed) return null;

  return (
    <View style={{ alignItems: 'center', backgroundColor: '#0A0A0A', paddingVertical: 4 }}>
      <BannerAd
        unitId={AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}
