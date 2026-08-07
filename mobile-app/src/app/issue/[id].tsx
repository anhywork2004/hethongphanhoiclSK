import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import {
  api,
  ApiError,
  QualityIssue,
  IssueStatus,
  PartCategory,
  User,
  resolveImageUrl,
} from "@/lib/api";
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

const submitterRoleLabel: Record<string, string> = {
  QA: "QA",
  LINE_LEADER: "Trưởng line",
  TECHNOLOGY: "Công nghệ",
};

function useImagePicker(token: string | null) {
  const [uploading, setUploading] = useState(false);
  async function pick(): Promise<string | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]?.base64 || !token) return null;
    setUploading(true);
    try {
      const asset = result.assets[0];
      const uploaded = await api.uploadImage(token, asset.base64!, asset.mimeType || "image/jpeg");
      return uploaded.url;
    } finally {
      setUploading(false);
    }
  }
  return { pick, uploading };
}

function ImageRow({ images, onAdd, uploading }: { images: string[]; onAdd: () => void; uploading: boolean }) {
  return (
    <View style={styles.pillRow}>
      {images.map((img, i) => (
        <Image key={i} source={{ uri: resolveImageUrl(img) }} style={styles.thumb} />
      ))}
      <TouchableOpacity style={styles.addImageBtn} onPress={onAdd} disabled={uploading}>
        {uploading ? <ActivityIndicator /> : <Text style={{ fontSize: 22 }}>+</Text>}
      </TouchableOpacity>
    </View>
  );
}

