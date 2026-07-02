import { useEffect, useRef } from 'react';
import { Animated, Dimensions, FlatList, StyleSheet, View } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

interface Props {
  count?: number;
  width?: number;
  height?: number;
}

function SkeletonCard({ width = SCREEN_W * 0.38, height = 200 }: { width?: number; height?: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, [anim]);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <Animated.View style={[styles.card, { width, height, opacity }]} />
  );
}

export function SkeletonLoader({ count = 5, width, height }: Props) {
  return (
    <FlatList
      data={Array.from({ length: count }, (_, i) => i)}
      keyExtractor={(i) => String(i)}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      renderItem={() => <SkeletonCard width={width} height={height} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingLeft: 16 },
  card: {
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    marginRight: 10,
  },
});
