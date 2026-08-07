import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError, Machine } from "@/lib/api";
import { openDirections } from "@/lib/directions";
import { colors } from "@/constants/colors";
import { radius } from "@/constants/ui-theme";
import { PressableScale } from "@/components/pressable-scale";

export default function MachineDetailScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !code) return;
    api
      .getMachineByCode(token, code)
      .then(setMachine)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Không thể tải thông tin máy"))
      .finally(() => setLoading(false));
  }, [token, code]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !machine) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || "Không tìm thấy máy"}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Animated.View entering={FadeInDown.duration(320)} style={styles.card}>
        <View style={styles.machineHero}>
          <Text style={styles.machineName}>{machine.name}</Text>
          <View style={styles.machineCodePill}>
            <Text style={styles.machineCode}>{machine.code}</Text>
          </View>
        </View>

        <View style={styles.rowsWrap}>
        {machine.serialNumber && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Số seri</Text>
            <Text style={styles.rowValue}>{machine.serialNumber}</Text>
          </View>
        )}
        {machine.area && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Khu vực / Xưởng</Text>
            <Text style={styles.rowValue}>{machine.area}</Text>
          </View>
        )}
        {machine.team && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Tổ</Text>
            <Text style={styles.rowValue}>{machine.team}</Text>
          </View>
        )}
        {machine.productionLine && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Chuyền</Text>
            <Text style={styles.rowValue}>{machine.productionLine}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Vị trí chi tiết</Text>
          <Text style={styles.rowValue}>{machine.location}</Text>
        </View>
        {machine.model && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Model</Text>
            <Text style={styles.rowValue}>{machine.model}</Text>
          </View>
        )}
        {machine.manufacturer && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Hãng sản xuất</Text>
            <Text style={styles.rowValue}>{machine.manufacturer}</Text>
          </View>
        )}
        {machine.origin && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Xuất xứ</Text>
            <Text style={styles.rowValue}>{machine.origin}</Text>
          </View>
        )}
        {machine.manufactureYear && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Năm sản xuất</Text>
            <Text style={styles.rowValue}>{machine.manufactureYear}</Text>
          </View>
        )}
        {machine.yearInUse && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Năm đưa vào sử dụng</Text>
            <Text style={styles.rowValue}>{machine.yearInUse}</Text>
          </View>
        )}
        {machine.specs && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Thông số</Text>
            <Text style={styles.rowValue}>{machine.specs}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Tình trạng</Text>
          <Text style={styles.rowValue}>{machine.status}</Text>
        </View>
        {machine.maintenancePeriod && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Bảo trì định kỳ</Text>
            <Text style={styles.rowValue}>{machine.maintenancePeriod}</Text>
          </View>
        )}
        </View>
      </Animated.View>

      {machine.latitude != null && machine.longitude != null && (
        <PressableScale
          style={styles.directionsButton}
          onPress={() => openDirections(machine.latitude!, machine.longitude!, machine.name)}
        >
          <Text style={styles.directionsButtonText}>🧭 Đường đi</Text>
        </PressableScale>
      )}

      <PressableScale
        style={styles.reportButton}
        onPress={() => router.push(`/report-incident/${machine.id}`)}
      >
        <Text style={styles.reportButtonText}>⚠️ Báo lỗi</Text>
      </PressableScale>

      {machine.incidents && machine.incidents.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Lịch sử sự cố gần đây</Text>
          {machine.incidents.map((incident, idx) => (
            <Animated.View
              key={incident.id}
              entering={FadeInUp.delay(Math.min(idx, 8) * 40).duration(280)}
              style={styles.historyItem}
            >
              <Text style={styles.historyDesc}>{incident.description}</Text>
              <Text style={styles.historyMeta}>
                {incident.reporter.name}
                {incident.category
                  ? ` · ${incident.category.isOther ? incident.customCategoryText : incident.category.name}`
                  : ""}{" "}
                · {incident.status}
              </Text>
            </Animated.View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: colors.background,
  },
  errorText: { color: colors.danger },
  backButton: { padding: 10 },
  backButtonText: { color: colors.primary, fontWeight: "700" },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  machineHero: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    gap: 8,
  },
  machineName: { fontSize: 21, fontWeight: "800", color: colors.white },
  machineCodePill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  machineCode: { fontSize: 13, color: colors.white, fontFamily: "monospace" },
  rowsWrap: { padding: 18, gap: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  rowLabel: { color: colors.textMuted, fontSize: 13 },
  rowValue: { color: colors.text, fontSize: 13, flexShrink: 1, textAlign: "right" },
  reportButton: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center",
  },
  reportButtonText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  directionsButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  directionsButtonText: { color: colors.white, fontWeight: "700", fontSize: 15 },
  historySection: { gap: 8 },
  historyTitle: { fontWeight: "600", color: colors.text },
  historyItem: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  historyDesc: { color: colors.text },
  historyMeta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
});
