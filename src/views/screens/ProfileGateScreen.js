import { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';

import { UserRepository } from '../../repositories/UserRepository';

export default function ProfileGateScreen({ navigation, userId }) {
  useEffect(() => {
    let active = true;
    async function run() {
      try {
        const user = await UserRepository.getUserById(userId);
        if (!active) return;
        if (user?.profileComplete) {
          navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'ProfileSetup' }] });
        }
      } catch {
        if (!active) return;
        navigation.reset({ index: 0, routes: [{ name: 'ProfileSetup' }] });
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [navigation, userId]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

