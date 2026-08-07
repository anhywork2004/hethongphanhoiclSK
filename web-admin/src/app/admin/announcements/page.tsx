"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { SearchInput } from "@/components/search-input";
import { DetailModal, DetailRow } from "@/components/detail-modal";

type Announcement = {
  id: string;
  title: string;
  content: string;
  image: string | null;
  createdAt: string;
  createdBy: { name: string };
};

const emptyForm = { title: "", content: "", image: "" as string | null };

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState<Announcement | null>(null);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAnnouncements = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return announcements;
    return announcements.filter(
      (a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q),
    );
  }, [announcements, search]);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/announcements");
    const data = await res.json();
    setAnnouncements(data);
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

  function openEdit(a: Announcement) {
    setEditing(a);
    setForm({ title: a.title, content: a.content, image: a.image });
    setError(null);
    setShowForm(true);
  }

  function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const base64 = await readFileAsBase64(file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mimeType: file.type }),
      });
      if (!res.ok) throw new Error("Tải ảnh thất bại");
      const data = await res.json();
      setForm((f) => ({ ...f, image: data.url }));
    } catch {
      setError("Không thể tải ảnh lên");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const url = editing ? `/api/announcements/${editing.id}` : "/api/announcements";
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
    if (!confirm("Xoá thông báo này?")) return;
    await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <PageHeader title="Thông báo">
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tiêu đề, nội dung..." />
        <button
          onClick={openCreate}
          className="whitespace-nowrap rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          + Đăng thông báo
        </button>
      </PageHeader>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Nội dung</th>
              <th className="px-4 py-3">Người đăng</th>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={5}>
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && filteredAnnouncements.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={5}>
                  {announcements.length === 0
                    ? "Chưa có thông báo nào"
                    : "Không tìm thấy thông báo phù hợp"}
                </td>
              </tr>
            )}
            {filteredAnnouncements.map((a) => (
              <tr
                key={a.id}
                onClick={() => setViewing(a)}
                className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="px-4 py-3 font-medium text-slate-800">{a.title}</td>
                <td className="px-4 py-3 max-w-xs truncate text-slate-500">{a.content}</td>
                <td className="px-4 py-3">{a.createdBy.name}</td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(a.createdAt).toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openEdit(a)} className="mr-3 text-slate-600 hover:underline">
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:underline">
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
              {editing ? "Sửa thông báo" : "Đăng thông báo mới"}
            </h2>

            <label className="mb-1 block text-sm font-medium text-slate-700">Tiêu đề</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />

            <label className="mb-1 block text-sm font-medium text-slate-700">Nội dung</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={5}
              required
            />

            <label className="mb-1 block text-sm font-medium text-slate-700">Hình ảnh (tuỳ chọn)</label>
            <div className="mb-3">
              {form.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.image}
                  alt="Xem trước"
                  className="mb-2 max-h-40 w-full rounded-md object-cover"
                />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              {uploading && <p className="mt-1 text-xs text-slate-400">Đang tải ảnh...</p>}
              {form.image && !uploading && (
                <button
                  type="button"
                  onClick={() => {
                    setForm((f) => ({ ...f, image: "" }));
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="mt-1 text-xs text-red-600 hover:underline"
                >
                  Xoá ảnh
                </button>
              )}
            </div>

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
                disabled={uploading}
                className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}

      {viewing && (
        <DetailModal
          title={viewing.title}
          subtitle={`${viewing.createdBy.name} · ${new Date(viewing.createdAt).toLocaleString("vi-VN")}`}
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
          {viewing.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={viewing.image}
              alt={viewing.title}
              className="mb-3 max-h-64 w-full rounded-md object-cover"
            />
          )}
          <DetailRow label="Nội dung" value={<span className="whitespace-pre-wrap">{viewing.content}</span>} />
        </DetailModal>
      )}
    </div>
  );
}
