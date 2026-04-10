import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const PasswordInput = forwardRef(function PasswordInput(
  { label, error, required, hasError = false, className = "", id, name, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const fieldId = id || name;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={fieldId} className="text-sm font-semibold text-slate-700">
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>
      ) : null}
      <div className="relative">
        <input
          ref={ref}
          id={fieldId}
          name={name}
          type={visible ? "text" : "password"}
          className={`min-h-11 w-full rounded-xl border bg-white px-3.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 ${
            hasError
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : "border-slate-300 focus:border-sky-500 focus:ring-sky-200"
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-500 transition hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
});
