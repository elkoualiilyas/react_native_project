import { StyleSheet, View } from 'react-native';

export default function SkeletonEventCard() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.block, { height: 14, width: '62%' }]} />
        <View style={[styles.block, { height: 14, width: 54 }]} />
      </View>
      <View style={styles.metaRow}>
        <View style={[styles.block, { height: 18, width: 90, borderRadius: 999 }]} />
        <View style={[styles.block, { height: 12, width: '40%' }]} />
      </View>
      <View style={styles.actionsRow}>
        <View style={[styles.block, styles.action]} />
        <View style={[styles.block, styles.action]} />
        <View style={[styles.block, styles.action]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(15,76,92,0.10)',
  },
  block: {
    backgroundColor: 'rgba(99,110,114,0.18)',
    borderRadius: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  metaRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  actionsRow: { marginTop: 14, flexDirection: 'row', gap: 8 },
  action: { flex: 1, height: 38, borderRadius: 12 },
});

