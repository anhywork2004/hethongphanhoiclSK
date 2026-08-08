"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { SearchInput } from "@/components/search-input";
import { DetailModal, DetailRow } from "@/components/detail-modal";

type FailureCategory = {
  id: string;
  name: string;
  isOther: boolean;
  order: number;
};

const emptyForm = { name: "", isOther: false, order: 0 };

export default function FailureCategoriesPage() {
  const [categories, setCategories] = useState<FailureCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FailureCategory | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<FailureCategory | null>(null);
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/failure-categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, order: categories.length + 1 });
    setError(null);
    setShowForm(true);
  }

  function openEdit(c: FailureCategory) {
    setEditing(c);
    setForm({ name: c.name, isOther: c.isOther, order: c.order });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const url = editing ? `/api/failure-categories/${editing.id}` : "/api/failure-categories";
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
    if (!confirm("Xoá danh mục này?")) return;
    const res = await fetch(`/api/failure-categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Không thể xoá");
      return;
    }
    await load();
  }

  return (
    <div>
      <PageHeader title="Danh mục hư">
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tên danh mục..." />
        <button
          onClick={openCreate}
          className="whitespace-nowrap rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          + Thêm danh mục
        </button>
      </PageHeader>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Thứ tự</th>
              <th className="px-4 py-3">Tên danh mục</th>
              <th className="px-4 py-3">Cho phép nhập tự do (Khác)</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={4}>
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && filteredCategories.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={4}>
                  {categories.length === 0 ? "Chưa có danh mục nào" : "Không tìm thấy danh mục phù hợp"}
                </td>
              </tr>
            )}
            {filteredCategories.map((c) => (
              <tr
                key={c.id}
                onClick={() => setViewing(c)}
                className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="px-4 py-3">{c.order}</td>
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.isOther ? "Có" : "-"}</td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEdit(c)}
                    className="mr-3 text-slate-600 hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
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
              {editing ? "Sửa danh mục" : "Thêm danh mục hư"}
            </h2>

            <label className="mb-1 block text-sm font-medium text-slate-700">Tên danh mục</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />

            <label className="mb-1 block text-sm font-medium text-slate-700">Thứ tự hiển thị</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />

            <label className="mb-3 flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isOther}
                onChange={(e) => setForm({ ...form, isOther: e.target.checked })}
              />
              Là mục &quot;Khác&quot; — bắt buộc nhập danh mục cụ thể khi chọn ở app mobile
            </label>

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
          <DetailRow label="Cho phép nhập tự do (Khác)" value={viewing.isOther ? "Có" : "Không"} />
        </DetailModal>
      )}
    </div>
  );
}
