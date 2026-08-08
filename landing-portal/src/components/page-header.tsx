export function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}
