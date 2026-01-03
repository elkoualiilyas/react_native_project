import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useAdminUsersController } from '../../controllers/AdminUsersController';

export default function AdminUsersScreen({ token }) {
  const { users, loading, toggleCanCreate, deleteUser } = useAdminUsersController(token);

  async function onDelete(userId) {
    try {
      await deleteUser(userId);
    } catch (e) {
      Alert.alert('Delete failed', e?.message ?? 'Please try again');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          contentContainerStyle={users.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No users yet</Text>
              <Text style={styles.emptyText}>Users appear after sign up.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.email} numberOfLines={1}>
                  {item.email}
                </Text>
              </View>

              <View style={styles.right}>
                <View style={styles.toggleWrap}>
                  <Text style={styles.toggleLabel}>Can create</Text>
                  <Switch
                    value={!!item.canCreateEvents}
                    onValueChange={(v) => toggleCanCreate(item.id, v)}
                  />
                </View>
                <Pressable
                  onPress={() => onDelete(item.id)}
                  style={({ pressed }) => [styles.dangerBtn, pressed && { opacity: 0.9 }]}
                >
                  <Text style={styles.dangerBtnText}>Delete</Text>
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
  row: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  name: {
    fontWeight: '900',
    color: '#111827',
  },
  email: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 12,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  toggleWrap: {
    alignItems: 'flex-end',
  },
  toggleLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
    marginBottom: 4,
  },
  dangerBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  dangerBtnText: {
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

