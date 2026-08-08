import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/constants/colors";
import { radius } from "@/constants/ui-theme";
import { PressableScale } from "@/components/pressable-scale";

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionText}>
          Ứng dụng cần quyền truy cập camera để quét mã QR trên máy móc.
        </Text>
        <PressableScale style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Cấp quyền camera</Text>
        </PressableScale>
        <PressableScale style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Huỷ</Text>
        </PressableScale>
      </View>
    );
  }

  function handleScanned(payload: string) {
    if (scanned) return;
    setScanned(true);

    let code = payload;
    try {
      const parsed = JSON.parse(payload);
      if (parsed?.code) code = parsed.code;
    } catch {
      // payload không phải JSON, dùng nguyên văn làm mã máy
    }

    router.replace(`/machine/${encodeURIComponent(code)}`);
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={(result) => handleScanned(result.data)}
      />
      <Animated.View entering={FadeIn.duration(250)} style={styles.overlay}>
        <View style={styles.frame}>
          <ScanLine />
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
        <View style={styles.hintPill}>
          <Text style={styles.hint}>Đưa mã QR trên máy vào khung hình</Text>
        </View>
      </Animated.View>
      <PressableScale style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeButtonText}>✕</Text>
      </PressableScale>
    </View>
  );
}

function ScanLine() {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [progress]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * 220 }],
    opacity: 0.9,
  }));
  return <Animated.View style={[styles.scanLine, style]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  frame: {
    width: 250,
    height: 250,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  scanLine: {
    position: "absolute",
    left: 6,
    right: 6,
    top: 8,
    height: 2,
    backgroundColor: colors.primaryLight,
    shadowColor: colors.primaryLight,
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: colors.primaryLight,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderTopLeftRadius: radius.md,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderTopRightRadius: radius.md,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderBottomLeftRadius: radius.md,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderBottomRightRadius: radius.md,
  },
  hintPill: {
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  hint: { color: colors.white, fontSize: 14, fontWeight: "600" },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: { color: colors.white, fontSize: 18 },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
    backgroundColor: colors.background,
  },
  permissionIcon: { fontSize: 40 },
  permissionText: { textAlign: "center", color: colors.text },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  buttonText: { color: colors.white, fontWeight: "700" },
  cancelButton: { paddingVertical: 8 },
  cancelButtonText: { color: colors.textMuted },
});
