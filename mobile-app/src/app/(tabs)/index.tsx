import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { api, QualityIssue, IssueStatus, ApiError, resolveImageUrl, FailureCategory } from "@/lib/api";
import { colors } from "@/constants/colors";
import { radius } from "@/constants/ui-theme";
import { PressableScale } from "@/components/pressable-scale";

const statusLabel: Record<IssueStatus, string> = {
  REPORTED: "Vừa báo cáo",
  INVESTIGATING: "Đang điều tra",
  ROOT_CAUSE_FOUND: "Đã có nguyên nhân",
  ASSIGNED: "Đã giao việc",
  IN_PROGRESS: "Đang xử lý",
  DONE: "Đã hoàn thành",
};

const statusBadgeStyle: Record<IssueStatus, { bg: string; color: string }> = {
  REPORTED: { bg: colors.statusPendingBg, color: colors.statusPendingText },
  INVESTIGATING: { bg: colors.statusAcceptedBg, color: colors.statusAcceptedText },
  ROOT_CAUSE_FOUND: { bg: colors.statusAcceptedBg, color: colors.statusAcceptedText },
  ASSIGNED: { bg: colors.statusAcceptedBg, color: colors.statusAcceptedText },
  IN_PROGRESS: { bg: colors.statusPendingBg, color: colors.statusPendingText },
  DONE: { bg: colors.statusDoneBg, color: colors.statusDoneText },
};

function initials(name?: string) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

type Option = { id: string; name: string };

