"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { SearchInput } from "@/components/search-input";
import { DetailModal, DetailRow } from "@/components/detail-modal";

type Role =
  | "ADMIN"
  | "OPERATOR"
  | "QA"
  | "LINE_LEADER"
  | "TECHNOLOGY"
  | "DEPARTMENT_HEAD"
  | "MAINTENANCE"
  | "DIRECTOR";

type Employee = {
  id: string;
  employeeCode: string;
  name: string;
  phone: string | null;
  role: Role;
  areaId: string | null;
  area: { id: string; name: string } | null;
};

type AreaOption = { id: string; name: string };

const emptyForm = {
  employeeCode: "",
  name: "",
  phone: "",
  password: "",
  role: "OPERATOR" as Employee["role"],
  areaId: "",
};

const roleLabel: Record<Role, string> = {
  ADMIN: "Admin",
  OPERATOR: "Nhân viên vận hành",
  QA: "QA",
  LINE_LEADER: "Trưởng line",
  TECHNOLOGY: "Công nghệ",
  DEPARTMENT_HEAD: "Trưởng phòng ban",
  MAINTENANCE: "Bảo trì",
  DIRECTOR: "Giám đốc",
};

const ROLE_OPTIONS: Role[] = [
  "OPERATOR",
  "QA",
  "LINE_LEADER",
  "TECHNOLOGY",
  "DEPARTMENT_HEAD",
  "MAINTENANCE",
  "DIRECTOR",
  "ADMIN",
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Employee | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Employee["role"] | "ALL">("ALL");

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((e) => {
      const matchesSearch =
        !q ||
        e.employeeCode.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        (e.phone || "").toLowerCase().includes(q);
      const matchesRole = roleFilter === "ALL" || e.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [employees, search, roleFilter]);

  async function load() {
    setLoading(true);
    const [empRes, areasRes] = await Promise.all([
      fetch("/api/employees"),
      fetch("/api/categories?type=AREA"),
    ]);
    setEmployees(await empRes.json());
    setAreas(await areasRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  function openEdit(e: Employee) {
    setEditing(e);
    setForm({
      employeeCode: e.employeeCode,
      name: e.name,
      phone: e.phone || "",
      password: "",
      role: e.role,
      areaId: e.areaId || "",
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const url = editing ? `/api/employees/${editing.id}` : "/api/employees";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Có lỗi xảy ra");
      return;
    }
    setShowForm(false);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Xoá nhân viên này? Hành động không thể hoàn tác.")) return;
    await fetch(`/api/employees/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <PageHeader title="Nhân sự">
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo mã NV, tên, SĐT..." />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Employee["role"] | "ALL")}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          <option value="ALL">Tất cả vai trò</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {roleLabel[r]}
            </option>
          ))}
        </select>
        <button
          onClick={openCreate}
          className="whitespace-nowrap rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          + Thêm nhân viên
        </button>
      </PageHeader>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Mã NV</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">SĐT</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Khu vực / Xưởng</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={6}>
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && filteredEmployees.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={6}>
                  {employees.length === 0 ? "Chưa có nhân viên nào" : "Không tìm thấy nhân viên phù hợp"}
                </td>
              </tr>
            )}
            {filteredEmployees.map((emp) => (
              <tr
                key={emp.id}
                onClick={() => setViewing(emp)}
                className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="px-4 py-3 font-mono">{emp.employeeCode}</td>
                <td className="px-4 py-3">{emp.name}</td>
                <td className="px-4 py-3">{emp.phone}</td>
                <td className="px-4 py-3">{roleLabel[emp.role]}</td>
                <td className="px-4 py-3">{emp.area?.name || "-"}</td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEdit(emp)}
                    className="mr-3 text-slate-600 hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="text-red-600 hover:underline"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
          >
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              {editing ? "Sửa nhân viên" : "Thêm nhân viên"}
            </h2>

            <label className="mb-1 block text-sm font-medium text-slate-700">Mã nhân viên</label>
            <input
              value={form.employeeCode}
              onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />

            <label className="mb-1 block text-sm font-medium text-slate-700">Họ tên</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />

            <label className="mb-1 block text-sm font-medium text-slate-700">Số điện thoại</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />

            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mật khẩu {editing && "(để trống nếu không đổi)"}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              required={!editing}
            />

            <label className="mb-1 block text-sm font-medium text-slate-700">Vai trò</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Employee["role"] })}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {roleLabel[r]}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-sm font-medium text-slate-700">
              Khu vực / Xưởng
            </label>
            <select
              value={form.areaId}
              onChange={(e) => setForm({ ...form, areaId: e.target.value })}
              className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">-- Chưa chọn --</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {form.role !== "ADMIN" && form.role !== "OPERATOR" && (
              <p className="-mt-3 mb-4 text-xs text-slate-500">
                Khu vực/xưởng dùng để lọc thông báo, giao việc và điều tra sự cố đúng phạm vi.
              </p>
            )}

            {error && (
              <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Huỷ
              </button>
              <button
                type="submit"
                className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}

      {viewing && (
        <DetailModal
          title={viewing.name}
          subtitle={viewing.employeeCode}
          onClose={() => setViewing(null)}
          footer={
            <button
              onClick={() => {
                setViewing(null);
                openEdit(viewing);
              }}
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Sửa
            </button>
          }
        >
          <DetailRow label="Mã nhân viên" value={viewing.employeeCode} />
          <DetailRow label="Số điện thoại" value={viewing.phone} />
          <DetailRow label="Vai trò" value={roleLabel[viewing.role]} />
          <DetailRow label="Khu vực / Xưởng" value={viewing.area?.name} />
        </DetailModal>
      )}
    </div>
  );
}
