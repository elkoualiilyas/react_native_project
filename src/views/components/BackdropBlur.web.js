import { StyleSheet, View } from 'react-native';

export default function BackdropBlur({ style }) {
  return <View style={[StyleSheet.absoluteFill, style, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />;
}

