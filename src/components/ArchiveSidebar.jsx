export default function ArchiveSidebar({
  title,
  subtitle,
  query,
  setQuery,
  collections,
  activeId,
  setActiveId,
}) {
  const grouped = collections.reduce((acc, item) => {
    const key = item.year ? String(item.year) : "Undated";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <aside className="rounded-[28px] border border-stone-300 bg-white/85 p-4 shadow-sm backdrop-blur">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">{subtitle}</p>
      </div>

      <label className="mb-4 block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">
          Search
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search year, event, topic, page keyword..."
          className="w-full rounded-2xl border border-stone-300 px-3 py-2 outline-none transition focus:border-stone-500"
        />
      </label>

      <div className="max-h-[70vh] space-y-4 overflow-auto pr-1">
        {Object.keys(grouped).length ? (
          Object.entries(grouped)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([year, items]) => (
              <section key={year}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">
                  {year}
                </h2>
                <div className="space-y-2">
                  {items.map((item) => {
                    const active = item.id === activeId;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveId(item.id)}
                        className={[
                          "w-full rounded-2xl border p-3 text-left transition",
                          active
                            ? "border-stone-900 bg-stone-900 text-white"
                            : "border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50",
                        ].join(" ")}
                      >
                        <div className="text-sm font-medium">{item.title}</div>
                        {item.event ? (
                          <div className={active ? "mt-1 text-xs text-stone-300" : "mt-1 text-xs text-stone-500"}>
                            {item.event}
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-500">
            Nothing matched your search.
          </div>
        )}
      </div>
    </aside>
  );
}
