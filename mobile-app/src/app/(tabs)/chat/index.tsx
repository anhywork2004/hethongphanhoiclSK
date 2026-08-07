import { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError, ChatGroup, resolveImageUrl } from "@/lib/api";
import { colors } from "@/constants/colors";
import { radius, raisedShadow } from "@/constants/ui-theme";
import { PressableScale } from "@/components/pressable-scale";

function formatGroupTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("vi-VN");
}

export default function ChatGroupsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const data = await api.listChatGroups(token);
    setGroups(data);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleCreate() {
    if (!token || !groupName.trim()) return;
    setError(null);
    try {
      await api.createChatGroup(token, groupName.trim());
      setGroupName("");
      setShowCreate(false);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không thể tạo nhóm");
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat nhóm</Text>
        <Text style={styles.headerSubtitle}>
          {groups.length > 0 ? `${groups.length} nhóm đang hoạt động` : "Trao đổi công việc theo nhóm"}
        </Text>
      </View>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 28, gap: 10 }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.empty}>Chưa có nhóm chat nào</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 45).duration(320)}>
            <Pressable
              onPress={() => router.push(`/(tabs)/chat/${item.id}`)}
              style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                styles.groupCard,
                hovered && styles.groupCardHovered,
                pressed && styles.groupCardPressed,
              ]}
            >
              <View style={styles.avatar}>
                {item.image ? (
                  <Image source={{ uri: resolveImageUrl(item.image) }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.groupName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.messages[0]?.content || "Chưa có tin nhắn"}
                </Text>
              </View>
              <Text style={styles.groupTime}>{formatGroupTime(item.messages[0]?.createdAt)}</Text>
            </Pressable>
          </Animated.View>
        )}
      />

      <PressableScale style={styles.fab} onPress={() => setShowCreate(true)}>
        <Text style={styles.fabText}>+</Text>
      </PressableScale>

      <Modal visible={showCreate} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.duration(220)} style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tạo nhóm chat mới</Text>
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Tên nhóm"
              style={styles.input}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Text style={styles.cancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
                <Text style={styles.createButtonText}>Tạo nhóm</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyWrap: { alignItems: "center", marginTop: 40, gap: 8 },
  emptyIcon: { fontSize: 32 },
  empty: { textAlign: "center", color: colors.textMuted },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  groupCardHovered: {
    backgroundColor: colors.bubbleMine,
  },
  groupCardPressed: { opacity: 0.85 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: 12,
  },
  avatarImage: { width: 44, height: 44 },
  avatarText: { color: colors.white, fontWeight: "700", fontSize: 17 },
  groupName: { fontWeight: "600", color: colors.text, fontSize: 14.5 },
  lastMessage: { color: colors.textSecondary, fontSize: 12.5, marginTop: 2 },
  groupTime: { color: colors.textFaint, fontSize: 11.5, marginLeft: 8 },
  header: {
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { color: colors.text, fontSize: 19, fontWeight: "600" },
  headerSubtitle: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...raisedShadow,
  },
  fabText: { color: colors.white, fontSize: 28, marginTop: -2 },
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
    ...raisedShadow,
  },
  modalTitle: { fontWeight: "700", fontSize: 16, marginBottom: 12, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
  },
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
