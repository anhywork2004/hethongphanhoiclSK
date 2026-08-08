import { Stack } from "expo-router";
import { colors } from "@/constants/colors";

export default function ChatStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "700" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Chat nhóm", headerShown: false }} />
      <Stack.Screen name="[groupId]" options={{ title: "Nhóm chat" }} />
    </Stack>
  );
}
