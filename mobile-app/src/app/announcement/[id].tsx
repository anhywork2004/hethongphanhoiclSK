import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useAuth } from "@/lib/auth-context";
import { api, Announcement, ApiError, resolveImageUrl } from "@/lib/api";
import { colors } from "@/constants/colors";
import { radius } from "@/constants/ui-theme";

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;
    api
      .getAnnouncement(token, id)
      .then(setAnnouncement)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Không thể tải thông báo"))
      .finally(() => setLoading(false));
  }, [token, id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !announcement) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || "Không tìm thấy thông báo"}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {announcement.image ? (
        <Animated.Image
          entering={FadeIn.duration(300)}
          source={{ uri: resolveImageUrl(announcement.image) }}
          style={styles.image}
        />
      ) : (
        <Animated.View entering={FadeIn.duration(300)} style={styles.heroFallback}>
          <Text style={styles.heroFallbackIcon}>📢</Text>
        </Animated.View>
      )}
      <Animated.View
        entering={FadeInDown.delay(80).duration(320)}
        style={[styles.body, styles.bodyOverlap]}
      >
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View>
            <Text style={styles.author}>{announcement.createdBy.name}</Text>
            <Text style={styles.time}>
              {new Date(announcement.createdAt).toLocaleString("vi-VN")}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{announcement.title}</Text>
        <Text style={styles.content}>{announcement.content}</Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  errorText: { color: colors.danger },
  image: { width: "100%", height: 240, backgroundColor: colors.border },
  heroFallback: {
    width: "100%",
    height: 140,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  heroFallbackIcon: { fontSize: 44 },
  body: {
    padding: 20,
    gap: 12,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  bodyOverlap: { marginTop: -18 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.white, fontWeight: "700" },
  author: { fontWeight: "700", color: colors.text },
  time: { color: colors.textMuted, fontSize: 12, marginTop: 1 },
  title: { fontSize: 20, fontWeight: "700", color: colors.text },
  content: { fontSize: 15, lineHeight: 22, color: colors.text },
});
