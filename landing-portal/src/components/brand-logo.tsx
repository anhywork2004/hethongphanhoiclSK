export function TBSMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md shadow-emerald-950/40 border border-emerald-100/30 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full fill-[#1b5238]">
        <path d="M20,50 Q40,20 80,30 Q60,80 20,50 Z" />
        <path d="M30,65 Q50,35 85,45" stroke="#8dc63f" strokeWidth="7" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

export function BrandMark({ size = 36, rounded = true }: { size?: number; rounded?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="TBS Group"
      className={rounded ? "rounded-xl shadow-md" : undefined}
      style={{ height: size, width: "auto", objectFit: "contain" }}
    />
  );
}

export function BrandLogo({
  size = 38,
  textClassName = "text-white",
  subtitle = "SKECHERS KG1",
}: {
  size?: number;
  textClassName?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center space-x-3">
      <TBSMark size={size} />
      <div className={`leading-none ${textClassName}`}>
        <div className="text-sm font-black tracking-wider text-white">TBS GROUP</div>
        <div className="text-[10px] font-extrabold text-[#8dc63f] tracking-widest uppercase mt-1">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
