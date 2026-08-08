export function BrandMark({ size = 36, rounded = false }: { size?: number; rounded?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="TBS Group"
      className={rounded ? "rounded-lg" : undefined}
      style={{ height: size, width: "auto", objectFit: "contain" }}
    />
  );
}

export function BrandLogo({ size = 36, textClassName = "text-white" }: { size?: number; textClassName?: string }) {
  return (
    <div className="flex items-center gap-2">
      <BrandMark size={size} />
      <div className={`leading-tight ${textClassName}`}>
        <div className="text-sm font-bold tracking-wide">TBS GROUP</div>
        <div className="text-[10px] opacity-70">Quản trị Máy móc</div>
      </div>
    </div>
  );
}
