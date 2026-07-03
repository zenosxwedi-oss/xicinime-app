// Custom Expo config plugin: inject Google AdMob App ID ke AndroidManifest.xml
const { withAndroidManifest } = require('expo/config-plugins');

const withAdMob = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const app = manifest.manifest.application[0];
    if (!app['meta-data']) app['meta-data'] = [];
    // Hapus entri lama
    app['meta-data'] = app['meta-data'].filter(
      (m) => m.$?.['android:name'] !== 'com.google.android.gms.ads.APPLICATION_ID'
    );
    // Tambah AdMob App ID
    app['meta-data'].push({
      $: {
        'android:name': 'com.google.android.gms.ads.APPLICATION_ID',
        'android:value': 'ca-app-pub-3848627834535677~3573045936',
      },
    });
    return config;
  });
};

module.exports = withAdMob;
