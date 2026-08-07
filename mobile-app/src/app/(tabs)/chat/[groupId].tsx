import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useNavigation } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError, ChatGroup, ChatMessage, resolveImageUrl } from "@/lib/api";
import { openDirections } from "@/lib/directions";
import { colors } from "@/constants/colors";
import { radius, raisedShadow, softShadow } from "@/constants/ui-theme";
import { PressableScale } from "@/components/pressable-scale";

const incidentStatusBadge: Record<string, { bg: string; color: string; label: string }> = {
  PENDING: { bg: colors.statusPendingBg, color: colors.statusPendingText, label: "Chờ xử lý" },
  ACCEPTED: { bg: colors.statusAcceptedBg, color: colors.statusAcceptedText, label: "Đang xử lý" },
  DONE: { bg: colors.statusDoneBg, color: colors.statusDoneText, label: "Đã hoàn thành" },
};

const POLL_INTERVAL_MS = 3000;
const SCREEN_WIDTH = Dimensions.get("window").width;

function useElapsedLabel(startIso: string | null) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!startIso) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [startIso]);

  if (!startIso) return "";
  const seconds = Math.floor((Date.now() - new Date(startIso).getTime()) / 1000);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const date = d.toLocaleDateString("vi-VN");
  return `${time} · ${date}`;
}