export default function IssueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();
  const [issue, setIssue] = useState<QualityIssue | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token || !id) return;
    const data = await api.getIssue(token, id);
    setIssue(data);
  }, [token, id]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  if (loading || !issue) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>‹ Quay lại</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const badge = statusBadgeStyle[issue.status];
  const isInvestigator = user?.role === "QA" || user?.role === "LINE_LEADER" || user?.role === "TECHNOLOGY";
  const mySubmission = issue.submissions.find((s) => s.submitterId === user?.id);
  const deadlinePassed = issue.investigationDeadline
    ? Date.now() > new Date(issue.investigationDeadline).getTime()
    : false;
  const canSubmit5M1E =
    isInvestigator &&
    !mySubmission &&
    !issue.investigationLocked &&
    !deadlinePassed &&
    (issue.status === "REPORTED" || issue.status === "INVESTIGATING");

  const canDecideRootCause =
    user?.role === "LINE_LEADER" &&
    issue.status !== "ROOT_CAUSE_FOUND" &&
    issue.status !== "ASSIGNED" &&
    issue.status !== "IN_PROGRESS" &&
    issue.status !== "DONE" &&
    issue.submissions.length > 0;

  const canAssign = user?.role === "DEPARTMENT_HEAD" && issue.status === "ROOT_CAUSE_FOUND";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>‹ Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PO {issue.poCode}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardPo}>PO {issue.poCode}</Text>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.color }]}>{statusLabel[issue.status]}</Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>{issue.description}</Text>
          <Text style={styles.cardMeta}>
            {issue.team?.name || "-"} / {issue.productionLine?.name || "-"}
            {issue.failureCategory ? ` · ${issue.failureCategory.name}` : ""}
          </Text>
          <Text style={styles.cardMeta}>Người báo cáo: {issue.reporter?.name}</Text>
          {issue.images && (
            <View style={styles.pillRow}>
              {(JSON.parse(issue.images) as string[]).map((img, i) => (
                <Image key={i} source={{ uri: resolveImageUrl(img) }} style={styles.thumb} />
              ))}
            </View>
          )}
        </View>

        {canSubmit5M1E && <FiveMOneEForm token={token} issueId={issue.id} onDone={load} />}

        {issue.submissions.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Kết quả điều tra 5M+1E</Text>
            <View style={{ gap: 10, marginTop: 8 }}>
              {issue.submissions.map((s) => (
                <View key={s.id} style={styles.card}>
                  <Text style={styles.cardPo}>{submitterRoleLabel[s.submitterRole]} — {s.submitter?.name}</Text>
                  <Field label="Man (Con người)" value={s.man} />
                  <Field label="Machine (Máy móc)" value={s.machine} />
                  <Field label="Material (Nguyên liệu)" value={s.material} />
                  <Field label="Method (Phương pháp)" value={s.method} />
                  <Field label="Measurement (Đo lường)" value={s.measurement} />
                  <Field label="Environment (Môi trường)" value={s.environment} />
                </View>
              ))}
            </View>
          </View>
        )}

        {issue.rootCause && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Nguyên nhân gốc</Text>
            <Text style={styles.cardDesc}>{issue.rootCause}</Text>
            {issue.solution && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Giải pháp đề xuất</Text>
                <Text style={styles.cardDesc}>{issue.solution}</Text>
              </>
            )}
          </View>
        )}

        {canDecideRootCause && <RootCauseForm token={token} issueId={issue.id} onDone={load} />}

        {canAssign && <AssignForm token={token} issueId={issue.id} onDone={load} />}

        {issue.task && (
          <TaskCard token={token} issue={issue} user={user} onDone={load} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginTop: 6 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function FiveMOneEForm({ token, issueId, onDone }: { token: string | null; issueId: string; onDone: () => Promise<void> }) {
  const { pick, uploading } = useImagePicker(token);
  const [poCode, setPoCode] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [man, setMan] = useState("");
  const [machine, setMachine] = useState("");
  const [material, setMaterial] = useState("");
  const [method, setMethod] = useState("");
  const [measurement, setMeasurement] = useState("");
  const [environment, setEnvironment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddImage() {
    const url = await pick();
    if (url) setImages((prev) => [...prev, url]);
  }

  async function handleSubmit() {
    if (!token) return;
    if (!poCode.trim() || !man.trim() || !machine.trim() || !material.trim() || !method.trim() || !measurement.trim() || !environment.trim()) {
      setError("Vui lòng điền đầy đủ các mục");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.submit5M1E(token, issueId, {
        poCode: poCode.trim(),
        images,
        man: man.trim(),
        machine: machine.trim(),
        material: material.trim(),
        method: method.trim(),
        measurement: measurement.trim(),
        environment: environment.trim(),
      });
      await onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không thể gửi biểu mẫu");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Điều tra nguyên nhân (5M+1E)</Text>
      <Text style={styles.formLabel}>Mã PO</Text>
      <TextInput value={poCode} onChangeText={setPoCode} style={styles.input} placeholder="VD: PO-2026-001" />

      <Text style={styles.formLabel}>Hình ảnh</Text>
      <ImageRow images={images} onAdd={handleAddImage} uploading={uploading} />

      <LabeledArea label="Man (Con người)" value={man} onChangeText={setMan} />
      <LabeledArea label="Machine (Máy móc)" value={machine} onChangeText={setMachine} />
      <LabeledArea label="Material (Nguyên liệu)" value={material} onChangeText={setMaterial} />
      <LabeledArea label="Method (Phương pháp)" value={method} onChangeText={setMethod} />
      <LabeledArea label="Measurement (Đo lường)" value={measurement} onChangeText={setMeasurement} />
      <LabeledArea label="Environment (Môi trường)" value={environment} onChangeText={setEnvironment} />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <PressableScale style={[styles.primaryBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.primaryBtnText}>{submitting ? "Đang gửi..." : "Gửi biểu mẫu"}</Text>
      </PressableScale>
    </View>
  );
}

function LabeledArea({ label, value, onChangeText }: { label: string; value: string; onChangeText: (v: string) => void }) {
  return (
    <>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline
        style={[styles.input, { height: 64, textAlignVertical: "top" }]}
      />
    </>
  );
}

function RootCauseForm({ token, issueId, onDone }: { token: string | null; issueId: string; onDone: () => Promise<void> }) {
  const [rootCause, setRootCause] = useState("");
  const [solution, setSolution] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!token) return;
    if (!rootCause.trim()) {
      setError("Vui lòng nhập nguyên nhân gốc");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.decideRootCause(token, issueId, { rootCause: rootCause.trim(), solution: solution.trim() || undefined });
      await onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không thể chốt nguyên nhân");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Chốt nguyên nhân gốc</Text>
      <LabeledArea label="Nguyên nhân gốc" value={rootCause} onChangeText={setRootCause} />
      <LabeledArea label="Giải pháp đề xuất (không bắt buộc)" value={solution} onChangeText={setSolution} />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <PressableScale style={[styles.primaryBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.primaryBtnText}>{submitting ? "Đang gửi..." : "Chốt nguyên nhân"}</Text>
      </PressableScale>
    </View>
  );
}

function AssignForm({ token, issueId, onDone }: { token: string | null; issueId: string; onDone: () => Promise<void> }) {
  const [code, setCode] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(text: string) {
    setCode(text);
    setSelected(null);
    if (!token || !text.trim()) {
      setResults([]);
      return;
    }
    try {
      const data = await api.searchMaintenanceInMyArea(token, text.trim());
      setResults(data);
    } catch {
      setResults([]);
    }
  }

  async function handleAssign() {
    if (!token || !selected) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.assignTask(token, issueId, selected.id);
      await onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không thể giao việc");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Giao việc cho bảo trì</Text>
      <TextInput
        value={code}
        onChangeText={handleSearch}
        placeholder="Tìm theo mã nhân viên hoặc tên"
        style={styles.input}
      />
      <View style={styles.pillRow}>
        {results.map((u) => (
          <TouchableOpacity
            key={u.id}
            onPress={() => setSelected(u)}
            style={[styles.pill, selected?.id === u.id && styles.pillActive]}
          >
            <Text style={[styles.pillText, selected?.id === u.id && styles.pillTextActive]}>
              {u.name} ({u.employeeCode})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <PressableScale
        style={[styles.primaryBtn, (submitting || !selected) && { opacity: 0.6 }]}
        onPress={handleAssign}
        disabled={submitting || !selected}
      >
        <Text style={styles.primaryBtnText}>{submitting ? "Đang giao..." : "Giao việc"}</Text>
      </PressableScale>
    </View>
  );
}

function TaskCard({
  token,
  issue,
  user,
  onDone,
}: {
  token: string | null;
  issue: QualityIssue;
  user: ReturnType<typeof useAuth>["user"];
  onDone: () => Promise<void>;
}) {
  const task = issue.task!;
  const isMine = user?.role === "MAINTENANCE" && task.assignee.id === user.id;

  return (
    <View style={styles.ticketCard}>
      <Text style={styles.ticketTitle}>{task.status === "PENDING" ? "CẦN TRỢ GIÚP" : "Việc bảo trì"}</Text>
      <Text style={styles.cardMeta}>Người báo cáo: {issue.reporter?.name}</Text>
      <Text style={styles.cardMeta}>
        {issue.team?.name || "-"} / {issue.productionLine?.name || "-"}
      </Text>
      <Text style={styles.cardDesc}>{issue.description}</Text>
      {issue.solution && <Text style={styles.cardMeta}>Giải pháp đề xuất: {issue.solution}</Text>}
      <Text style={styles.cardMeta}>Bảo trì: {task.assignee.name}</Text>
      {task.acceptedAt && (
        <Text style={styles.cardMeta}>
          Đã nhận lúc {new Date(task.acceptedAt).toLocaleString("vi-VN")}
        </Text>
      )}

      {isMine && task.status === "PENDING" && <AcceptButton token={token} taskId={task.id} onDone={onDone} />}
      {isMine && task.status === "ACCEPTED" && <CompleteForm token={token} taskId={task.id} onDone={onDone} />}

      {task.status === "DONE" && (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.cardMeta}>
            Hoàn thành lúc {task.completedAt ? new Date(task.completedAt).toLocaleString("vi-VN") : "-"}
          </Text>
          {task.repairDetail && <Text style={styles.cardDesc}>Đã sửa: {task.repairDetail}</Text>}
        </View>
      )}

      {user?.role === "LINE_LEADER" && task.status === "DONE" && task.verifiedStatus === "PENDING" && (
        <VerifyButtons token={token} taskId={task.id} completedAt={task.completedAt} onDone={onDone} />
      )}

      {task.verifiedStatus === "CONFIRMED_DONE" && (
        <Text style={[styles.cardMeta, { color: colors.statusDoneText, marginTop: 6 }]}>✓ Đã xác nhận hoàn thành</Text>
      )}
    </View>
  );
}

function AcceptButton({ token, taskId, onDone }: { token: string | null; taskId: string; onDone: () => Promise<void> }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.acceptTask(token, taskId);
      await onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không thể nhận việc");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={{ marginTop: 10 }}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <PressableScale style={[styles.primaryBtn, submitting && { opacity: 0.6 }]} onPress={handleAccept} disabled={submitting}>
        <Text style={styles.primaryBtnText}>{submitting ? "Đang nhận..." : "Nhận việc"}</Text>
      </PressableScale>
    </View>
  );
}

function CompleteForm({ token, taskId, onDone }: { token: string | null; taskId: string; onDone: () => Promise<void> }) {
  const { pick: pickBefore, uploading: uploadingBefore } = useImagePicker(token);
  const { pick: pickAfter, uploading: uploadingAfter } = useImagePicker(token);
  const [repairDetail, setRepairDetail] = useState("");
  const [imagesBefore, setImagesBefore] = useState<string[]>([]);
  const [imagesAfter, setImagesAfter] = useState<string[]>([]);
  const [parts, setParts] = useState<{ partCategoryId: string; note: string }[]>([]);
  const [partCategories, setPartCategories] = useState<PartCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) api.listPartCategories(token).then(setPartCategories).catch(() => {});
  }, [token]);

  function addRow() {
    setParts((prev) => [...prev, { partCategoryId: "", note: "" }]);
  }
  function removeRow(index: number) {
    setParts((prev) => prev.filter((_, i) => i !== index));
  }
  function setRowPart(index: number, partCategoryId: string) {
    setParts((prev) => prev.map((p, i) => (i === index ? { ...p, partCategoryId } : p)));
  }
  function setRowNote(index: number, note: string) {
    setParts((prev) => prev.map((p, i) => (i === index ? { ...p, note } : p)));
  }

  async function handleSubmit() {
    if (!token) return;
    if (!repairDetail.trim()) {
      setError("Vui lòng nhập mô tả sửa chữa");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.completeTask(token, taskId, {
        repairDetail: repairDetail.trim(),
        partsReplaced: parts.filter((p) => p.partCategoryId),
        imagesBefore,
        imagesAfter,
      });
      await onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không thể hoàn thành việc");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={{ marginTop: 12, gap: 4 }}>
      <Text style={styles.formLabel}>Mô tả sửa chữa</Text>
      <TextInput
        value={repairDetail}
        onChangeText={setRepairDetail}
        multiline
        style={[styles.input, { height: 64, textAlignVertical: "top" }]}
      />

      <Text style={styles.formLabel}>Linh kiện thay thế</Text>
      {parts.map((row, i) => (
        <View key={i} style={styles.partRow}>
          <View style={styles.pillRow}>
            {partCategories.map((pc) => (
              <TouchableOpacity
                key={pc.id}
                onPress={() => setRowPart(i, pc.id)}
                style={[styles.pill, row.partCategoryId === pc.id && styles.pillActive]}
              >
                <Text style={[styles.pillText, row.partCategoryId === pc.id && styles.pillTextActive]}>
                  {pc.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={row.note}
            onChangeText={(t) => setRowNote(i, t)}
            placeholder="Ghi chú (không bắt buộc)"
            style={[styles.input, { marginTop: 6 }]}
          />
          <TouchableOpacity onPress={() => removeRow(i)}>
            <Text style={styles.removeRowText}>Xoá dòng</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={addRow} style={styles.addRowBtn}>
        <Text style={styles.addRowBtnText}>+ Thêm linh kiện</Text>
      </TouchableOpacity>

      <Text style={styles.formLabel}>Ảnh trước sửa chữa</Text>
      <ImageRow images={imagesBefore} onAdd={async () => {
        const url = await pickBefore();
        if (url) setImagesBefore((prev) => [...prev, url]);
      }} uploading={uploadingBefore} />

      <Text style={styles.formLabel}>Ảnh sau sửa chữa</Text>
      <ImageRow images={imagesAfter} onAdd={async () => {
        const url = await pickAfter();
        if (url) setImagesAfter((prev) => [...prev, url]);
      }} uploading={uploadingAfter} />

      {error && <Text style={styles.errorText}>{error}</Text>}
      <PressableScale style={[styles.primaryBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.primaryBtnText}>{submitting ? "Đang gửi..." : "Hoàn thành"}</Text>
      </PressableScale>
    </View>
  );
}

function VerifyButtons({
  token,
  taskId,
  completedAt,
  onDone,
}: {
  token: string | null;
  taskId: string;
  completedAt: string | null;
  onDone: () => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedMs = completedAt ? new Date(completedAt).getTime() : null;
  const now = Date.now();
  const windowStart = completedMs ? completedMs + 3 * 60 * 60 * 1000 : null;
  const windowEnd = completedMs ? completedMs + 48 * 60 * 60 * 1000 : null;
  const canVerify = windowStart !== null && windowEnd !== null && now >= windowStart && now <= windowEnd;

  async function handleVerify(confirmed: boolean) {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.verifyTask(token, taskId, confirmed);
      await onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không thể xác nhận");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={{ marginTop: 10 }}>
      {!canVerify && (
        <Text style={styles.cardMeta}>
          {windowStart && now < windowStart
            ? `Chỉ có thể xác nhận sau ${new Date(windowStart).toLocaleString("vi-VN")}`
            : "Đã quá hạn xác nhận, hệ thống sẽ tự động hoàn thành"}
        </Text>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
        <PressableScale
          style={[styles.verifyBtnDone, (!canVerify || submitting) && { opacity: 0.5 }]}
          onPress={() => handleVerify(true)}
          disabled={!canVerify || submitting}
        >
          <Text style={styles.primaryBtnText}>Đã hoàn thành</Text>
        </PressableScale>
        <PressableScale
          style={[styles.verifyBtnReject, (!canVerify || submitting) && { opacity: 0.5 }]}
          onPress={() => handleVerify(false)}
          disabled={!canVerify || submitting}
        >
          <Text style={styles.verifyBtnRejectText}>Chưa hoàn thành</Text>
        </PressableScale>
      </View>
    </View>
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
  backBtn: { color: colors.primary, fontWeight: "600", fontSize: 14 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  fieldLabel: { fontSize: 11, fontWeight: "600", color: colors.textMuted },
  fieldValue: { fontSize: 13, color: colors.text, marginTop: 2 },
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
  errorText: { color: colors.danger, fontSize: 13, marginTop: 8 },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  primaryBtnText: { color: colors.white, fontWeight: "700" },
  ticketCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.danger,
    padding: 14,
    gap: 4,
  },
  ticketTitle: { color: colors.danger, fontWeight: "800", fontSize: 14, marginBottom: 4 },
  partRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 10,
    marginTop: 6,
  },
  removeRowText: { color: colors.danger, fontSize: 12, marginTop: 6 },
  addRowBtn: { marginTop: 8, alignSelf: "flex-start" },
  addRowBtnText: { color: colors.primary, fontWeight: "600", fontSize: 13 },
  verifyBtnDone: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: "center",
  },
  verifyBtnReject: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: "center",
  },
  verifyBtnRejectText: { color: colors.danger, fontWeight: "700" },
});
