"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Users, ShieldAlert, Plus, Trash2, Edit2, Check, RefreshCw, Layers, Clock, AlertCircle } from "lucide-react";

interface UserItem {
  id: string;
  mnv: string;
  fullName: string;
  position: string;
  department: string;
  role: string;
  zaloId?: string | null;
}

interface WorkshopItem {
  id: string;
  workshopCode: string;
  workshopName: string;
}

interface GroupMemberItem {
  id: string;
  userId: string;
  groupType: string;
  workshopId?: string | null;
  createdAt: string;
  userMnv?: string;
  userName?: string;
  userRole?: string;
  userZaloId?: string;
  workshopName?: string;
}

interface ZaloLogItem {
  id: string;
  issueId: string;
  userId?: string | null;
  groupType: string;
  status: string;
  errorMessage?: string | null;
  sentAt: string;
  userName?: string;
  userMnv?: string;
  userZaloId?: string;
}

export default function ZaloAdminPage() {
  const [activeTab, setActiveTab] = useState<"members" | "users" | "logs">("members");

  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [workshopsList, setWorkshopsList] = useState<WorkshopItem[]>([]);
  const [membersList, setMembersList] = useState<GroupMemberItem[]>([]);
  const [logsList, setLogsList] = useState<ZaloLogItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editZaloId, setEditZaloId] = useState("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Add member modal/form state
  const [selectedUserToAdd, setSelectedUserToAdd] = useState("");
  const [selectedGroupToAdd, setSelectedGroupToAdd] = useState<"truc_tiep_xu_ly" | "dua_giai_phap" | "tiep_nhan_thong_tin">("truc_tiep_xu_ly");
  const [selectedWorkshopToAdd, setSelectedWorkshopToAdd] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, wRes, mRes, lRes] = await Promise.all([
        fetch("/api/admin/users").then((r) => r.json()),
        fetch("/api/workshops").then((r) => r.json()),
        fetch("/api/admin/zalo-groups").then((r) => r.json()),
        fetch("/api/admin/zalo-logs").then((r) => r.json()),
      ]);

      if (uRes.users) setUsersList(uRes.users);
      if (wRes.workshops) setWorkshopsList(wRes.workshops);
      if (mRes.members) setMembersList(mRes.members);
      if (lRes.logs) setLogsList(lRes.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveZaloId = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, zaloId: editZaloId }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg("Cập nhật Zalo User ID thành công!");
        setEditingUserId(null);
        fetchData();
      }
    } catch {
      setActionMsg("Lỗi khi lưu Zalo User ID.");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserToAdd) return;

    try {
      const res = await fetch("/api/admin/zalo-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserToAdd,
          groupType: selectedGroupToAdd,
          workshopId: selectedGroupToAdd === "truc_tiep_xu_ly" ? selectedWorkshopToAdd || null : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg("Đã gán thành viên vào Nhóm Zalo!");
        setSelectedUserToAdd("");
        fetchData();
      }
    } catch {
      setActionMsg("Lỗi khi thêm thành viên vào nhóm.");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi Nhóm Zalo?")) return;

    try {
      const res = await fetch(`/api/admin/zalo-groups?id=${memberId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setActionMsg("Đã xóa khỏi Nhóm Zalo.");
        fetchData();
      }
    } catch {
      setActionMsg("Lỗi khi xóa thành viên.");
    }
  };

  const groupTypeLabels: Record<string, { label: string; bg: string; text: string }> = {
    truc_tiep_xu_ly: { label: "Nhóm 1: Trực Tiếp Xử Lý (15 Phút)", bg: "bg-rose-950 border-rose-800", text: "text-rose-400" },
    dua_giai_phap: { label: "Nhóm 2: Tiếp Nhận Đưa Giải Pháp", bg: "bg-amber-950 border-amber-800", text: "text-amber-400" },
    tiep_nhan_thong_tin: { label: "Nhóm 3: Tiếp Nhận Thông Tin (Ban Giám Đốc)", bg: "bg-blue-950 border-blue-800", text: "text-blue-400" },
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Quản Lý Zalo Official Account (OA) & Group
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Cấu hình Zalo User ID cho nhân viên & gán danh sách nhận tin tự động cho 3 nhóm thông báo.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center space-x-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-xl bg-blue-950/80 border border-blue-800/80 text-blue-200 text-xs flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab("members")}
          className={`px-5 py-3 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
            activeTab === "members"
              ? "bg-slate-900 text-blue-400 border-slate-700 shadow"
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          Phân Nhóm Zalo Notification (3 Nhóm)
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-5 py-3 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
            activeTab === "users"
              ? "bg-slate-900 text-blue-400 border-slate-700 shadow"
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          Danh Sách User & Cập Nhật Zalo ID
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-5 py-3 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
            activeTab === "logs"
              ? "bg-slate-900 text-blue-400 border-slate-700 shadow"
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          Lịch Sử Nhật Ký Gửi Zalo OA Log
        </button>
      </div>

      {/* Tab 1: Group Members Management */}
      {activeTab === "members" && (
        <div className="space-y-8">
          {/* Add member box */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Thêm Nhân Viên Vào Nhóm Thông Báo Zalo</span>
            </h3>

            <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Chọn Nhân Viên</label>
                <select
                  required
                  value={selectedUserToAdd}
                  onChange={(e) => setSelectedUserToAdd(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Chọn User --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      [{u.mnv}] {u.fullName} ({u.role}) - Zalo: {u.zaloId || "Chưa có"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Chọn Nhóm Zalo</label>
                <select
                  value={selectedGroupToAdd}
                  onChange={(e) => setSelectedGroupToAdd(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="truc_tiep_xu_ly">Nhóm 1: Trực Tiếp Xử Lý (15 Phút)</option>
                  <option value="dua_giai_phap">Nhóm 2: Tiếp Nhận Đưa Giải Pháp</option>
                  <option value="tiep_nhan_thong_tin">Nhóm 3: Tiếp Nhận Thông Tin</option>
                </select>
              </div>

              {selectedGroupToAdd === "truc_tiep_xu_ly" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Phân Xưởng (Nhóm 1)</label>
                  <select
                    value={selectedWorkshopToAdd}
                    onChange={(e) => setSelectedWorkshopToAdd(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Áp dụng Tất cả phân xưởng --</option>
                    {workshopsList.map((w) => (
                      <option key={w.id} value={w.id}>
                        [{w.workshopCode}] {w.workshopName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
                >
                  Thêm Vào Nhóm
                </button>
              </div>
            </form>
          </div>

          {/* Members list grouped by GroupType */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["truc_tiep_xu_ly", "dua_giai_phap", "tiep_nhan_thong_tin"] as const).map((gType) => {
              const cfg = groupTypeLabels[gType];
              const groupMembers = membersList.filter((m) => m.groupType === gType);

              return (
                <div key={gType} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                      {groupMembers.length} thành viên
                    </span>
                  </div>

                  {groupMembers.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs italic">
                      Chưa có thành viên nào trong nhóm này.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {groupMembers.map((m) => (
                        <div key={m.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-white">
                              {m.userName} <span className="text-blue-400 font-mono">({m.userMnv})</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Role: <span className="text-slate-300 font-semibold">{m.userRole}</span>
                              {m.workshopName && (
                                <span className="text-cyan-400 ml-1.5">• {m.workshopName}</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Zalo ID: {m.userZaloId || "Chưa nhập"}
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveMember(m.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-all"
                            title="Xóa khỏi nhóm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Users & Zalo ID Edit */}
      {activeTab === "users" && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Danh Sách Người Dùng & Cấu Hình Zalo User ID (Nhập Tay Admin)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Mã NV</th>
                  <th className="p-3">Họ và Tên</th>
                  <th className="p-3">Chức Vụ & Phòng Ban</th>
                  <th className="p-3">Role Hệ Thống</th>
                  <th className="p-3">Zalo User ID</th>
                  <th className="p-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-400">{u.mnv}</td>
                    <td className="p-3 font-bold text-white">{u.fullName}</td>
                    <td className="p-3 text-slate-300">
                      <div>{u.position}</div>
                      <div className="text-[10px] text-slate-500">{u.department}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-semibold">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      {editingUserId === u.id ? (
                        <input
                          type="text"
                          value={editZaloId}
                          onChange={(e) => setEditZaloId(e.target.value)}
                          className="px-2 py-1 rounded bg-slate-950 border border-blue-500 text-white text-xs font-mono"
                          placeholder="Nhập Zalo User ID..."
                        />
                      ) : (
                        <span className={u.zaloId ? "text-emerald-400" : "text-slate-500 italic"}>
                          {u.zaloId || "Chưa nhập Zalo ID"}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {editingUserId === u.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleSaveZaloId(u.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Lưu</span>
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-[10px]"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingUserId(u.id);
                            setEditZaloId(u.zaloId || "");
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold text-[10px] flex items-center space-x-1 inline-flex"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Sửa Zalo ID</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Zalo Logs */}
      {activeTab === "logs" && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Nhật Ký Lịch Sử Gửi Thông Báo Zalo OA (zalo_notification_log)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Mã Phiếu Lỗi</th>
                  <th className="p-3">Nhóm Zalo</th>
                  <th className="p-3">Người Nhận</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3">Thời Gian Gửi</th>
                  <th className="p-3">Chi Tiết / Lý Do Lỗi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {logsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                      Chưa có nhật ký gửi Zalo nào.
                    </td>
                  </tr>
                ) : (
                  logsList.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-400">{log.issueId}</td>
                      <td className="p-3 font-semibold text-slate-300">{log.groupType}</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{log.userName || "Hệ thống"}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Zalo ID: {log.userZaloId || "N/A"}</div>
                      </td>
                      <td className="p-3">
                        {log.status === "sent" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-[10px]">
                            SUCCESS
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800 font-bold text-[10px]">
                            FAILED
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400 font-mono">
                        {new Date(log.sentAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="p-3 text-slate-400 max-w-xs truncate">
                        {log.errorMessage || "Gửi thành công qua Zalo API"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