export default function HomeScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [teams, setTeams] = useState<Option[]>([]);
  const [lines, setLines] = useState<Option[]>([]);
  const [failureCategories, setFailureCategories] = useState<FailureCategory[]>([]);
  const [teamId, setTeamId] = useState("");
  const [productionLineId, setProductionLineId] = useState("");
  const [failureCategoryId, setFailureCategoryId] = useState("");
  const [poCode, setPoCode] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    const data = await api.listMyIssues(token);
    setIssues(data);
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

  async function openReportForm() {
    setError(null);
    setShowReportForm(true);
    if (token) {
      const [teamOpts, lineOpts, failureOpts] = await Promise.all([
        api.listTeams(token),
        api.listProductionLines(token),
        api.listFailureCategories(token),
      ]);
      setTeams(teamOpts);
      setLines(lineOpts);
      setFailureCategories(failureOpts);
    }
  }

  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]?.base64 || !token) return;
    setUploadingImage(true);
    try {
      const asset = result.assets[0];
      const uploaded = await api.uploadImage(token, asset.base64!, asset.mimeType || "image/jpeg");
      setImages((prev) => [...prev, uploaded.url]);
    } catch {
      setError("Không thể tải ảnh lên");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmitReport() {
    if (!token) return;
    if (!poCode.trim() || !description.trim()) {
      setError("Vui lòng nhập mã PO và mô tả");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.reportIssue(token, {
        teamId: teamId || undefined,
        productionLineId: productionLineId || undefined,
        failureCategoryId: failureCategoryId || undefined,
        poCode: poCode.trim(),
        description: description.trim(),
        images,
      });
      setShowReportForm(false);
      setTeamId("");
      setProductionLineId("");
      setFailureCategoryId("");
      setPoCode("");
      setDescription("");
      setImages([]);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không thể gửi báo cáo");
    } finally {
      setSubmitting(false);
    }
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
        data={issues}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 28, gap: 10 }}
        ListHeaderComponent={
          <>
            <PressableScale style={styles.reportCard} onPress={openReportForm}>
              <Text style={styles.reportCardIcon}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.reportCardTitle}>Báo cáo vấn đề</Text>
                <Text style={styles.reportCardSubtitle}>Báo cáo sự cố chất lượng đang gặp phải</Text>
              </View>
              <Text style={styles.reportCardChevron}>›</Text>
            </PressableScale>
            <Text style={styles.feedTitle}>Hoạt động sự cố gần đây</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🗂️</Text>
            <Text style={styles.empty}>Bạn chưa báo cáo sự cố nào</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const badge = statusBadgeStyle[item.status];
          return (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 45).duration(320)}>
              <PressableScale style={styles.card} onPress={() => router.push(`/issue/${item.id}`)}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardPo}>PO {item.poCode}</Text>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.color }]}>
                      {statusLabel[item.status]}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.description}
                </Text>
                <Text style={styles.cardMeta}>
                  {item.team?.name || "-"} / {item.productionLine?.name || "-"}
                  {item.task?.assignee ? ` · Bảo trì: ${item.task.assignee.name}` : ""}
                </Text>
              </PressableScale>
            </Animated.View>
          );
        }}
      />

      <Modal visible={showReportForm} transparent animationType="fade">
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetCard}>
            <View style={styles.sheetHandle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetTitle}>Báo cáo vấn đề</Text>

              <Text style={styles.formLabel}>Mã PO</Text>
              <TextInput
                value={poCode}
                onChangeText={setPoCode}
                placeholder="VD: PO-2026-001"
                style={styles.input}
              />

              <Text style={styles.formLabel}>Tổ</Text>
              <View style={styles.pillRow}>
                {teams.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setTeamId(t.id === teamId ? "" : t.id)}
                    style={[styles.pill, teamId === t.id && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, teamId === t.id && styles.pillTextActive]}>
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Chuyền</Text>
              <View style={styles.pillRow}>
                {lines.map((l) => (
                  <TouchableOpacity
                    key={l.id}
                    onPress={() => setProductionLineId(l.id === productionLineId ? "" : l.id)}
                    style={[styles.pill, productionLineId === l.id && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, productionLineId === l.id && styles.pillTextActive]}>
                      {l.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Danh mục lỗi</Text>
              <View style={styles.pillRow}>
                {failureCategories.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => setFailureCategoryId(f.id === failureCategoryId ? "" : f.id)}
                    style={[styles.pill, failureCategoryId === f.id && styles.pillActive]}
                  >
                    <Text
                      style={[styles.pillText, failureCategoryId === f.id && styles.pillTextActive]}
                    >
                      {f.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Mô tả</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả tình trạng gặp phải"
                multiline
                style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              />

              <Text style={styles.formLabel}>Hình ảnh</Text>
              <View style={styles.pillRow}>
                {images.map((img, i) => (
                  <Image key={i} source={{ uri: resolveImageUrl(img) }} style={styles.thumb} />
                ))}
                <TouchableOpacity style={styles.addImageBtn} onPress={handlePickImage} disabled={uploadingImage}>
                  {uploadingImage ? <ActivityIndicator /> : <Text style={{ fontSize: 22 }}>+</Text>}
                </TouchableOpacity>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.formActions}>
                <TouchableOpacity onPress={() => setShowReportForm(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Huỷ</Text>
                </TouchableOpacity>
                <PressableScale
                  style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                  onPress={handleSubmitReport}
                  disabled={submitting}
                >
                  <Text style={styles.submitBtnText}>{submitting ? "Đang gửi..." : "Gửi báo cáo"}</Text>
                </PressableScale>
              </View>
            </ScrollView>
          </View>
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
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 4,
  },
  reportCardIcon: { fontSize: 22 },
  reportCardTitle: { color: colors.white, fontSize: 15, fontWeight: "700" },
  reportCardSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 },
  reportCardChevron: { color: colors.white, fontSize: 20 },
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
  cardTopRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  cardPo: { fontWeight: "600", color: colors.text, flexShrink: 1, fontSize: 14.5 },
  cardDesc: { color: colors.text },
  cardMeta: { color: colors.textMuted, fontSize: 12 },
  badge: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  sheetOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  sheetCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 20,
    paddingBottom: 32,
    maxHeight: "85%",
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  sheetTitle: { fontWeight: "700", fontSize: 16, color: colors.text, marginBottom: 12 },
  formLabel: { fontSize: 13, fontWeight: "600", color: colors.text, marginTop: 10, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 13, color: colors.text },
  pillTextActive: { color: colors.white, fontWeight: "600" },
  thumb: { width: 56, height: 56, borderRadius: radius.sm },
  addImageBtn: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: { color: colors.danger, fontSize: 13, marginTop: 10 },
  formActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 18 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 16 },
  cancelBtnText: { color: colors.textMuted, fontWeight: "600" },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 12, paddingHorizontal: 20 },
  submitBtnText: { color: colors.white, fontWeight: "700" },
});
