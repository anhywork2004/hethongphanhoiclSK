"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SearchInput } from "@/components/search-input";
import { DetailModal, DetailRow } from "@/components/detail-modal";

type CategoryType =
  | "AREA"
  | "PRODUCTION_LINE"
  | "TEAM"
  | "FAILURE"
  | "MAINTENANCE_PERIOD"
  | "MACHINE_STATUS"
  | "MACHINE_TYPE";

type StatusKind = "ACTIVE" | "STOPPED" | "MAINTENANCE";

// "FAILURE" dùng API riêng (/api/failure-categories, đã có từ trước) — các loại còn lại
// dùng chung API /api/categories?type=...
const TYPE_OPTIONS: { value: CategoryType; label: string }[] = [
  { value: "AREA", label: "Khu vực / Xưởng" },
  { value: "PRODUCTION_LINE", label: "Chuyền" },
  { value: "TEAM", label: "Tổ" },
  { value: "FAILURE", label: "Danh mục hư" },
  { value: "MAINTENANCE_PERIOD", label: "Bảo trì định kỳ" },
  { value: "MACHINE_STATUS", label: "Trạng thái máy" },
  { value: "MACHINE_TYPE", label: "Phân loại máy" },
];

const statusKindLabel: Record<StatusKind, string> = {
  ACTIVE: "Đang hoạt động",
  STOPPED: "Đang dừng",
  MAINTENANCE: "Đang bảo trì",
};

const STATUS_KINDS: StatusKind[] = ["ACTIVE", "STOPPED", "MAINTENANCE"];

type Category = {
  id: string;
  type: CategoryType;
  name: string;
  days: number | null;
  statusKind: StatusKind | null;
  colorHex: string | null;
  order: number;
  // Chỉ có ở FAILURE (bảng riêng)
  isOther?: boolean;
};

const emptyForm = {
  name: "",
  days: "",
  colorHex: "#1F5C3F",
  order: 0,
  isOther: false,
};

function apiBase(type: CategoryType) {
  return type === "FAILURE" ? "/api/failure-categories" : "/api/categories";
}

const VALID_TYPES = TYPE_OPTIONS.map((o) => o.value);

export default function CategoriesPage() {
  return (
    <Suspense>
      <CategoriesPageInner />
    </Suspense>
  );
}

