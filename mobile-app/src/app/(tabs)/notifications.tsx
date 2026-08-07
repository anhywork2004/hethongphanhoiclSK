import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { api, NotificationItem } from "@/lib/api";
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

const KIND_META: Record<
  NotificationItem["kind"],
  { icon: string; title: string; color: string }
> = {
  NEED_INVESTIGATE: { icon: "🔍", title: "Cần điều tra 5M+1E", color: colors.statusPendingText },
  NEED_ROOT_CAUSE: { icon: "🧩", title: "Cần chốt nguyên nhân gốc", color: colors.statusAcceptedText },
  NEED_ASSIGN: { icon: "📋", title: "Cần giao việc bảo trì", color: colors.statusAcceptedText },
  TASK_ASSIGNED: { icon: "🛠️", title: "Có việc cần trợ giúp", color: colors.danger },
  TASK_ACCEPTED: { icon: "✅", title: "Đã nhận việc", color: colors.primary },
  NEED_VERIFY: { icon: "⏳", title: "Cần xác nhận hoàn thành", color: colors.statusPendingText },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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

  function goToIssue(issueId: string) {
    router.push(`/issue/${issueId}`);
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
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.empty}>Chưa có thông báo nào</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const meta = KIND_META[item.kind];
          const entering = FadeInDown.delay(Math.min(index, 8) * 45).duration(320);

          const issue = "issue" in item ? item.issue : item.task.issue;
          const issueId = issue.id;

          let bodyText = `PO ${issue.poCode}: ${issue.description}`;
          if (item.kind === "TASK_ACCEPTED") {
            bodyText = `${item.task.assignee.name} đã nhận việc lúc ${
              item.task.acceptedAt
                ? new Date(item.task.acceptedAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""
            }`;
          } else if (item.kind === "NEED_VERIFY") {
            bodyText = `${item.task.assignee.name} đã hoàn thành sửa chữa — bấm vào xác nhận.`;
          } else if (item.kind === "NEED_ROOT_CAUSE") {
            bodyText = `Đủ dữ liệu 5M+1E cho PO ${issue.poCode} — vào chốt nguyên nhân gốc.`;
          } else if (item.kind === "NEED_ASSIGN") {
            bodyText = `PO ${issue.poCode} đã có nguyên nhân gốc — vào giao việc cho bảo trì.`;
          }

          return (
            <Animated.View entering={entering}>
              <PressableScale style={styles.card} onPress={() => goToIssue(issueId)}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.avatar, { backgroundColor: meta.color }]}>
                    <Text style={styles.avatarText}>{meta.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{meta.title}</Text>
                    <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
                  </View>
                </View>
                <Text style={styles.cardBody}>{bodyText}</Text>
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
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16 },
  cardTitle: { fontWeight: "600", color: colors.text, fontSize: 13 },
  cardTime: { color: colors.textMuted, fontSize: 11, marginTop: 1 },
  cardBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
});
