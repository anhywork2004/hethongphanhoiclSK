/* eslint-disable @next/next/no-img-element */

export function TBSMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="TBS Group Logo"
      className={`object-contain h-auto shrink-0 ${className}`}
      style={{ height: size, maxWidth: "100%" }}
    />
  );
}

export function BrandMark({ size = 36 }: { size?: number }) {
  return <TBSMark size={size} />;
}

export function BrandLogo({
  size = 36,
  subtitle = "KIÊN GIANG 1",
}: {
  size?: number;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center space-x-2">
      <TBSMark size={size} />
      {subtitle && (
        <div className="pl-2 border-l border-emerald-300/80 leading-none">
          <div className="text-[10px] font-black text-[#004724] uppercase tracking-widest">
            {subtitle}
          </div>
        </div>
      )}
    </div>
  );
}
