"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { SearchInput } from "@/components/search-input";
import { DetailModal, DetailRow } from "@/components/detail-modal";

const statusLabel: Record<string, string> = {
  PENDING: "Chờ xử lý",
  ACCEPTED: "Đang xử lý",
  DONE: "Đã hoàn thành",
};

function formatDateTime(date: Date | string | null) {
  if (!date) return null;
  return new Date(date).toLocaleString("vi-VN");
}

function parseImages(images: string | null): string[] {
  if (!images) return [];
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export type IncidentRow = {
  id: string;
  description: string;
  status: string;
  images: string | null;
  customCategoryText: string | null;
  createdAt: Date | string;
  acceptedAt: Date | string | null;
  completedAt: Date | string | null;
  machine: { name: string; code: string; location: string };
  reporter: { name: string; employeeCode: string };
  assignedTo: { name: string; employeeCode: string } | null;
  category: { name: string; isOther: boolean } | null;
  maintenanceLogs: {
    durationMinutes: number;
    repairDetail: string;
    partsReplaced: string | null;
    skillRating: number | null;
    technician: { name: string };
  }[];
};

export default function IncidentsTable({ incidents }: { incidents: IncidentRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [viewing, setViewing] = useState<IncidentRow | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return incidents.filter((i) => {
      const matchesSearch =
        !q ||
        i.machine.name.toLowerCase().includes(q) ||
        i.machine.code.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.reporter.name.toLowerCase().includes(q) ||
        (i.assignedTo?.name || "").toLowerCase().includes(q) ||
        (statusLabel[i.status] || i.status).toLowerCase().includes(q);
      const matchesStatus = statusFilter === "ALL" || i.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [incidents, search, statusFilter]);

  const categoryLabel = (i: IncidentRow) =>
    i.category ? (i.category.isOther ? i.customCategoryText || "Khác" : i.category.name) : "-";

  return (
    <div>
      <PageHeader title="Sự cố">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo máy, người báo, mô tả..."
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="ACCEPTED">Đang xử lý</option>
          <option value="DONE">Đã hoàn thành</option>
        </select>
      </PageHeader>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Máy</th>
              <th className="px-4 py-3">Người báo</th>
              <th className="px-4 py-3">Mô tả</th>
              <th className="px-4 py-3">Người nhận</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thời gian sửa (phút)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={6}>
                  {incidents.length === 0 ? "Chưa có sự cố nào" : "Không tìm thấy sự cố phù hợp"}
                </td>
              </tr>
            )}
            {filtered.map((i) => (
              <tr
                key={i.id}
                onClick={() => setViewing(i)}
                className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  {i.machine.name} <span className="text-slate-400">({i.machine.code})</span>
                </td>
                <td className="px-4 py-3">{i.reporter.name}</td>
                <td className="px-4 py-3 max-w-xs truncate">{i.description}</td>
                <td className="px-4 py-3">{i.assignedTo?.name || "-"}</td>
                <td className="px-4 py-3">{statusLabel[i.status]}</td>
                <td className="px-4 py-3">{i.maintenanceLogs[0]?.durationMinutes ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewing && (
        <DetailModal
          title={`${viewing.machine.name} (${viewing.machine.code})`}
          subtitle={statusLabel[viewing.status]}
          onClose={() => setViewing(null)}
        >
          <DetailRow label="Vị trí máy" value={viewing.machine.location} />
          <DetailRow
            label="Người báo"
            value={`${viewing.reporter.name} (${viewing.reporter.employeeCode})`}
          />
          <DetailRow label="Danh mục hư" value={categoryLabel(viewing)} />
          <DetailRow label="Mô tả" value={viewing.description} />
          {parseImages(viewing.images).length > 0 && (
            <div className="py-2.5">
              <span className="mb-2 block text-sm text-slate-400">Hình ảnh</span>
              <div className="flex flex-wrap gap-2">
                {parseImages(viewing.images).map((img, idx) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={idx}
                    src={img}
                    alt=""
                    className="h-20 w-20 rounded-md object-cover"
                  />
                ))}
              </div>
            </div>
          )}
          <DetailRow
            label="Người nhận"
            value={
              viewing.assignedTo
                ? `${viewing.assignedTo.name} (${viewing.assignedTo.employeeCode})`
                : "Chưa có"
            }
          />
          <DetailRow label="Thời gian báo lỗi" value={formatDateTime(viewing.createdAt)} />
          <DetailRow label="Thời gian nhận việc" value={formatDateTime(viewing.acceptedAt)} />
          <DetailRow label="Thời gian hoàn thành" value={formatDateTime(viewing.completedAt)} />
          {viewing.maintenanceLogs[0] && (
            <>
              <DetailRow
                label="Thời gian sửa"
                value={`${viewing.maintenanceLogs[0].durationMinutes} phút`}
              />
              <DetailRow label="Đã sửa" value={viewing.maintenanceLogs[0].repairDetail} />
              <DetailRow
                label="Linh kiện thay thế"
                value={viewing.maintenanceLogs[0].partsReplaced}
              />
              <DetailRow
                label="Đánh giá tay nghề"
                value={
                  viewing.maintenanceLogs[0].skillRating
                    ? `${viewing.maintenanceLogs[0].skillRating}/5 ⭐`
                    : "Chưa đánh giá"
                }
              />
            </>
          )}
        </DetailModal>
      )}
    </div>
  );
}
