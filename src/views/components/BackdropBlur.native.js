import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

export default function BackdropBlur({ style, blurAmount = 12 }) {
  return (
    <BlurView
      style={[StyleSheet.absoluteFill, style]}
      intensity={blurAmount}
      tint="light"
    />
  );
}
