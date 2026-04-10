export function Badge({ children, variant = "neutral" }) {
  const styles = {
    neutral: "bg-slate-100 text-slate-700",
    warning: "bg-amber-100 text-amber-800",
    success: "bg-emerald-100 text-emerald-800",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[variant]}`}>{children}</span>
  );
}
