const variantClasses = {
  primary: "bg-sky-700 text-white hover:bg-sky-600 active:bg-sky-800",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
};

export function Button({ children, className = "", variant = "primary", isLoading = false, disabled, ...props }) {
  return (
    <button
      className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
