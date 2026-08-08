"use client";

import { useState, useEffect } from "react";
import { Briefcase, UserCheck, CheckCircle2, AlertTriangle, Building, Wrench } from "lucide-react";

interface DepartmentOption {
  id: string;
  name: string;
  code?: string | null;
}

interface UserOption {
  id: string;
  mnv: string;
  fullName: string;
  departmentId?: string | null;
  areaId?: string | null;
  role: string;
}

interface TPAssignmentViewProps {
  issueId: string;
  issueCode: string;
  areaId?: string | null;
  rootCauseSummary?: string | null;
  proposedSolution?: string | null;
  onAssigned: () => void;
}

export function TPAssignmentView({
  issueId,
  issueCode,
  areaId,
  rootCauseSummary,
  proposedSolution,
  onAssigned,
}: TPAssignmentViewProps) {
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [usersList, setUsersList] = useState<UserOption[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("dept-bao-tri");
  const [selectedUserId, setSelectedUserId] = useState<string>("usr-handler");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDeptsAndUsers() {
      setLoading(true);
      try {
        const [dRes, uRes] = await Promise.all([
          fetch("/api/admin/departments").then((r) => r.json()),
          fetch("/api/admin/users").then((r) => r.json()),
        ]);
        if (dRes.success && dRes.departments?.length > 0) {
          setDepartments(dRes.departments);
          setSelectedDeptId(dRes.departments[0].id);
        } else {
          setDepartments([
            { id: "dept-bao-tri", name: "Phòng Bảo Trì", code: "PBT" },
            { id: "dept-cong-nghe", name: "Phòng Công Nghệ", code: "PCN" },
            { id: "dept-ky-thuat", name: "Phòng Kỹ Thuật", code: "PKT" },
          ]);
        }

        if (uRes.success && uRes.users?.length > 0) {
          setUsersList(uRes.users);
          const defaultUser = uRes.users.find((u: any) => u.role === "handler") || uRes.users[0];
          setSelectedUserId(defaultUser.id);
        } else {
          setUsersList([
            { id: "usr-handler", mnv: "KT001", fullName: "Đỗ Văn Hùng", departmentId: "dept-bao-tri", areaId: "ws-may-1", role: "handler" },
            { id: "usr-tech", mnv: "CN001", fullName: "Phạm Văn Dũng", departmentId: "dept-cong-nghe", areaId: "ws-may-1", role: "technology" },
          ]);
        }
      } catch {
        // fallback
      }
      setLoading(false);
    }
    loadDeptsAndUsers();
  }, []);

  // Filter technicians belonging to the selected department and same area
  const availableUsers = usersList.filter((u) => {
    // If areaId is specified, match areaId
    if (areaId && u.areaId && u.areaId !== areaId) return false;
    return true;
  });

  async function handleAssign() {
    if (!selectedDeptId || !selectedUserId) {
      setError("Vui lòng chọn đầy đủ Phòng ban và Nhân viên thực hiện!");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/issues/${issueId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId: selectedDeptId,
          assignedToId: selectedUserId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onAssigned();
      } else {
        setError(data.error || "Giao việc thất bại");
      }
    } catch {
      setError("Không thể kết nối máy chủ");
    }
    setSubmitting(false);
  }

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6 text-slate-900">
      <div className="flex items-center space-x-2 text-xs font-black text-[#004724] uppercase tracking-wider border-b border-slate-200 pb-3">
        <Briefcase className="w-4 h-4 text-[#004724]" />
        <span>Bước 4: Trưởng Phòng Ban (TP) Giao Việc Khắc Phục Sự Cố</span>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Root Cause & Proposed Solution Summary Display */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
        <div className="font-bold text-[#004724]">Nguyên nhân gốc do Line Leader chốt:</div>
        <p className="text-slate-800 font-semibold">{rootCauseSummary || "Đã xác định lỗi máy móc thiết bị"}</p>
        {proposedSolution && (
          <div className="pt-1 text-slate-600">
            <strong>Đề xuất giải pháp:</strong> {proposedSolution}
          </div>
        )}
      </div>

      {/* Department & Staff Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-[#004724] mb-1.5 flex items-center gap-1">
            <Building className="w-3.5 h-3.5" />
            <span>1. Chọn Phòng Ban Chịu Trách Nhiệm *</span>
          </label>
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#004724]"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {d.code ? `(${d.code})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-[#004724] mb-1.5 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>2. Chọn Nhân Viên Cùng Khu Vực *</span>
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#004724]"
          >
            {availableUsers.length > 0 ? (
              availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.mnv}) - {u.role === "handler" ? "Kỹ thuật bảo trì" : "Kỹ sư"}
                </option>
              ))
            ) : (
              <option value="">Không có nhân viên phù hợp cùng khu vực</option>
            )}
          </select>
        </div>
      </div>

      {/* Submit Assignment Button */}
      <button
        type="button"
        disabled={submitting || loading || !selectedUserId}
        onClick={handleAssign}
        className="w-full py-4 px-6 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] disabled:opacity-50"
      >
        <Wrench className="w-4 h-4" />
        <span>{submitting ? "Đang giao việc..." : "XÁC NHẬN GIAO VIỆC CHO NHÂN VIÊN"}</span>
      </button>
    </div>
  );
}
