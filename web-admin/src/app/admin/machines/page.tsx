"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { SearchInput } from "@/components/search-input";
import { DetailModal, DetailRow } from "@/components/detail-modal";

type CategoryRef = { id: string; name: string } | null;

type Machine = {
  id: string;
  code: string;
  serialNumber: string | null;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  area: CategoryRef;
  team: CategoryRef;
  productionLine: CategoryRef;
  machineType: CategoryRef;
  model: string | null;
  manufacturer: string | null;
  origin: string | null;
  manufactureYear: number | null;
  yearInUse: number | null;
  specs: string | null;
  status: { id: string; name: string };
  maintenancePeriod: { id: string; name: string } | null;
};

type CategoryOption = { id: string; name: string };

const emptyForm = {
  code: "",
  serialNumber: "",
  name: "",
  location: "",
  latitude: "",
  longitude: "",
  areaId: "",
  teamId: "",
  productionLineId: "",
  machineTypeId: "",
  model: "",
  manufacturer: "",
  origin: "",
  manufactureYear: "",
  yearInUse: "",
  specs: "",
  statusId: "",
  maintenancePeriodId: "",
};

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [areas, setAreas] = useState<CategoryOption[]>([]);
  const [teams, setTeams] = useState<CategoryOption[]>([]);
  const [lines, setLines] = useState<CategoryOption[]>([]);
  const [machineTypes, setMachineTypes] = useState<CategoryOption[]>([]);
  const [statuses, setStatuses] = useState<CategoryOption[]>([]);
  const [periods, setPeriods] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Machine | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [qrMachine, setQrMachine] = useState<Machine | null>(null);
  const [viewing, setViewing] = useState<Machine | null>(null);
  const [search, setSearch] = useState("");
  const [filterAreaId, setFilterAreaId] = useState("");
  const [filterStatusId, setFilterStatusId] = useState("");
  const [filterTeamId, setFilterTeamId] = useState("");
  const [filterLineId, setFilterLineId] = useState("");
  const [filterMachineTypeId, setFilterMachineTypeId] = useState("");

  const filteredMachines = useMemo(() => {
    const q = search.trim().toLowerCase();
    return machines.filter((m) => {
      const matchesSearch =
        !q ||
        m.code.toLowerCase().includes(q) ||
        (m.serialNumber || "").toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q) ||
        (m.area?.name || "").toLowerCase().includes(q) ||
        (m.team?.name || "").toLowerCase().includes(q) ||
        (m.productionLine?.name || "").toLowerCase().includes(q);
      const matchesArea = !filterAreaId || m.area?.id === filterAreaId;
      const matchesStatus = !filterStatusId || m.status.id === filterStatusId;
      const matchesTeam = !filterTeamId || m.team?.id === filterTeamId;
      const matchesLine = !filterLineId || m.productionLine?.id === filterLineId;
      const matchesMachineType = !filterMachineTypeId || m.machineType?.id === filterMachineTypeId;
      return (
        matchesSearch && matchesArea && matchesStatus && matchesTeam && matchesLine && matchesMachineType
      );
    });
  }, [machines, search, filterAreaId, filterStatusId, filterTeamId, filterLineId, filterMachineTypeId]);

  async function load() {
    setLoading(true);
    const [machinesRes, areasRes, teamsRes, linesRes, machineTypesRes, statusesRes, periodsRes] =
      await Promise.all([
        fetch("/api/machines"),
        fetch("/api/categories?type=AREA"),
        fetch("/api/categories?type=TEAM"),
        fetch("/api/categories?type=PRODUCTION_LINE"),
        fetch("/api/categories?type=MACHINE_TYPE"),
        fetch("/api/categories?type=MACHINE_STATUS"),
        fetch("/api/categories?type=MAINTENANCE_PERIOD"),
      ]);
    setMachines(await machinesRes.json());
    setAreas(await areasRes.json());
    setTeams(await teamsRes.json());
    setLines(await linesRes.json());
    setMachineTypes(await machineTypesRes.json());
    setStatuses(await statusesRes.json());
    setPeriods(await periodsRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, statusId: statuses[0]?.id || "" });
    setError(null);
    setShowForm(true);
  }

  function openEdit(m: Machine) {
    setEditing(m);
    setForm({
      code: m.code,
      serialNumber: m.serialNumber || "",
      name: m.name,
      location: m.location,
      latitude: m.latitude != null ? String(m.latitude) : "",
      longitude: m.longitude != null ? String(m.longitude) : "",
      areaId: m.area?.id || "",
      teamId: m.team?.id || "",
      productionLineId: m.productionLine?.id || "",
      machineTypeId: m.machineType?.id || "",
      model: m.model || "",
      manufacturer: m.manufacturer || "",
      origin: m.origin || "",
      manufactureYear: m.manufactureYear ? String(m.manufactureYear) : "",
      yearInUse: m.yearInUse ? String(m.yearInUse) : "",
      specs: m.specs || "",
      statusId: m.status.id,
      maintenancePeriodId: m.maintenancePeriod?.id || "",
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const url = editing ? `/api/machines/${editing.id}` : "/api/machines";
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

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ định vị GPS");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: String(pos.coords.latitude),
          longitude: String(pos.coords.longitude),
        }));
      },
      () => setError("Không thể lấy vị trí hiện tại — vui lòng cho phép quyền truy cập vị trí"),
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("Xoá máy này? Hành động không thể hoàn tác.")) return;
    await fetch(`/api/machines/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <PageHeader title="Máy móc">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo mã tài sản, tên máy, tổ, chuyền..."
        />
        <button
          onClick={openCreate}
          className="whitespace-nowrap rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          + Thêm máy
        </button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={filterAreaId}
          onChange={(e) => setFilterAreaId(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          <option value="">Tất cả khu vực / xưởng</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select
          value={filterStatusId}
          onChange={(e) => setFilterStatusId(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={filterTeamId}
          onChange={(e) => setFilterTeamId(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          <option value="">Tất cả tổ</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          value={filterLineId}
          onChange={(e) => setFilterLineId(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          <option value="">Tất cả chuyền</option>
          {lines.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <select
          value={filterMachineTypeId}
          onChange={(e) => setFilterMachineTypeId(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          <option value="">Tất cả phân loại máy</option>
          {machineTypes.map((mt) => (
            <option key={mt.id} value={mt.id}>
              {mt.name}
            </option>
          ))}
        </select>
        {(filterAreaId || filterStatusId || filterTeamId || filterLineId || filterMachineTypeId) && (
          <button
            onClick={() => {
              setFilterAreaId("");
              setFilterStatusId("");
              setFilterTeamId("");
              setFilterLineId("");
              setFilterMachineTypeId("");
            }}
            className="text-sm text-slate-500 hover:underline"
          >
            Xoá bộ lọc
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Mã tài sản</th>
              <th className="px-4 py-3">Tên máy</th>
              <th className="px-4 py-3">Khu vực / Xưởng</th>
              <th className="px-4 py-3">Tổ</th>
              <th className="px-4 py-3">Chuyền</th>
              <th className="px-4 py-3">Phân loại máy</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={8}>
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && filteredMachines.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={8}>
                  {machines.length === 0 ? "Chưa có máy móc nào" : "Không tìm thấy máy phù hợp"}
                </td>
              </tr>
            )}
            {filteredMachines.map((m) => (
              <tr
                key={m.id}
                onClick={() => setViewing(m)}
                className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="px-4 py-3 font-mono">{m.code}</td>
                <td className="px-4 py-3">{m.name}</td>
                <td className="px-4 py-3">{m.area?.name || "-"}</td>
                <td className="px-4 py-3">{m.team?.name || "-"}</td>
                <td className="px-4 py-3">{m.productionLine?.name || "-"}</td>
                <td className="px-4 py-3">{m.machineType?.name || "-"}</td>
                <td className="px-4 py-3">{m.status.name}</td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setQrMachine(m)}
                    className="mr-3 text-brand hover:underline"
                  >
                    Mã QR
                  </button>
                  <button
                    onClick={() => openEdit(m)}
                    className="mr-3 text-slate-600 hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
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
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-lg"
          >
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              {editing ? "Sửa máy móc" : "Thêm máy móc"}
            </h2>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Mã tài sản</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Số seri</label>
                <input
                  value={form.serialNumber}
                  onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <label className="mb-1 block text-sm font-medium text-slate-700">Tên máy</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />

            <label className="mb-1 block text-sm font-medium text-slate-700">Khu vực / Xưởng</label>
            <select
              value={form.areaId}
              onChange={(e) => setForm({ ...form, areaId: e.target.value })}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">-- Chưa chọn --</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tổ</label>
                <select
                  value={form.teamId}
                  onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">-- Chưa chọn --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Chuyền</label>
                <select
                  value={form.productionLineId}
                  onChange={(e) => setForm({ ...form, productionLineId: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">-- Chưa chọn --</option>
                  {lines.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="mb-1 block text-sm font-medium text-slate-700">Phân loại máy</label>
            <select
              value={form.machineTypeId}
              onChange={(e) => setForm({ ...form, machineTypeId: e.target.value })}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">-- Chưa chọn --</option>
              {machineTypes.map((mt) => (
                <option key={mt.id} value={mt.id}>
                  {mt.name}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-sm font-medium text-slate-700">Vị trí chi tiết</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="VD: Khu vực 1, dãy 3"
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />

            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Tọa độ GPS</label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-xs font-medium text-brand hover:underline"
              >
                📍 Lấy vị trí hiện tại
              </button>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                placeholder="Vĩ độ (VD: 10.762622)"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                placeholder="Kinh độ (VD: 106.660172)"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Model</label>
                <input
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Hãng sản xuất</label>
                <input
                  value={form.manufacturer}
                  onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Xuất xứ</label>
                <input
                  value={form.origin}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Năm sản xuất</label>
                <input
                  type="number"
                  value={form.manufactureYear}
                  onChange={(e) => setForm({ ...form, manufactureYear: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <label className="mb-1 block text-sm font-medium text-slate-700">
              Năm đưa vào sử dụng
            </label>
            <input
              type="number"
              value={form.yearInUse}
              onChange={(e) => setForm({ ...form, yearInUse: e.target.value })}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />

            <label className="mb-1 block text-sm font-medium text-slate-700">Thông số</label>
            <textarea
              value={form.specs}
              onChange={(e) => setForm({ ...form, specs: e.target.value })}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={2}
            />

            <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
            <select
              value={form.statusId}
              onChange={(e) => setForm({ ...form, statusId: e.target.value })}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            >
              <option value="">-- Chọn trạng thái --</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-sm font-medium text-slate-700">
              Bảo trì định kỳ
            </label>
            <select
              value={form.maintenancePeriodId}
              onChange={(e) => setForm({ ...form, maintenancePeriodId: e.target.value })}
              className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Không thiết lập</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

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

      {qrMachine && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-xs rounded-xl bg-white p-6 text-center shadow-lg">
            <h2 className="mb-1 text-lg font-semibold text-slate-800">{qrMachine.name}</h2>
            <p className="mb-4 text-sm text-slate-500">{qrMachine.code}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/machines/${qrMachine.id}/qrcode`}
              alt={`QR code ${qrMachine.code}`}
              className="mx-auto mb-4 h-56 w-56"
            />
            <div className="flex justify-center gap-2">
              <a
                href={`/api/machines/${qrMachine.id}/qrcode`}
                download={`qr-${qrMachine.code}.png`}
                className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Tải xuống
              </a>
              <button
                onClick={() => setQrMachine(null)}
                className="rounded-md px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {viewing && (
        <DetailModal
          title={viewing.name}
          subtitle={viewing.code}
          onClose={() => setViewing(null)}
          footer={
            <>
              <button
                onClick={() => {
                  setViewing(null);
                  setQrMachine(viewing);
                }}
                className="rounded-md px-4 py-2 text-sm text-brand hover:bg-brand-lighter"
              >
                Mã QR
              </button>
              <button
                onClick={() => {
                  setViewing(null);
                  openEdit(viewing);
                }}
                className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Sửa
              </button>
            </>
          }
        >
          <DetailRow label="Số seri" value={viewing.serialNumber} />
          <DetailRow label="Khu vực / Xưởng" value={viewing.area?.name} />
          <DetailRow label="Tổ" value={viewing.team?.name} />
          <DetailRow label="Chuyền" value={viewing.productionLine?.name} />
          <DetailRow label="Phân loại máy" value={viewing.machineType?.name} />
          <DetailRow label="Vị trí chi tiết" value={viewing.location} />
          {viewing.latitude != null && viewing.longitude != null && (
            <DetailRow
              label="Tọa độ GPS"
              value={
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${viewing.latitude},${viewing.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  {viewing.latitude.toFixed(6)}, {viewing.longitude.toFixed(6)} — Xem đường đi
                </a>
              }
            />
          )}
          <DetailRow label="Model" value={viewing.model} />
          <DetailRow label="Hãng sản xuất" value={viewing.manufacturer} />
          <DetailRow label="Xuất xứ" value={viewing.origin} />
          <DetailRow label="Năm sản xuất" value={viewing.manufactureYear} />
          <DetailRow label="Năm đưa vào sử dụng" value={viewing.yearInUse} />
          <DetailRow label="Thông số" value={viewing.specs} />
          <DetailRow label="Trạng thái" value={viewing.status.name} />
          <DetailRow label="Bảo trì định kỳ" value={viewing.maintenancePeriod?.name} />
        </DetailModal>
      )}
    </div>
  );
}
