import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GiftedChat, InputToolbar } from 'react-native-gifted-chat';

import Feather from 'react-native-vector-icons/Feather';
import { addDoc, collection, doc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';

import { getFirestoreDb } from '../../config/firebase';
import { EventRepository } from '../../repositories/EventRepository';
import { UserRepository } from '../../repositories/UserRepository';
import BackdropBlur from './BackdropBlur';

const ROOM_GLOBAL = 'global';

function toRoomId(eventId) {
  return eventId ? String(eventId) : ROOM_GLOBAL;
}

function normalizeDocToMessage(d) {
  const data = d.data() || {};
  return {
    _id: d.id,
    text: typeof data.text === 'string' ? data.text : '',
    createdAt: new Date(Number(data.createdAtMs || Date.now())),
    user: {
      _id: String(data.userId || 'unknown'),
      name: typeof data.userName === 'string' ? data.userName : 'User',
    },
    image: typeof data.image === 'string' && data.image.length > 0 ? data.image : undefined,
    readBy: Array.isArray(data.readBy) ? data.readBy : [],
    eventId: typeof data.eventId === 'string' ? data.eventId : ROOM_GLOBAL,
  };
}

export default function GlobalChatModal({ visible, onClose, userId, initialEventId }) {
  const [firestore, setFirestore] = useState(null);
  const [firestoreError, setFirestoreError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(ROOM_GLOBAL);
  const [userName, setUserName] = useState('You');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!visible) return;
    try {
      setFirestore(getFirestoreDb());
      setFirestoreError(null);
    } catch (e) {
      setFirestore(null);
      setFirestoreError(e?.message ?? 'Firebase error');
    }
  }, [visible]);

  const roomId = useMemo(() => toRoomId(selectedEventId), [selectedEventId]);

  const sheetProgress = useSharedValue(0);
  const backdropProgress = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    setSelectedEventId(toRoomId(initialEventId));
  }, [initialEventId, visible]);

  useEffect(() => {
    let active = true;
    async function load() {
      const u = await UserRepository.getUserById(userId);
      if (!active) return;
      setUserName(u?.displayName || u?.name || 'You');
    }
    if (visible) load();
    return () => {
      active = false;
    };
  }, [userId, visible]);

  useEffect(() => {
    let active = true;
    async function loadEvents() {
      try {
        const loaded = await EventRepository.getAllEvents();
        if (!active) return;
        setEvents(loaded);
      } catch {
        if (!active) return;
        setEvents([]);
      }
    }
    if (visible) loadEvents();
    return () => {
      active = false;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    backdropProgress.value = withTiming(1, { duration: 200 });
    sheetProgress.value = withSpring(1, { damping: 18, stiffness: 180 });
  }, [backdropProgress, sheetProgress, visible]);

  useEffect(() => {
    if (!visible) return;
    if (!firestore) return;
    const presenceRef = doc(firestore, 'global_presence', `${userId}__${roomId}`);
    const start = async () => {
      await setDoc(
        presenceRef,
        { userId, roomId, userName, lastActiveAt: serverTimestamp() },
        { merge: true }
      );
    };
    start();
    const interval = setInterval(() => {
      setDoc(presenceRef, { lastActiveAt: serverTimestamp(), userName }, { merge: true }).catch(() => {});
    }, 30000);
    return () => {
      clearInterval(interval);
      setDoc(presenceRef, { lastActiveAt: serverTimestamp(), userName }, { merge: true }).catch(() => {});
    };
  }, [roomId, userId, userName, visible]);

  useEffect(() => {
    if (!visible) return;
    if (!firestore) return;
    const q = query(
      collection(firestore, 'global_presence'),
      where('roomId', '==', roomId),
      orderBy('lastActiveAt', 'desc'),
      limit(25)
    );
    return onSnapshot(q, (snap) => {
      const now = Date.now();
      const list = snap.docs
        .map((d) => {
          const data = d.data() || {};
          return {
            userId: String(data.userId || ''),
            userName: String(data.userName || ''),
            lastActiveAtMs: data.lastActiveAt?.toMillis ? data.lastActiveAt.toMillis() : 0,
          };
        })
        .filter((u) => u.userId && now - u.lastActiveAtMs < 70000);
      setOnlineUsers(list);
    });
  }, [roomId, visible]);

  useEffect(() => {
    if (!visible) return;
    if (!firestore) return;
    const q = query(
      collection(firestore, 'global_chat'),
      where('eventId', '==', roomId),
      orderBy('createdAtMs', 'desc'),
      limit(80)
    );
    return onSnapshot(q, (snap) => {
      const mapped = snap.docs.map(normalizeDocToMessage);
      setMessages(mapped);
      const unread = snap.docs
        .filter((d) => {
          const data = d.data() || {};
          const readBy = Array.isArray(data.readBy) ? data.readBy : [];
          return String(data.userId || '') !== String(userId) && !readBy.includes(userId);
        })
        .slice(0, 15);
      for (const d of unread) {
        const current = Array.isArray(d.data().readBy) ? d.data().readBy : [];
        const next = Array.from(new Set([...current.map(String), String(userId)]));
        updateDoc(doc(firestore, 'global_chat', d.id), { readBy: next }).catch(() => {});
      }
    });
  }, [roomId, userId, visible]);

  const sheetStyle = useAnimatedStyle(() => {
    const translateY = (1 - sheetProgress.value) * 520;
    return {
      transform: [{ translateY }],
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropProgress.value,
    };
  });

  function close() {
    backdropProgress.value = withTiming(0, { duration: 180 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
    sheetProgress.value = withSpring(0, { damping: 20, stiffness: 180 });
  }

  async function onSend(newMessages = []) {
    if (!firestore) return;
    const msg = newMessages[0];
    if (!msg) return;
    const payload = {
      eventId: roomId,
      text: typeof msg.text === 'string' ? msg.text : '',
      image: typeof msg.image === 'string' ? msg.image : '',
      createdAt: serverTimestamp(),
      createdAtMs: Date.now(),
      userId: String(userId),
      userName,
      readBy: [String(userId)],
    };
    await addDoc(collection(firestore, 'global_chat'), payload);
  }

  async function pickPhoto(onPick) {
    if (Platform.OS === 'web') return;
    const ImagePicker = await import('expo-image-picker');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if (result.canceled) return;
    const asset = result.assets?.[0];
    const base64 = asset?.base64;
    if (typeof base64 !== 'string' || base64.length === 0) return;
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    onPick(dataUrl);
  }

  const roomLabel = useMemo(() => {
    if (roomId === ROOM_GLOBAL) return 'Global';
    const e = events.find((x) => String(x.id) === String(roomId));
    return e?.title || 'Event Chat';
  }, [events, roomId]);

  const onlineLabel = useMemo(() => {
    const others = onlineUsers.filter((u) => u.userId !== String(userId));
    if (others.length === 0) return 'No one online';
    if (others.length === 1) return `${others[0].userName || 'Someone'} online`;
    return `${others.length} online`;
  }, [onlineUsers, userId]);

  const emojiRow = useMemo(() => ['😀', '😂', '😍', '🔥', '🎉', '👍', '🙏', '😎', '🥳', '❤️', '💬', '🚀'], []);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <BackdropBlur />
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      <Animated.View style={[styles.sheet, sheetStyle]}>
        <View style={styles.sheetHeader}>
          <Pressable
            onPress={() => setMenuOpen((v) => !v)}
            style={({ pressed }) => [styles.roomPill, pressed && styles.pillPressed]}
          >
            <Text style={styles.roomText} numberOfLines={1}>
              {roomLabel}
            </Text>
            <Feather name="chevron-down" size={18} color="#0F4C5C" />
          </Pressable>

          <View style={styles.onlinePill}>
            <View style={styles.dot} />
            <Text style={styles.onlineText}>{onlineLabel}</Text>
          </View>

          <Pressable onPress={close} style={({ pressed }) => [styles.closeBtn, pressed && styles.pillPressed]}>
            <Feather name="x" size={20} color="#2D3436" />
          </Pressable>
        </View>

        {menuOpen ? (
          <View style={styles.menu}>
            <ScrollView style={{ maxHeight: 200 }}>
              <Pressable
                onPress={() => {
                  setSelectedEventId(ROOM_GLOBAL);
                  setMenuOpen(false);
                }}
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}
              >
                <Text style={styles.menuItemText}>Global</Text>
              </Pressable>
              {events.map((e) => (
                <Pressable
                  key={e.id}
                  onPress={() => {
                    setSelectedEventId(String(e.id));
                    setMenuOpen(false);
                  }}
                  style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}
                >
                  <Text style={styles.menuItemText} numberOfLines={1}>
                    {e.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.chatWrap}>
          {firestoreError ? (
            <View style={styles.errorWrap}>
              <Text style={styles.errorTitle}>Chat unavailable</Text>
              <Text style={styles.errorText}>{firestoreError}</Text>
            </View>
          ) : null}
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={{ _id: String(userId), name: userName }}
            alwaysShowSend
            textInputProps={{
              placeholderTextColor: '#636E72',
              style: styles.composerInput,
            }}
            renderInputToolbar={(props) => (
              <View>
                {emojiOpen ? (
                  <View style={styles.emojiBar}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>
                      {emojiRow.map((em) => (
                        <Pressable
                          key={em}
                          onPress={() => {
                            const text = (props.text || '') + em;
                            props.onTextChanged(text);
                          }}
                          style={({ pressed }) => [styles.emojiBtn, pressed && styles.pillPressed]}
                        >
                          <Text style={styles.emoji}>{em}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}
                <InputToolbar
                  {...props}
                  containerStyle={styles.inputToolbar}
                  primaryStyle={{ alignItems: 'center' }}
                />
              </View>
            )}
            renderActions={() => (
              <View style={styles.actions}>
                <Pressable
                  onPress={() => setEmojiOpen((v) => !v)}
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.pillPressed]}
                >
                  <Feather name="smile" size={18} color="#0F4C5C" />
                </Pressable>
                <Pressable
                  onPress={() =>
                    pickPhoto((dataUrl) => {
                      onSend([
                        {
                          _id: `${Date.now()}`,
                          createdAt: new Date(),
                          user: { _id: String(userId), name: userName },
                          text: '',
                          image: dataUrl,
                        },
                      ]);
                    })
                  }
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.pillPressed]}
                >
                  <Feather name="image" size={18} color="#0F4C5C" />
                </Pressable>
              </View>
            )}
            renderTicks={(msg) => {
              const readBy = Array.isArray(msg?.currentMessage?.readBy) ? msg.currentMessage.readBy : [];
              const unique = new Set(readBy.map(String));
              const isRead = unique.size >= 2;
              const text = isRead ? '✓✓' : '✓';
              return <Text style={styles.tick}>{text}</Text>;
            }}
          />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '92%',
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roomPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(15,76,92,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(15,76,92,0.12)',
  },
  roomText: { color: '#0F4C5C', fontFamily: 'SpaceGrotesk_700Bold' },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,212,170,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
  },
  dot: { width: 8, height: 8, borderRadius: 8, backgroundColor: '#00D4AA' },
  onlineText: { color: '#0F4C5C', fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45,52,54,0.06)',
  },
  pillPressed: { opacity: 0.85 },
  menu: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(15,76,92,0.10)',
    overflow: 'hidden',
  },
  menuItem: { paddingHorizontal: 14, paddingVertical: 12 },
  menuPressed: { backgroundColor: 'rgba(15,76,92,0.06)' },
  menuItemText: { color: '#2D3436', fontFamily: 'SpaceGrotesk_700Bold' },
  chatWrap: { flex: 1 },
  errorWrap: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,107,107,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.28)',
  },
  errorTitle: { color: '#2D3436', fontFamily: 'SpaceGrotesk_700Bold', marginBottom: 6 },
  errorText: { color: '#636E72', fontFamily: 'SpaceGrotesk_600SemiBold' },
  inputToolbar: {
    borderTopWidth: 0,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  composerInput: {
    color: '#2D3436',
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 6, paddingBottom: 4 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,76,92,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(15,76,92,0.12)',
  },
  emojiBar: { paddingHorizontal: 10, paddingBottom: 6 },
  emojiRow: { gap: 6 },
  emojiBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,212,170,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.18)',
  },
  emoji: { fontSize: 18 },
  tick: { color: '#636E72', fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, marginRight: 6 },
});
