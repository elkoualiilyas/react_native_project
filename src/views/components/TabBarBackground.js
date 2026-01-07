import { StyleSheet, View } from 'react-native';
import BackdropBlur from './BackdropBlur';

export default function TabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <BackdropBlur />
      <View style={styles.tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248,249,250,0.70)',
  },
});

