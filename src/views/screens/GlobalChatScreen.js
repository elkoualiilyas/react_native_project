import GlobalChatModal from '../components/GlobalChatModal';

export default function GlobalChatScreen({ navigation, route, userId }) {
  const eventId = route?.params?.eventId;
  return (
    <GlobalChatModal
      visible
      onClose={() => navigation.goBack()}
      userId={userId}
      initialEventId={eventId}
    />
  );
}

