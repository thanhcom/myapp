import { RootState } from "@/store";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import MapView, { MapPressEvent, Marker, UrlTile } from "react-native-maps";
import { useSelector } from "react-redux";

export default function Funny() {
  const [location, setLocation] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { checkStatus } = useSelector((state: RootState) => state.mqtt);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Không có quyền truy cập vị trí");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setSelectedLocation(loc.coords);
    })();
  }, []);

  const onMapPress = (event: MapPressEvent) => {
    setSelectedLocation(event.nativeEvent.coordinate);
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
        {/* 🌍 OpenStreetMap */}
        <UrlTile
          urlTemplate="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
          maximumZ={19}
        />

        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            draggable
            onDragEnd={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
          >
            {/* Marker custom SAFE cho Android build */}
            <View style={styles.marker} />
          </Marker>
        )}
      </MapView>

      {selectedLocation && (
        <View style={styles.info}>
          <Text>Lat: {selectedLocation.latitude}</Text>
          <Text>Lng: {selectedLocation.longitude}</Text>
          <Text>Status: {checkStatus}</Text>
          <Button
            title="Báo Chốt"
            onPress={() => console.log("Vị trí đã lưu:", selectedLocation)}
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
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    elevation: 5,
  },
  marker: {
    width: 16,
    height: 16,
    backgroundColor: "red",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "white",
  },
});