function parseImages(images: string | null): string[] {
  if (!images) return [];
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getDurationMinutes(acceptedAt: string | null, createdAt: string, completedAt: string) {
  const start = new Date(acceptedAt ?? createdAt).getTime();
  const end = new Date(completedAt).getTime();
  return Math.max(1, Math.round((end - start) / 60000));
}

function IncidentAlertCard({
  message,
  currentUserId,
  onAccept,
  onOpenComplete,
}: {
  message: ChatMessage;
  currentUserId: string;
  onAccept: (incidentId: string) => void;
  onOpenComplete: (incidentId: string) => void;
}) {
  const incident = message.incident;
  const elapsed = useElapsedLabel(
    incident?.status === "ACCEPTED" ? incident.acceptedAt : null,
  );
  const [viewerOpen, setViewerOpen] = useState(false);

  if (!incident) return null;

  const images = parseImages(incident.images);

  const isMyJob = incident.status === "ACCEPTED" && incident.assignedTo?.id === currentUserId;

  const statusBadge = incidentStatusBadge[incident.status];

  return (
    <Animated.View entering={FadeInUp.duration(280)} style={styles.alertCard}>
      <View style={styles.alertTitleRow}>
        <Text style={styles.alertTitle}>⚠️ Cảnh báo sự cố máy</Text>
        <View style={styles.alertBadgeGroup}>
          {isMyJob && (
            <View style={styles.myJobBadge}>
              <Text style={styles.myJobBadgeText}>📌 Việc của bạn</Text>
            </View>
          )}
          <View style={[styles.statusCornerBadge, { backgroundColor: statusBadge.bg }]}>
            <Text style={[styles.statusCornerBadgeText, { color: statusBadge.color }]}>
              {statusBadge.label}
            </Text>
          </View>
        </View>
      </View>

      {incident.resendCount > 0 && (
        <View style={styles.resendBadge}>
          <Text style={styles.resendBadgeText}>🔁 Đã gửi lại {incident.resendCount} lần</Text>
        </View>
      )}

      <View style={styles.alertRow}>
        <Text style={styles.alertLabel}>Người báo</Text>
        <Text style={styles.alertValue}>
          {incident.reporter?.name}
          {incident.reporter?.employeeCode ? ` (${incident.reporter.employeeCode})` : ""}
        </Text>
      </View>

      <View style={styles.alertRow}>
        <Text style={styles.alertLabel}>Máy</Text>
        <Text style={styles.alertValue}>
          {incident.machine?.name} ({incident.machine?.code})
        </Text>
      </View>

      {incident.machine?.productionLine && (
        <View style={styles.alertRow}>
          <Text style={styles.alertLabel}>Chuyền</Text>
          <Text style={styles.alertValue}>{incident.machine.productionLine}</Text>
        </View>
      )}

      {incident.machine?.team && (
        <View style={styles.alertRow}>
          <Text style={styles.alertLabel}>Tổ</Text>
          <Text style={styles.alertValue}>{incident.machine.team}</Text>
        </View>
      )}

      <View style={styles.alertRow}>
        <Text style={styles.alertLabel}>Vị trí</Text>
        <Text style={styles.alertValue}>{incident.machine?.location}</Text>
      </View>

      <View style={styles.alertRow}>
        <Text style={styles.alertLabel}>Mô tả</Text>
        <Text style={styles.alertValue}>{incident.description}</Text>
      </View>

      <View style={styles.alertRow}>
        <Text style={styles.alertLabel}>Hình ảnh</Text>
        {images.length > 0 ? (
          <TouchableOpacity onPress={() => setViewerOpen(true)}>
            <Text style={styles.alertLink}>Xem ảnh ({images.length})</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.alertValue}>Không có</Text>
        )}
      </View>

      <View style={styles.alertRow}>
        <Text style={styles.alertLabel}>Thời gian</Text>
        <Text style={styles.alertValue}>{formatDateTime(message.createdAt)}</Text>
      </View>

      {incident.acceptedAt && (
        <View style={styles.alertRow}>
          <Text style={styles.alertLabel}>Thời gian nhận việc</Text>
          <Text style={styles.alertValue}>{formatDateTime(incident.acceptedAt)}</Text>
        </View>
      )}

      <Modal visible={viewerOpen} transparent animationType="fade">
        <View style={styles.viewerOverlay}>
          <TouchableOpacity style={styles.viewerClose} onPress={() => setViewerOpen(false)}>
            <Text style={styles.viewerCloseText}>✕</Text>
          </TouchableOpacity>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1, width: "100%" }}
          >
            {images.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: resolveImageUrl(img) }}
                style={styles.viewerImage}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
        </View>
      </Modal>

      {incident.status === "ACCEPTED" && (
        <View style={styles.acceptedInfoRow}>
          <Text style={styles.acceptedName}>{incident.assignedTo?.name}</Text>
          <Text style={styles.acceptedMeta}> đã nhận việc · {elapsed}</Text>
        </View>
      )}

      {(incident.status === "PENDING" || incident.status === "ACCEPTED") && (
        <View style={styles.actionRow}>
          {incident.machine?.latitude != null && incident.machine?.longitude != null && (
            <PressableScale
              style={styles.directionsButtonHalf}
              onPress={() =>
                openDirections(
                  incident.machine!.latitude!,
                  incident.machine!.longitude!,
                  incident.machine!.name,
                )
              }
            >
              <Text style={styles.directionsButtonHalfText}>🧭 Đường đi</Text>
            </PressableScale>
          )}
          {incident.status === "PENDING" && (
            <PressableScale style={styles.acceptButtonHalf} onPress={() => onAccept(incident.id)}>
              <Text style={styles.acceptButtonText}>Nhận việc</Text>
            </PressableScale>
          )}
          {incident.status === "ACCEPTED" && incident.assignedTo?.id === currentUserId && (
            <PressableScale
              style={styles.completeButtonHalf}
              onPress={() => onOpenComplete(incident.id)}
            >
              <Text style={styles.completeButtonText}>Hoàn thành công việc</Text>
            </PressableScale>
          )}
        </View>
      )}

      {incident.status === "DONE" && (
        <View>
          <Text style={styles.doneText}>✅ {incident.assignedTo?.name} đã hoàn thành</Text>
          {incident.completedAt && (
            <>
              <Text style={styles.doneDurationText}>
                🕐{" "}
                {getDurationMinutes(incident.acceptedAt, incident.createdAt, incident.completedAt)}{" "}
                phút
              </Text>
              <Text style={styles.doneDurationText}>
                🕐 Hoàn thành lúc {formatDateTime(incident.completedAt)}
              </Text>
            </>
          )}
        </View>
      )}
    </Animated.View>
  );
}

