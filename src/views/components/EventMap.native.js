import MapView, { Marker } from 'react-native-maps';

export default function EventMap({ title, address, lat, lng, style }) {
  const region = {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <MapView style={style} initialRegion={region}>
      <Marker coordinate={{ latitude: lat, longitude: lng }} title={title} description={address} />
    </MapView>
  );
}

