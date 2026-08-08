import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/constants/colors";

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

// Công thức Haversine — khoảng cách đường chim bay giữa 2 toạ độ (km)
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function DirectionsScreen() {
  const params = useLocalSearchParams<{ lat: string; lng: string; name?: string }>();
  const router = useRouter();
  const destLat = Number(params.lat);
  const destLng = Number(params.lng);
  const machineName = params.name || "Máy";

  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Chưa cấp quyền truy cập vị trí — chỉ hiển thị vị trí máy.");
        setLoading(false);
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({});
        setCurrentLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch {
        setError("Không thể lấy vị trí hiện tại — chỉ hiển thị vị trí máy.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const distance = currentLocation
    ? distanceKm(currentLocation.latitude, currentLocation.longitude, destLat, destLng)
    : null;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: destLat,
          longitude: destLng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker
          coordinate={{ latitude: destLat, longitude: destLng }}
          title={machineName}
          description="Vị trí máy"
          pinColor={colors.danger}
        />
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Vị trí của bạn"
            pinColor={colors.primary}
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>✕</Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        {loading && <ActivityIndicator color={colors.primary} />}
        {!loading && (
          <>
            <Text style={styles.machineName}>{machineName}</Text>
            {distance != null && (
              <Text style={styles.distanceText}>Khoảng cách: ~{distance.toFixed(1)} km</Text>
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity
              style={styles.externalButton}
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`,
                )
              }
            >
              <Text style={styles.externalButtonText}>Mở bằng ứng dụng bản đồ khác</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  map: { flex: 1 },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButtonText: { fontSize: 18, color: colors.text },
  infoCard: {
    backgroundColor: colors.white,
    padding: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    gap: 8,
  },
  machineName: { fontSize: 17, fontWeight: "700", color: colors.text },
  distanceText: { fontSize: 14, color: colors.textMuted },
  errorText: { fontSize: 13, color: colors.warning },
  externalButton: {
    marginTop: 6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  externalButtonText: { color: colors.white, fontWeight: "700" },
});
