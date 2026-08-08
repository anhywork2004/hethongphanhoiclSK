import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError, FailureCategory } from "@/lib/api";
import { colors } from "@/constants/colors";
import { radius } from "@/constants/ui-theme";
import { PressableScale } from "@/components/pressable-scale";

export default function ReportIncidentScreen() {
  const { machineId } = useLocalSearchParams<{ machineId: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [description, setDescription] = useState("");
  const [images, setImages] = useState<{ uri: string; base64: string; mimeType: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<FailureCategory[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FailureCategory | null>(null);
  const [customCategoryText, setCustomCategoryText] = useState("");

  useEffect(() => {
    if (!token) return;
    api.listFailureCategories(token).then(setCategories).catch(() => {});
  }, [token]);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;
    const asset = result.assets[0];
    setImages((prev) => [
      ...prev,
      { uri: asset.uri, base64: asset.base64!, mimeType: asset.mimeType || "image/jpeg" },
    ]);
  }

  async function handleSubmit() {
    if (!token || !machineId) return;
    if (!description.trim()) {
      setError("Vui lòng mô tả tình trạng hư hỏng");
      return;
    }
    if (!selectedCategory) {
      setError("Vui lòng chọn danh mục hư");
      return;
    }
    if (selectedCategory.isOther && !customCategoryText.trim()) {
      setError("Vui lòng nhập danh mục hư cụ thể");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      for (const img of images) {
        const uploaded = await api.uploadImage(token, img.base64, img.mimeType);
        uploadedUrls.push(uploaded.url);
      }

      await api.createIncident(token, {
        machineId,
        description: description.trim(),
        images: uploadedUrls,
        categoryId: selectedCategory.id,
        customCategoryText: selectedCategory.isOther ? customCategoryText.trim() : undefined,
      });

      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không thể gửi báo lỗi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={styles.label}>Danh mục hư</Text>
      <TouchableOpacity style={styles.select} onPress={() => setShowCategoryPicker(true)}>
        <Text style={styles.selectIcon}>🗂️</Text>
        <Text style={[selectedCategory ? styles.selectValue : styles.selectPlaceholder, { flex: 1 }]}>
          {selectedCategory?.name || "Chọn danh mục hư"}
        </Text>
        <Text style={styles.selectChevron}>⌄</Text>
      </TouchableOpacity>

      {selectedCategory?.isOther && (
        <TextInput
          value={customCategoryText}
          onChangeText={setCustomCategoryText}
          placeholder="Nhập danh mục hư cụ thể"
          style={styles.input}
        />
      )}

      <Text style={styles.label}>Hình ảnh thực tế</Text>
      <View style={styles.imageRow}>
        {images.map((img, idx) => (
          <Image key={idx} source={{ uri: img.uri }} style={styles.thumbnail} />
        ))}
        <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
          <Text style={styles.addImageIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Mô tả tình trạng hư hỏng</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Mô tả chi tiết sự cố..."
        multiline
        numberOfLines={5}
        style={styles.textArea}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <PressableScale
        style={[styles.submitButton, submitting && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? "Đang gửi..." : "Gửi báo lỗi"}
        </Text>
      </PressableScale>

      <Modal visible={showCategoryPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.duration(220)} style={styles.modalCard}>
            <Text style={styles.modalTitle}>Chọn danh mục hư</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryOption}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.categoryOptionText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowCategoryPicker(false)}
            >
              <Text style={styles.modalCancelText}>Huỷ</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  label: { fontWeight: "700", color: colors.text, marginBottom: 4 },
  select: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectIcon: { fontSize: 16 },
  selectValue: { color: colors.text, fontSize: 15 },
  selectPlaceholder: { color: colors.textMuted, fontSize: 15 },
  selectChevron: { color: colors.textMuted, fontSize: 16 },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  imageRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  addImageIcon: { fontSize: 28, color: colors.textMuted },
  textArea: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    minHeight: 120,
    textAlignVertical: "top",
  },
  error: {
    color: colors.danger,
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: radius.sm,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonText: { color: colors.white, fontWeight: "700", fontSize: 16 },
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
    padding: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 8,
    color: colors.text,
    paddingHorizontal: 8,
  },
  categoryOption: { paddingVertical: 13, paddingHorizontal: 8 },
  categoryOptionText: { fontSize: 15, color: colors.text },
  modalCancel: { marginTop: 4, paddingVertical: 10, alignItems: "center" },
  modalCancelText: { color: colors.textMuted, fontWeight: "600" },
});
