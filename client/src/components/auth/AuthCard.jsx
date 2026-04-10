export function AuthCard({ children }) {
  return (
    <section className="auth-surface w-full max-w-xl rounded-2xl border border-slate-200/80 p-6 shadow-[0_20px_40px_rgba(15,23,42,0.1)] sm:p-8">
      {children}
    </section>
  );
}
