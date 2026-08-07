import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError, NotificationItem, RatingRequest, resolveImageUrl } from "@/lib/api";
import { colors } from "@/constants/colors";
import { radius } from "@/constants/ui-theme";
import { PressableScale } from "@/components/pressable-scale";

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "vừa xong";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function RatingRequestCard({
  ratingRequest,
  createdAt,
  busy,
  onSubmit,
}: {
  ratingRequest: RatingRequest;
  createdAt: string;
  busy: boolean;
  onSubmit: (rating: number) => void;
}) {
  const [rating, setRating] = useState(5);
  const log = ratingRequest.maintenanceLog;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={[styles.avatar, { backgroundColor: colors.success }]}>
          <Text style={styles.avatarText}>✓</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Yêu cầu đánh giá bảo trì</Text>
          <Text style={styles.cardTime}>{timeAgo(createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.cardBody}>
        <Text style={{ fontWeight: "700" }}>{log.technician.name}</Text> đã hoàn thành sửa máy{" "}
        <Text style={{ fontWeight: "700" }}>
          {log.machine.name} ({log.machine.code})
        </Text>
        . Hãy đánh giá tay nghề bảo trì.
      </Text>

      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <PressableScale key={n} scaleTo={1.2} onPress={() => setRating(n)}>
            <Text style={[styles.star, n <= rating && styles.starActive]}>★</Text>
          </PressableScale>
        ))}
      </View>

      <PressableScale
        style={styles.acceptButton}
        disabled={busy}
        onPress={() => onSubmit(rating)}
      >
        <Text style={styles.acceptButtonText}>Gửi đánh giá</Text>
      </PressableScale>
    </View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const data = await api.listNotifications(token);
    setItems(data);
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

  async function respond(invitationId: string, action: "accept" | "reject") {
    if (!token) return;
    setRespondingId(invitationId);
    try {
      await api.respondToInvitation(token, invitationId, action);
      setItems((prev) => prev.filter((it) => it.id !== invitationId));
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Không thể xử lý lời mời";
      Alert.alert("Lỗi", message);
    } finally {
      setRespondingId(null);
    }
  }

  async function submitRating(ratingRequestId: string, rating: number) {
    if (!token) return;
    setRespondingId(ratingRequestId);
    try {
      await api.submitRating(token, ratingRequestId, rating);
      setItems((prev) => prev.filter((it) => it.id !== ratingRequestId));
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Không thể gửi đánh giá";
      Alert.alert("Lỗi", message);
    } finally {
      setRespondingId(null);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {(user?.name || "?").trim().charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => `${item.kind}-${item.id}`}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.empty}>Chưa có thông báo nào</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const entering = FadeInDown.delay(Math.min(index, 8) * 45).duration(320);
          if (item.kind === "INVITATION") {
            const inv = item.invitation;
            const busy = respondingId === inv.id;
            return (
              <Animated.View entering={entering} style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{inv.group.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Lời mời tham gia nhóm</Text>
                    <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
                  </View>
                </View>
                <Text style={styles.cardBody}>
                  <Text style={{ fontWeight: "700" }}>{inv.invitedBy.name}</Text> mời bạn tham gia
                  nhóm <Text style={{ fontWeight: "700" }}>{inv.group.name}</Text>
                </Text>
                <View style={styles.actionRow}>
                  <PressableScale
                    style={styles.rejectButton}
                    disabled={busy}
                    onPress={() => respond(inv.id, "reject")}
                  >
                    <Text style={styles.rejectButtonText}>Từ chối</Text>
                  </PressableScale>
                  <PressableScale
                    style={styles.acceptButton}
                    disabled={busy}
                    onPress={() => respond(inv.id, "accept")}
                  >
                    <Text style={styles.acceptButtonText}>Chấp nhận</Text>
                  </PressableScale>
                </View>
              </Animated.View>
            );
          }

          if (item.kind === "RATING_REQUEST") {
            return (
              <Animated.View entering={entering}>
                <RatingRequestCard
                  ratingRequest={item.ratingRequest}
                  createdAt={item.createdAt}
                  busy={respondingId === item.id}
                  onSubmit={(rating) => submitRating(item.id, rating)}
                />
              </Animated.View>
            );
          }

          if (item.kind === "INCIDENT_ACCEPTED") {
            const inc = item.incident;
            const acceptedTime = inc.acceptedAt
              ? new Date(inc.acceptedAt).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                })
              : "";
            return (
              <Animated.View entering={entering} style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.avatarText}>
                      {(inc.assignedTo?.name || "?").charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>
                      {inc.status === "DONE" ? "Đã hoàn thành công việc" : "Đã nhận việc sửa máy"}
                    </Text>
                    <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
                  </View>
                </View>
                <Text style={styles.cardBody}>
                  <Text style={{ fontWeight: "700" }}>{inc.assignedTo?.name}</Text> đã nhận xử lý sự
                  cố bạn báo tại máy{" "}
                  <Text style={{ fontWeight: "700" }}>
                    {inc.machine?.name} ({inc.machine?.code})
                  </Text>{" "}
                  lúc {acceptedTime}
                </Text>
              </Animated.View>
            );
          }

          const ann = item.announcement;
          return (
            <Animated.View entering={entering}>
              <PressableScale
                style={styles.card}
                onPress={() => router.push(`/announcement/${ann.id}`)}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.avatar, { backgroundColor: colors.primaryDark }]}>
                    <Text style={styles.avatarText}>A</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Quản trị viên · {ann.createdBy.name}</Text>
                    <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
                  </View>
                </View>
                <Text style={styles.postTitle}>{ann.title}</Text>
                {ann.image && (
                  <Image source={{ uri: resolveImageUrl(ann.image) }} style={styles.postImage} />
                )}
                <Text style={styles.cardBody} numberOfLines={3}>
                  {ann.content}
                </Text>
                <Text style={styles.readMore}>Xem chi tiết →</Text>
              </PressableScale>
            </Animated.View>
          );
        }}
      />
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
  emptyWrap: { alignItems: "center", marginTop: 40, gap: 8 },
  emptyIcon: { fontSize: 32 },
  empty: { textAlign: "center", color: colors.textMuted },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.white, fontWeight: "700" },
  cardTitle: { fontWeight: "600", color: colors.text, fontSize: 13 },
  cardTime: { color: colors.textMuted, fontSize: 11, marginTop: 1 },
  cardBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  postTitle: { fontWeight: "600", color: colors.text, fontSize: 15 },
  postImage: {
    width: "100%",
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  readMore: { color: colors.primary, fontSize: 12, fontWeight: "700", marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  rejectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: "center",
  },
  rejectButtonText: { color: colors.danger, fontWeight: "700" },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: "center",
  },
  acceptButtonText: { color: colors.white, fontWeight: "700" },
  starRow: { flexDirection: "row", gap: 6, marginTop: 2 },
  star: { fontSize: 28, color: colors.border },
  starActive: { color: colors.warning },
});
