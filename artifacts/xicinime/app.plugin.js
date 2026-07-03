const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Plugin custom untuk menambahkan Google AdMob App ID ke AndroidManifest.xml
 * tanpa memerlukan react-native-google-mobile-ads plugin
 */
const withAdMob = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    if (!mainApplication['meta-data']) {
      mainApplication['meta-data'] = [];
    }

    // Hapus entri lama kalau ada
    mainApplication['meta-data'] = mainApplication['meta-data'].filter(
      (m) => m.$?.['android:name'] !== 'com.google.android.gms.ads.APPLICATION_ID'
    );

    // Tambah AdMob App ID
    mainApplication['meta-data'].push({
      $: {
        'android:name': 'com.google.android.gms.ads.APPLICATION_ID',
        'android:value': 'ca-app-pub-3848627834535677~3573045936',
      },
    });

    return config;
  });
};

module.exports = withAdMob;
