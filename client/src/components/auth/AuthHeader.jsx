export function AuthHeader({ title, description }) {
  return (
    <header className="space-y-2">
      <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">SSCMS</p>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </header>
  );
}
