export function FormField({ label, htmlFor, error, hint, required, children }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-slate-500">{hint}</p> : null}
      {error ? <p role="alert" className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

