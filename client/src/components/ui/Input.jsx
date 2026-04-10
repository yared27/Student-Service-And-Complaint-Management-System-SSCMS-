import { forwardRef } from "react";

export const Input = forwardRef(function Input(
  { label, error, required, hasError = false, className = "", id, name, ...props },
  ref,
) {
  const fieldId = id || name;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={fieldId} className="text-sm font-semibold text-slate-700">
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>
      ) : null}
      <input
        ref={ref}
        id={fieldId}
        name={name}
        className={`min-h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 ${
          hasError
            ? "border-red-400 focus:border-red-500 focus:ring-red-200"
            : "border-slate-300 focus:border-sky-500 focus:ring-sky-200"
        } ${className}`}
        {...props}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
});
