// src/views/components/EventCard.js

import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import * as Haptics from 'expo-haptics';

function formatPrice(price) {
  if (price === undefined || price === null || price === 0) {
    return 'Free';
  }
  return `$${price}`;
}

function formatDate(dateIso) {
  try {
    return new Date(dateIso).toLocaleString();
  } catch {
    return dateIso;
  }
}

/**
 * @param {{
 *  event: import('../../models/Event').Event,
 *  onPress: () => void,
 *  interested: boolean,
 *  joined: boolean,
 *  onToggleInterested: () => void,
 *  onJoin: () => void,
 *  onChat: () => void
 * }} props
 */
export default function EventCard({ event, onPress, interested, joined, onToggleInterested, onJoin, onChat }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  function pressIn() {
    scale.value = withSpring(0.95, { damping: 16, stiffness: 220 });
  }

  function pressOut() {
    scale.value = withSpring(1.05, { damping: 16, stiffness: 220 }, () => {
      scale.value = withSpring(1, { damping: 16, stiffness: 220 });
    });
  }

  return (
    <Animated.View style={[styles.card, animStyle]}>
      <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={styles.topPressable}>
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={styles.price}>{formatPrice(event.price)}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.badge}>{event.category}</Text>
        <Text style={styles.date} numberOfLines={1}>
          {formatDate(event.date)}
        </Text>
      </View>

      </Pressable>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={async () => {
            try {
              await Haptics.selectionAsync();
            } catch {}
            onToggleInterested();
          }}
          onPressIn={pressIn}
          onPressOut={pressOut}
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionPressed]}
        >
          <Feather name="heart" size={18} color={interested ? '#FF6B6B' : '#0F4C5C'} />
          <Text style={[styles.actionText, interested && { color: '#FF6B6B' }]}>I'm Interested</Text>
        </Pressable>

        <Pressable
          onPress={async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch {}
            onJoin();
          }}
          onPressIn={pressIn}
          onPressOut={pressOut}
          style={({ pressed }) => [
            styles.actionBtn,
            joined && styles.actionBtnActive,
            pressed && styles.actionPressed,
          ]}
        >
          <Feather name="check-circle" size={18} color={joined ? '#F8F9FA' : '#0F4C5C'} />
          <Text style={[styles.actionText, joined && styles.actionTextActive]}>Join Event</Text>
        </Pressable>

        <Pressable
          onPress={async () => {
            try {
              await Haptics.selectionAsync();
            } catch {}
            onChat();
          }}
          onPressIn={pressIn}
          onPressOut={pressOut}
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionPressed]}
        >
          <Feather name="message-circle" size={18} color="#0F4C5C" />
          <Text style={styles.actionText}>Chat About This</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  topPressable: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: '#2D3436',
  },
  price: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#00D4AA',
  },
  metaRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  badge: {
    textTransform: 'capitalize',
    backgroundColor: 'rgba(0,212,170,0.12)',
    color: '#0F4C5C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 12,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  date: {
    flex: 1,
    textAlign: 'right',
    color: '#636E72',
    fontSize: 12,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(15,76,92,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(15,76,92,0.10)',
  },
  actionBtnActive: {
    backgroundColor: '#0F4C5C',
    borderColor: '#0F4C5C',
  },
  actionPressed: { opacity: 0.9 },
  actionText: { fontSize: 12, fontFamily: 'SpaceGrotesk_700Bold', color: '#0F4C5C' },
  actionTextActive: { color: '#F8F9FA' },
});
