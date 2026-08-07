import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { scanFromURLAsync } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { api, Incident } from "@/lib/api";
import { colors } from "@/constants/colors";
import { radius } from "@/constants/ui-theme";
import { PressableScale } from "@/components/pressable-scale";

const statusLabel: Record<Incident["status"], string> = {
  PENDING: "Chờ xử lý",
  ACCEPTED: "Đang xử lý",
  DONE: "Đã hoàn thành",
};

const statusBadgeStyle: Record<Incident["status"], { bg: string; color: string }> = {
  PENDING: { bg: colors.statusPendingBg, color: colors.statusPendingText },
  ACCEPTED: { bg: colors.statusAcceptedBg, color: colors.statusAcceptedText },
  DONE: { bg: colors.statusDoneBg, color: colors.statusDoneText },
};

function initials(name?: string) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

export default function HomeScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [showScanOptions, setShowScanOptions] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    const data = await api.listIncidents(token);
    setIncidents(data);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function goToMachine(rawCode: string) {
    let code = rawCode;
    try {
      const parsed = JSON.parse(rawCode);
      if (parsed?.code) code = parsed.code;
    } catch {
      // payload không phải JSON, dùng nguyên văn làm mã máy
    }
    router.push(`/machine/${encodeURIComponent(code)}`);
  }

  async function handleUploadImage() {
    setShowScanOptions(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setDecoding(true);
    try {
      const scanned = await scanFromURLAsync(result.assets[0].uri, ["qr"]);
      if (!scanned || scanned.length === 0) {
        Alert.alert("Không tìm thấy mã QR", "Ảnh này không chứa mã QR hợp lệ.");
        return;
      }
      goToMachine(scanned[0].data);
    } catch {
      Alert.alert("Lỗi", "Không thể đọc mã QR từ ảnh này.");
    } finally {
      setDecoding(false);
    }
  }

  function handleScanWithCamera() {
    setShowScanOptions(false);
    router.push("/scan");
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trang chủ</Text>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>{initials(user?.name)}</Text>
        </View>
      </View>

      <FlatList
        data={incidents}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 28, gap: 10 }}
        ListHeaderComponent={
          <>
            <PressableScale
              style={styles.qrCard}
              onPress={() => setShowScanOptions(true)}
              disabled={decoding}
            >
              {decoding ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.qrCardIcon}>📷</Text>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.qrCardTitle}>Quét mã QR</Text>
                <Text style={styles.qrCardSubtitle}>Quét mã trên máy để xem thông tin / báo lỗi</Text>
              </View>
              <Text style={styles.qrCardChevron}>›</Text>
            </PressableScale>
            <Text style={styles.feedTitle}>Hoạt động sự cố gần đây</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🗂️</Text>
            <Text style={styles.empty}>Chưa có sự cố nào được ghi nhận</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const isMine = item.reporter.id === user?.id;
          const badge = statusBadgeStyle[item.status];
          return (
            <Animated.View
              entering={FadeInDown.delay(Math.min(index, 8) * 45).duration(320)}
              style={styles.card}
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.cardMachine}>
                  {item.machine?.name} ({item.machine?.code})
                </Text>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.color }]}>
                    {statusLabel[item.status]}
                  </Text>
                </View>
              </View>
              {isMine && (
                <View style={styles.myReportBadge}>
                  <Text style={styles.myReportBadgeText}>📋 Sự cố bạn đã báo</Text>
                </View>
              )}
              <Text style={styles.cardDesc}>{item.description}</Text>
              {isMine ? (
                <Text style={styles.cardAssignee}>
                  {item.assignedTo
                    ? `🔧 Đang xử lý: ${item.assignedTo.name}${
                        item.acceptedAt
                          ? ` · nhận lúc ${new Date(item.acceptedAt).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : ""
                      }`
                    : "⏳ Chưa có ai nhận việc"}
                </Text>
              ) : (
                <Text style={styles.cardMeta}>
                  Báo bởi {item.reporter.name}
                  {item.assignedTo ? ` · Nhận việc: ${item.assignedTo.name}` : ""}
                </Text>
              )}
            </Animated.View>
          );
        }}
      />

      <Modal visible={showScanOptions} transparent animationType="fade">
        <View style={styles.sheetOverlay}>
          <Animated.View entering={FadeInDown.duration(220)} style={styles.sheetCard}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Quét mã QR máy</Text>
            <PressableScale style={styles.sheetOption} onPress={handleScanWithCamera}>
              <Text style={styles.sheetOptionIcon}>📷</Text>
              <Text style={styles.sheetOptionText}>Quét bằng camera</Text>
            </PressableScale>
            <PressableScale style={styles.sheetOption} onPress={handleUploadImage}>
              <Text style={styles.sheetOptionIcon}>🖼️</Text>
              <Text style={styles.sheetOptionText}>Tải ảnh lên</Text>
            </PressableScale>
            <TouchableOpacity
              style={styles.sheetCancel}
              onPress={() => setShowScanOptions(false)}
            >
              <Text style={styles.sheetCancelText}>Huỷ</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 19, fontWeight: "600", color: colors.text },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: { color: colors.primaryDark, fontWeight: "700", fontSize: 13 },
  qrCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 4,
  },
  qrCardIcon: { fontSize: 22, color: colors.white },
  qrCardTitle: { color: colors.white, fontSize: 15, fontWeight: "700" },
  qrCardSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 },
  qrCardChevron: { color: colors.white, fontSize: 20 },
  sheetOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheetCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 20,
    paddingBottom: 32,
    gap: 4,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  sheetTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  sheetOptionIcon: { fontSize: 22 },
  sheetOptionText: { fontSize: 15, color: colors.text, fontWeight: "600" },
  sheetCancel: { marginTop: 8, paddingVertical: 12, alignItems: "center" },
  sheetCancelText: { color: colors.textMuted, fontWeight: "600" },
  feedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginTop: 6,
    marginBottom: 2,
  },
  emptyWrap: { alignItems: "center", marginTop: 40, gap: 8 },
  emptyIcon: { fontSize: 32 },
  empty: { textAlign: "center", color: colors.textMuted },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 6,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  cardMachine: { fontWeight: "600", color: colors.text, flexShrink: 1, fontSize: 14.5 },
  cardDesc: { color: colors.text },
  cardMeta: { color: colors.textMuted, fontSize: 12 },
  badge: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  myReportBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentSoft,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  myReportBadgeText: { color: colors.primaryDark, fontSize: 11, fontWeight: "700" },
  cardAssignee: { color: colors.primary, fontSize: 13, fontWeight: "700" },
});
