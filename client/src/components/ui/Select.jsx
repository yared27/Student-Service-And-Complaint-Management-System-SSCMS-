export function Select({ label, error, options = [], className = "", id, ...props }) {
  const selectId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={selectId} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={`min-h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
            : "border-slate-300 focus:border-sky-500 focus:ring-sky-200"
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
