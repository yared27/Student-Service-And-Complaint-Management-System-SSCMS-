export function Alert({ variant = "info", title, children }) {
  const styles = {
    info: "border-sky-200 bg-sky-50 text-sky-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
  };

  return (
    <div className={`rounded-xl border px-3.5 py-3 text-sm ${styles[variant]}`} role="status" aria-live="polite">
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <p className={title ? "mt-1" : ""}>{children}</p> : null}
    </div>
  );
}
