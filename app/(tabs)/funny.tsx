import { RootState } from "@/store";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  Animated,
  Button,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { MapPressEvent, Marker, UrlTile } from "react-native-maps";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function Funny() {
  const [location, setLocation] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { checkStatus } = useSelector((state: RootState) => state.mqtt);

  const insets = useSafeAreaInsets();

  // animation panel
  const panY = useState(new Animated.Value(0))[0];

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      if (gesture.dy > 0) {
        panY.setValue(gesture.dy);
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > 100) {
        // kéo xuống -> ẩn
        Animated.timing(panY, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        // bật lại
        Animated.timing(panY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    },
  });

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

  const reportCheckpoint = () => {
    console.log("🚨 Báo chốt:", selectedLocation);
  };

  if (error) return <Text>{error}</Text>;
  if (!location) return <Text>Đang tải bản đồ...</Text>;

  return (
    <SafeAreaView style={styles.container}>
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
        <UrlTile
          urlTemplate="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
          maximumZ={19}
        />

        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            draggable
            image={require("@/assets/images/policeman.png")}
            onDragEnd={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
          />
        )}
      </MapView>

      {/* 🔥 PANEL KIỂU GRAB */}
      {selectedLocation && (
        <Animated.View
          style={[
            styles.panel,
            {
              paddingBottom: insets.bottom + 10,
              transform: [{ translateY: panY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* thanh kéo */}
          <View style={styles.dragBar} />

          <Text style={styles.title}>📍 Vị trí đã chọn</Text>
          <Text>Lat: {selectedLocation.latitude}</Text>
          <Text>Lng: {selectedLocation.longitude}</Text>
          <Text>Status: {checkStatus}</Text>

          <View style={{ marginTop: 10 }}>
            <Button title="🚨 Báo Chốt" onPress={reportCheckpoint} />
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  map: {
    flex: 1,
  },

  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    padding: 16,

    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  dragBar: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});
