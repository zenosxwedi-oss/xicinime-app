// Custom Expo config plugin: inject Google AdMob App ID ke AndroidManifest.xml
const { withAndroidManifest } = require('expo/config-plugins');

const ADMOB_APP_ID = 'ca-app-pub-3848627834535677~3573045936';
const ADMOB_META_NAME = 'com.google.android.gms.ads.APPLICATION_ID';

const withAdMob = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    // Pastikan xmlns:tools ada di root manifest
    if (!manifest.manifest.$) manifest.manifest.$ = {};
    manifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    const app = manifest.manifest.application[0];
    if (!app['meta-data']) app['meta-data'] = [];

    // Hapus entri lama kalau ada
    app['meta-data'] = app['meta-data'].filter(
      (m) => m.$?.['android:name'] !== ADMOB_META_NAME
    );

    // Tambah dengan tools:replace untuk override nilai kosong dari library
    app['meta-data'].push({
      $: {
        'android:name': ADMOB_META_NAME,
        'android:value': ADMOB_APP_ID,
        'tools:replace': 'android:value',
      },
    });

    return config;
  });
};

module.exports = withAdMob;
