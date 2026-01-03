import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

export default function EventMap({ title, address, lat, lng, style }) {
  const url = `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`;

  return (
    <View style={[style, styles.container]}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.address} numberOfLines={2}>
        {address}
      </Text>
      <Pressable
        onPress={() => Linking.openURL(url)}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}
      >
        <Text style={styles.buttonText}>Open in Maps</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '900',
    color: '#111827',
  },
  address: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
  },
});

