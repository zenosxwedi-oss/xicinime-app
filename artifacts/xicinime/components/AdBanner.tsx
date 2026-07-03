import React from 'react';
import { Platform, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Gunakan test ID saat development, ad unit asli saat production
const AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-3848627834535677/5316005468';

export function AdBanner() {
  if (Platform.OS === 'web') return null;
  return (
    <View style={{ alignItems: 'center', backgroundColor: '#0A0A0A', paddingVertical: 4 }}>
      <BannerAd
        unitId={AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}
