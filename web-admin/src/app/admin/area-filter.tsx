"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function AreaFilter({ areas }: { areas: { id: string; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("areaId") || "";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("areaId", value);
    } else {
      params.delete("areaId");
    }
    const qs = params.toString();
    router.push(qs ? `/admin?${qs}` : "/admin");
  }

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
    >
      <option value="">Tất cả khu vực / xưởng</option>
      {areas.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </select>
  );
}
