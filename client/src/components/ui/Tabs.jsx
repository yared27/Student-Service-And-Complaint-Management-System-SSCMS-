export function Tabs({ items, value, onChange }) {
  return (
    <div className="grid grid-cols-3 rounded-xl border border-slate-200 bg-slate-100 p-1">
      {items.map((item) => {
        const active = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
