import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';

export default function Funny() {
  const [location, setLocation] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // Xin quyền vị trí
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Không có quyền truy cập vị trí');
        return;
      }

      // Lấy vị trí hiện tại
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setSelectedLocation(loc.coords); // marker ban đầu
    })();
  }, []);

  // 👉 Bấm map để chọn vị trí
  const onMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  if (error) return <Text>{error}</Text>;
  if (!location) return <Text>Đang tải bản đồ...</Text>;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={onMapPress}
      >
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title="Vị trí đã chọn"
            image={require('../../assets/images/policeman.png')}
            draggable
            onDragEnd={(e) =>
              setSelectedLocation(e.nativeEvent.coordinate)
            }
          />
        )}
      </MapView>

      {/* Hiển thị toạ độ */}
      {selectedLocation && (
        <View style={styles.info}>
          <Text>Lat: {selectedLocation.latitude}</Text>
          <Text>Lng: {selectedLocation.longitude}</Text>
          <Button
            title="Báo Chốt"
            onPress={() => console.log('Vị trí đã lưu:', selectedLocation)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  info: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    elevation: 5,
  },
});