function CategoriesPageInner() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const type: CategoryType =
    typeParam && (VALID_TYPES as string[]).includes(typeParam)
      ? (typeParam as CategoryType)
      : "AREA";
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const [defaultsError, setDefaultsError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => c.name.toLowerCase().includes(q));
  }, [items, search]);

  async function load() {
    setLoading(true);
    const url = type === "FAILURE" ? apiBase(type) : `${apiBase(type)}?type=${type}`;
    const res = await fetch(url);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    setSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, order: items.length });
    setError(null);
    setShowForm(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setForm({
      name: c.name,
      days: c.days != null ? String(c.days) : "",
      colorHex: c.colorHex || "#1F5C3F",
      order: c.order,
      isOther: c.isOther || false,
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const isFailure = type === "FAILURE";
    const body: Record<string, unknown> = isFailure
      ? { name: form.name, isOther: form.isOther, order: form.order }
      : {
          type,
          name: form.name,
          order: form.order,
          days: type === "MAINTENANCE_PERIOD" && form.days ? Number(form.days) : undefined,
          colorHex: type === "MACHINE_STATUS" ? form.colorHex : undefined,
        };

    const url = editing ? `${apiBase(type)}/${editing.id}` : apiBase(type);
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
    if (!confirm("Xoá mục này?")) return;
    const res = await fetch(`${apiBase(type)}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Không thể xoá");
      return;
    }
    await load();
  }

  async function handleSetSystemDefault(kind: StatusKind, categoryId: string) {
    setDefaultsError(null);
    const currentHolder = items.find((i) => i.statusKind === kind);
    if (!categoryId) {
      if (currentHolder) {
        const res = await fetch(`/api/categories/${currentHolder.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setSystemDefault: null }),
        });
        if (!res.ok) {
          const data = await res.json();
          setDefaultsError(data.error || "Không thể cập nhật");
          return;
        }
      }
      await load();
      return;
    }
    const res = await fetch(`/api/categories/${categoryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setSystemDefault: kind }),
    });
    if (!res.ok) {
      const data = await res.json();
      setDefaultsError(data.error || "Không thể cập nhật");
      return;
    }
    await load();
  }

  return (
    <div>
      <PageHeader title={`Danh mục — ${TYPE_OPTIONS.find((o) => o.value === type)?.label}`}>
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tên..." />
        <button
          onClick={openCreate}
          className="whitespace-nowrap rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          + Thêm mục
        </button>
      </PageHeader>

      {type === "MACHINE_STATUS" && (
        <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-slate-700">Mặc định hệ thống</h2>
          <p className="mb-3 text-xs text-slate-500">
            Danh sách trạng thái bên dưới hoàn toàn tự do (thêm/xoá/sửa tên thoải mái). Chọn ở
            đây mục nào đại diện cho từng nhóm gốc để mobile app tự đổi trạng thái máy khi báo sự
            cố / hoàn thành, và để tính KPI trên Tổng quan.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {STATUS_KINDS.map((kind) => {
              const holder = items.find((i) => i.statusKind === kind);
              return (
                <div key={kind}>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    {statusKindLabel[kind]}
                  </label>
                  <select
                    value={holder?.id || ""}
                    onChange={(e) => handleSetSystemDefault(kind, e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">-- Chưa gán --</option>
                    {items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
          {defaultsError && <p className="mt-3 text-sm text-red-600">{defaultsError}</p>}
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Thứ tự</th>
              <th className="px-4 py-3">Tên</th>
              {type === "MAINTENANCE_PERIOD" && <th className="px-4 py-3">Số ngày</th>}
              {type === "MACHINE_STATUS" && <th className="px-4 py-3">Vai trò hệ thống</th>}
              {type === "MACHINE_STATUS" && <th className="px-4 py-3">Màu</th>}
              {type === "FAILURE" && <th className="px-4 py-3">Cho phép nhập tự do (Khác)</th>}
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
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={6}>
                  {items.length === 0 ? "Chưa có mục nào" : "Không tìm thấy mục phù hợp"}
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => setViewing(c)}
                className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="px-4 py-3">{c.order}</td>
                <td className="px-4 py-3">{c.name}</td>
                {type === "MAINTENANCE_PERIOD" && (
                  <td className="px-4 py-3">{c.days != null ? `${c.days} ngày` : "-"}</td>
                )}
                {type === "MACHINE_STATUS" && (
                  <td className="px-4 py-3">
                    {c.statusKind ? (
                      <span className="rounded-full bg-brand-lighter px-2 py-0.5 text-xs font-medium text-brand-dark">
                        {statusKindLabel[c.statusKind]}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                )}
                {type === "MACHINE_STATUS" && (
                  <td className="px-4 py-3">
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-slate-200"
                      style={{ backgroundColor: c.colorHex || "#94A3B8" }}
                    />
                  </td>
                )}
                {type === "FAILURE" && <td className="px-4 py-3">{c.isOther ? "Có" : "-"}</td>}
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openEdit(c)} className="mr-3 text-slate-600 hover:underline">
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">
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
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              {editing ? "Sửa mục" : "Thêm mục"} — {TYPE_OPTIONS.find((o) => o.value === type)?.label}
            </h2>

            <label className="mb-1 block text-sm font-medium text-slate-700">
              {type === "MACHINE_STATUS" ? "Tên trạng thái" : "Tên"}
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />

            {type === "MAINTENANCE_PERIOD" && (
              <>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Số ngày định kỳ
                </label>
                <input
                  type="number"
                  value={form.days}
                  onChange={(e) => setForm({ ...form, days: e.target.value })}
                  placeholder="VD: 30"
                  className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </>
            )}

            {type === "MACHINE_STATUS" && (
              <>
                <label className="mb-1 block text-sm font-medium text-slate-700">Màu hiển thị</label>
                <input
                  type="color"
                  value={form.colorHex}
                  onChange={(e) => setForm({ ...form, colorHex: e.target.value })}
                  className="mb-3 h-10 w-full rounded-md border border-slate-300 px-1 py-1"
                />
                <p className="mb-3 text-xs text-slate-500">
                  Muốn đặt mục này làm mặc định hệ thống (Hoạt động/Dừng/Bảo trì)? Dùng phần
                  &quot;Mặc định hệ thống&quot; ở trên sau khi lưu.
                </p>
              </>
            )}

            {type === "FAILURE" && (
              <label className="mb-3 flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isOther}
                  onChange={(e) => setForm({ ...form, isOther: e.target.checked })}
                />
                Là mục &quot;Khác&quot; — bắt buộc nhập cụ thể khi chọn ở app mobile
              </label>
            )}

            <label className="mb-1 block text-sm font-medium text-slate-700">Thứ tự hiển thị</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />

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
          <DetailRow label="Thứ tự hiển thị" value={viewing.order} />
          {type === "MAINTENANCE_PERIOD" && (
            <DetailRow label="Số ngày định kỳ" value={viewing.days} />
          )}
          {type === "MACHINE_STATUS" && (
            <DetailRow
              label="Vai trò hệ thống"
              value={viewing.statusKind ? statusKindLabel[viewing.statusKind] : "Không (chỉ là nhãn hiển thị)"}
            />
          )}
          {type === "FAILURE" && (
            <DetailRow label="Cho phép nhập tự do (Khác)" value={viewing.isOther ? "Có" : "Không"} />
          )}
        </DetailModal>
      )}
    </div>
  );
}