export default function ChatGroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const navigation = useNavigation();
  const { token, user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [completingIncidentId, setCompletingIncidentId] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberCode, setMemberCode] = useState("");
  const [memberError, setMemberError] = useState<string | null>(null);

  const [repairDetail, setRepairDetail] = useState("");
  const [partsReplaced, setPartsReplaced] = useState("");
  const [proofImages, setProofImages] = useState<{ uri: string; base64: string; mimeType: string }[]>(
    [],
  );
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [submittingComplete, setSubmittingComplete] = useState(false);
  const [groupInfo, setGroupInfo] = useState<ChatGroup | null>(null);
  const [changingAvatar, setChangingAvatar] = useState(false);

  const lastLoadRef = useRef<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!token || !groupId) return;
    const data = await api.listMessages(token, groupId);
    setMessages(data);
    if (data.length > 0) lastLoadRef.current = data[data.length - 1].createdAt;
  }, [token, groupId]);

  const loadGroupInfo = useCallback(async () => {
    if (!token || !groupId) return;
    const groups = await api.listChatGroups(token);
    setGroupInfo(groups.find((g) => g.id === groupId) || null);
  }, [token, groupId]);

  useEffect(() => {
    loadAll();
    const id = setInterval(loadAll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loadAll]);

  useEffect(() => {
    loadGroupInfo();
  }, [loadGroupInfo]);

  async function handleChangeGroupImage() {
    if (!token || !groupId) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;

    setChangingAvatar(true);
    try {
      const asset = result.assets[0];
      const uploaded = await api.uploadImage(token, asset.base64!, asset.mimeType || "image/jpeg");
      await api.updateChatGroup(token, groupId, { image: uploaded.url });
      await loadGroupInfo();
    } catch {
      Alert.alert("Lỗi", "Không thể đổi ảnh nhóm");
    } finally {
      setChangingAvatar(false);
    }
  }

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity style={styles.headerTitleWrap} onPress={handleChangeGroupImage}>
          <View style={styles.headerAvatar}>
            {groupInfo?.image ? (
              <Image
                source={{ uri: resolveImageUrl(groupInfo.image) }}
                style={styles.headerAvatarImage}
              />
            ) : (
              <Text style={styles.headerAvatarText}>{(groupInfo?.name || "?").charAt(0)}</Text>
            )}
          </View>
          <Text style={styles.headerTitleText} numberOfLines={1}>
            {changingAvatar ? "Đang cập nhật..." : groupInfo?.name || "Nhóm chat"}
          </Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={() => setShowAddMember(true)} style={{ paddingHorizontal: 8 }}>
          <Text style={{ color: colors.white, fontWeight: "700" }}>+ Thêm</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, groupInfo, changingAvatar]);

  async function handleSend() {
    if (!token || !groupId || !text.trim()) return;
    const content = text.trim();
    setText("");
    await api.sendMessage(token, groupId, content);
    await loadAll();
  }

  async function handleAccept(incidentId: string) {
    if (!token) return;
    await api.acceptIncident(token, incidentId);
    await loadAll();
  }

  async function handleAddMember() {
    if (!token || !groupId || !memberCode.trim()) return;
    setMemberError(null);
    try {
      await api.addChatGroupMember(token, groupId, memberCode.trim());
      setMemberCode("");
      setShowAddMember(false);
      Alert.alert("Đã gửi lời mời", "Nhân viên sẽ nhận được lời mời trong mục Thông báo.");
    } catch (e) {
      setMemberError(e instanceof ApiError ? e.message : "Không thể gửi lời mời");
    }
  }

  async function handlePickProofImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
      base64: true,
      allowsMultipleSelection: true,
    });
    if (result.canceled || !result.assets?.length) return;
    const picked = result.assets
      .filter((a) => a.base64)
      .map((a) => ({ uri: a.uri, base64: a.base64!, mimeType: a.mimeType || "image/jpeg" }));
    setProofImages((prev) => [...prev, ...picked]);
  }

  function removeProofImage(idx: number) {
    setProofImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmitComplete() {
    if (!token || !completingIncidentId) return;
    if (!repairDetail.trim()) {
      setCompleteError("Vui lòng mô tả đã sửa những gì");
      return;
    }
    if (proofImages.length === 0) {
      setCompleteError("Vui lòng chụp/tải ít nhất 1 ảnh minh chứng");
      return;
    }
    setCompleteError(null);
    setSubmittingComplete(true);
    try {
      const uploadedUrls: string[] = [];
      for (const img of proofImages) {
        const uploaded = await api.uploadImage(token, img.base64, img.mimeType);
        uploadedUrls.push(uploaded.url);
      }

      await api.completeIncident(token, completingIncidentId, {
        repairDetail: repairDetail.trim(),
        partsReplaced: partsReplaced.trim() || undefined,
        proofImages: uploadedUrls,
      });
      setCompletingIncidentId(null);
      setRepairDetail("");
      setPartsReplaced("");
      setProofImages([]);
      await loadAll();
    } catch (e) {
      setCompleteError(e instanceof ApiError ? e.message : "Không thể hoàn thành công việc");
    } finally {
      setSubmittingComplete(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        renderItem={({ item }) => {
          if (item.type === "INCIDENT_ALERT") {
            return (
              <IncidentAlertCard
                message={item}
                currentUserId={user?.id || ""}
                onAccept={handleAccept}
                onOpenComplete={setCompletingIncidentId}
              />
            );
          }
          if (item.type === "SYSTEM") {
            return <Text style={styles.systemMessage}>{item.content}</Text>;
          }
          const isMine = item.senderId === user?.id;
          return (
            <Animated.View
              entering={FadeInDown.duration(220)}
              style={[styles.bubbleWrap, isMine ? styles.bubbleWrapMine : styles.bubbleWrapOther]}
            >
              {!isMine && <Text style={styles.senderName}>{item.sender?.name}</Text>}
              <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
                <Text style={styles.bubbleText}>{item.content}</Text>
              </View>
            </Animated.View>
          );
        }}
      />

      <View style={styles.inputBar}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Tin nhắn"
          placeholderTextColor={colors.textMuted}
          style={styles.textInput}
          multiline
        />
        <PressableScale style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Gửi</Text>
        </PressableScale>
      </View>

      <Modal visible={showAddMember} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.duration(220)} style={styles.modalCard}>
            <Text style={styles.modalTitle}>Thêm thành viên vào nhóm</Text>
            <TextInput
              value={memberCode}
              onChangeText={setMemberCode}
              placeholder="Nhập mã nhân viên"
              autoCapitalize="characters"
              style={styles.input}
            />
            {memberError && <Text style={styles.error}>{memberError}</Text>}
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowAddMember(false)}>
                <Text style={styles.cancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={handleAddMember}>
                <Text style={styles.createButtonText}>Gửi lời mời</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={!!completingIncidentId} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Hoàn thành công việc</Text>

            <Text style={styles.fieldLabel}>Đã sửa những gì?</Text>
            <TextInput
              value={repairDetail}
              onChangeText={setRepairDetail}
              placeholder="Mô tả công việc đã thực hiện"
              multiline
              style={[styles.input, { minHeight: 70, textAlignVertical: "top" }]}
            />

            <Text style={styles.fieldLabel}>Linh kiện / công cụ thay thế (nếu có)</Text>
            <TextInput
              value={partsReplaced}
              onChangeText={setPartsReplaced}
              placeholder="VD: Bulong M8, dây curoa..."
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Ảnh minh chứng (bắt buộc)</Text>
            <View style={styles.proofImageRow}>
              {proofImages.map((img, idx) => (
                <View key={idx} style={styles.proofImageWrap}>
                  <Image source={{ uri: img.uri }} style={styles.proofImage} />
                  <TouchableOpacity
                    style={styles.proofImageRemove}
                    onPress={() => removeProofImage(idx)}
                  >
                    <Text style={styles.proofImageRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.proofImageAdd} onPress={handlePickProofImage}>
                <Text style={styles.proofImageAddText}>+</Text>
              </TouchableOpacity>
            </View>

            {completeError && <Text style={styles.error}>{completeError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setCompletingIncidentId(null)}>
                <Text style={styles.cancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createButton, submittingComplete && { opacity: 0.6 }]}
                onPress={handleSubmitComplete}
                disabled={submittingComplete}
              >
                <Text style={styles.createButtonText}>
                  {submittingComplete ? "Đang gửi..." : "Xác nhận hoàn thành"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerTitleWrap: { flexDirection: "row", alignItems: "center", gap: 8, maxWidth: 220 },
  headerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  headerAvatarImage: { width: 30, height: 30 },
  headerAvatarText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  headerTitleText: { color: colors.white, fontWeight: "700", fontSize: 15, flexShrink: 1 },
  bubbleWrap: { maxWidth: "78%" },
  bubbleWrapMine: { alignSelf: "flex-end" },
  bubbleWrapOther: { alignSelf: "flex-start" },
  senderName: { fontSize: 11, color: colors.textMuted, marginBottom: 2, marginLeft: 4 },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  bubbleMine: { backgroundColor: colors.bubbleMine, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: colors.bubbleOther, borderBottomLeftRadius: 4 },
  bubbleText: { color: colors.text },
  systemMessage: {
    alignSelf: "center",
    color: colors.textMuted,
    fontSize: 12,
    backgroundColor: "#E9EDF2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  alertCard: {
    alignSelf: "stretch",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  alertTitle: { fontWeight: "700", color: colors.text, fontSize: 15, marginBottom: 2 },
  alertTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
  },
  alertBadgeGroup: { flexDirection: "row", alignItems: "center", gap: 6 },
  myJobBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  myJobBadgeText: { color: colors.white, fontSize: 11, fontWeight: "700" },
  statusCornerBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusCornerBadgeText: { fontSize: 11, fontWeight: "700" },
  resendBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FEE2E2",
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  resendBadgeText: { color: colors.danger, fontSize: 11, fontWeight: "700" },
  alertRow: { flexDirection: "row", alignItems: "flex-start" },
  alertLabel: {
    width: 78,
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },
  alertValue: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 19 },
  alertLink: { fontSize: 14, color: colors.primary, fontWeight: "700" },
  viewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  viewerImage: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
  viewerClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  viewerCloseText: { color: colors.white, fontSize: 18 },
  acceptedInfoRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline" },
  acceptedName: { color: colors.text, fontWeight: "700", fontSize: 16 },
  acceptedMeta: { color: colors.textMuted, fontStyle: "italic", fontSize: 13 },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  directionsButtonHalf: {
    flex: 1,
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: 11,
    alignItems: "center",
  },
  directionsButtonHalfText: { color: colors.white, fontWeight: "700" },
  acceptButtonHalf: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 11,
    alignItems: "center",
  },
  acceptButtonText: { color: colors.white, fontWeight: "700" },
  completeButtonHalf: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: radius.md,
    paddingVertical: 11,
    alignItems: "center",
  },
  completeButtonText: { color: colors.white, fontWeight: "700" },
  doneText: { color: colors.success, fontWeight: "700" },
  doneDurationText: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 10,
    ...softShadow,
  },
  sendButtonText: { color: colors.white, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 20,
    width: "100%",
    gap: 4,
    ...raisedShadow,
  },
  modalTitle: { fontWeight: "700", fontSize: 16, marginBottom: 8, color: colors.text },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: colors.text, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
  },
  proofImageRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  proofImageWrap: { position: "relative" },
  proofImage: { width: 70, height: 70, borderRadius: 10, backgroundColor: colors.border },
  proofImageRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  proofImageRemoveText: { color: colors.white, fontSize: 11, fontWeight: "700" },
  proofImageAdd: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  proofImageAddText: { fontSize: 26, color: colors.textMuted },
  error: { color: colors.danger, marginTop: 8 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 16, marginTop: 16 },
  cancelText: { color: colors.textMuted, paddingVertical: 10 },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  createButtonText: { color: colors.white, fontWeight: "700" },
});
