export function TBSMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={{ height: size }}>
      <svg viewBox="0 0 320 120" className="h-full w-auto">
        {/* Dark Green TBS Text */}
        <text x="5" y="85" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="88" fill="#004724" letterSpacing="-3">
          TBS
        </text>
        <text x="180" y="105" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="28" fill="#004724" letterSpacing="1">
          GROUP
        </text>
        
        {/* 3 Green Slanted Pillars with Wave Curve */}
        <g transform="translate(178, 5) scale(0.72)">
          <path d="M15,95 L35,10 L60,10 L40,95 Z" fill="url(#tbs-green-grad)" />
          <path d="M45,95 L65,10 L90,10 L70,95 Z" fill="url(#tbs-green-grad)" />
          <path d="M75,95 L95,10 L120,10 L100,95 Z" fill="url(#tbs-green-grad)" />
          {/* White Wave Slash Line */}
          <path d="M5,55 C45,40 85,60 130,42" stroke="#ffffff" strokeWidth="7" fill="none" strokeLinecap="round" />
        </g>

        <defs>
          <linearGradient id="tbs-green-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8dc63f" />
            <stop offset="100%" stopColor="#41751d" />
          </linearGradient>
        </defs>
      </svg>
    </div>
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
    <div className="flex items-center space-x-2.5">
      <TBSMark size={size} />
      {subtitle && (
        <div className="pl-2 border-l border-emerald-300/60 leading-none">
          <div className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
            {subtitle}
          </div>
        </div>
      )}
    </div>
  );
}
