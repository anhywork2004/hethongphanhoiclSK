import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/lib/auth-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="login" options={{ animation: "fade" }} />
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen
          name="scan"
          options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="machine/[code]"
          options={{ headerShown: true, title: "Thông tin máy" }}
        />
        <Stack.Screen
          name="report-incident/[machineId]"
          options={{
            headerShown: true,
            title: "Báo lỗi máy",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="announcement/[id]"
          options={{ headerShown: true, title: "Thông báo" }}
        />
      </Stack>
    </AuthProvider>
  );
}
