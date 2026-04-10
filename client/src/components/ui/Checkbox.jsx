export function Checkbox({ label, className = "", ...props }) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600 ${className}`}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-400"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
