import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAdminRequestsController } from '../../controllers/AdminRequestsController';

function statusColor(status) {
  if (status === 'APPROVED') return '#16A34A';
  if (status === 'REJECTED') return '#EF4444';
  return '#F59E0B';
}

export default function AdminRequestsScreen({ token }) {
  const { requests, loading, approve, reject } = useAdminRequestsController(token);

  async function onApprove(id) {
    try {
      await approve(id);
    } catch (e) {
      Alert.alert('Approve failed', e?.message ?? 'Please try again');
    }
  }

  async function onReject(id) {
    try {
      await reject(id);
    } catch (e) {
      Alert.alert('Reject failed', e?.message ?? 'Please try again');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Requests</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(r) => r.id}
          contentContainerStyle={requests.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No requests</Text>
              <Text style={styles.emptyText}>Students requests will appear here.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.userId} numberOfLines={1}>
                  User: {item.userId}
                </Text>
                <Text style={[styles.status, { color: statusColor(item.status) }]}>{item.status}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => onApprove(item.id)}
                  disabled={item.status !== 'PENDING'}
                  style={({ pressed }) => [
                    styles.approveBtn,
                    pressed && item.status === 'PENDING' && { opacity: 0.9 },
                    item.status !== 'PENDING' && styles.btnDisabled,
                  ]}
                >
                  <Text style={styles.btnText}>Approve</Text>
                </Pressable>
                <Pressable
                  onPress={() => onReject(item.id)}
                  disabled={item.status !== 'PENDING'}
                  style={({ pressed }) => [
                    styles.rejectBtn,
                    pressed && item.status === 'PENDING' && { opacity: 0.9 },
                    item.status !== 'PENDING' && styles.btnDisabled,
                  ]}
                >
                  <Text style={styles.btnText}>Reject</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  userId: {
    flex: 1,
    fontWeight: '800',
    color: '#111827',
  },
  status: {
    fontWeight: '900',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  btnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  empty: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontWeight: '900',
    fontSize: 16,
    color: '#111827',
  },
  emptyText: {
    marginTop: 6,
    textAlign: 'center',
    color: '#6B7280',
  },
});

