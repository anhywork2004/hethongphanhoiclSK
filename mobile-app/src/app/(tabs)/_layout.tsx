import { useEffect, useRef } from "react";
import { Redirect, Tabs } from "expo-router";
import { Animated, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/constants/colors";

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.85)).current;
  const translateY = useRef(new Animated.Value(focused ? -2 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.15 : 0.85,
      useNativeDriver: true,
      friction: 6,
    }).start();
    Animated.spring(translateY, {
      toValue: focused ? -2 : 0,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [focused, scale, translateY]);

  return (
    <Animated.View style={{ transform: [{ scale }, { translateY }] }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>
    </Animated.View>
  );
}

export default function TabsLayout() {
  const { token, loading, user } = useAuth();
  const insets = useSafeAreaInsets();

  if (loading) return null;
  if (!token) return <Redirect href="/login" />;

  const canSeeWorkTab = user?.role === "MAINTENANCE" || user?.role === "DEPARTMENT_HEAD";

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "700" },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          height: 58 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          borderTopWidth: 1,
          borderTopColor: colors.border,
          borderRadius: 0,
          backgroundColor: colors.white,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Thông báo",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="work"
        options={{
          title: "Công việc",
          headerShown: false,
          href: canSeeWorkTab ? undefined : null,
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛠️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
