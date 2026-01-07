import { StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';

export default function BackdropBlur({ style, blurAmount = 12 }) {
  return <BlurView style={[StyleSheet.absoluteFill, style]} blurType="light" blurAmount={blurAmount} />;
}

