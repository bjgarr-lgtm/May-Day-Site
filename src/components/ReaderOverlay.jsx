import { useEffect, useMemo, useState } from "react";

export default function ReaderOverlay({
  open,
  onClose,
  collection,
  initialIndex = 0,
}) {
  const pages = useMemo(() => collection?.pages || [], [collection]);
  const [pageIndex, setPageIndex] = useState(initialIndex);

  useEffect(() => {
    setPageIndex(initialIndex);
  }, [initialIndex, collection?.id]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") {
        setPageIndex((value) => Math.max(0, value - 1));
      }
      if (event.key === "ArrowRight") {
        setPageIndex((value) => Math.min(pages.length - 1, value + 1));
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, pages.length]);

  if (!open || !collection || !pages.length) return null;

  const page = pages[pageIndex];
  const start = Math.max(0, pageIndex - 2);
  const end = Math.min(pages.length, pageIndex + 3);
  const visiblePages = pages.slice(start, end);

  return (
    <div className="fixed inset-0 z-[70] bg-black/95 text-white">
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 bg-black/70 px-4 py-3 backdrop-blur">
          <div className="min-w-0 pr-2">
            <div className="text-[11px] uppercase tracking-[0.18em] text-stone-300">
              Full reader
            </div>
            <div className="truncate text-2xl font-semibold leading-tight">
              {collection.title}
            </div>
            <div className="mt-1 text-sm text-stone-300">
              Page {pageIndex + 1} of {pages.length}
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => setPageIndex((value) => Math.max(0, value - 1))}
              disabled={pageIndex === 0}
              className="rounded-2xl border border-white/20 px-4 py-2 text-sm disabled:opacity-30"
            >
              Prev
            </button>
            <button
              onClick={() =>
                setPageIndex((value) => Math.min(pages.length - 1, value + 1))
              }
              disabled={pageIndex === pages.length - 1}
              className="rounded-2xl border border-white/20 px-4 py-2 text-sm disabled:opacity-30"
            >
              Next
            </button>
            <button
              onClick={onClose}
              className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-stone-900"
            >
              Close
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-[#050505]">
          <div className="flex min-h-full items-start justify-center p-2 md:p-3">
            <img
              src={page.src}
              alt={page.title || `Page ${pageIndex + 1}`}
              className="block h-auto max-h-[calc(100vh-88px)] w-auto max-w-full bg-white shadow-2xl"
            />
          </div>
        </div>

        <div className="shrink-0 border-t border-white/10 bg-black/80 px-3 py-2 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-center gap-2">
            <button
              onClick={() => setPageIndex((value) => Math.max(0, value - 1))}
              disabled={pageIndex === 0}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/80 disabled:opacity-30"
            >
              Prev
            </button>

            {start > 0 ? (
              <button
                onClick={() => setPageIndex(0)}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                title="Page 1"
              >
                1
              </button>
            ) : null}

            {start > 1 ? <span className="px-1 text-xs text-white/40">…</span> : null}

            {visiblePages.map((item, offset) => {
              const index = start + offset;
              const active = index === pageIndex;
              return (
                <button
                  key={`${item.src}-${index}`}
                  onClick={() => setPageIndex(index)}
                  className={[
                    "min-w-10 rounded-xl border px-3 py-2 text-xs transition",
                    active
                      ? "border-white/40 bg-white text-stone-900"
                      : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10",
                  ].join(" ")}
                  aria-label={`Go to page ${index + 1}`}
                  title={`Page ${index + 1}`}
                >
                  {index + 1}
                </button>
              );
            })}

            {end < pages.length - 1 ? <span className="px-1 text-xs text-white/40">…</span> : null}

            {end < pages.length ? (
              <button
                onClick={() => setPageIndex(pages.length - 1)}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                title={`Page ${pages.length}`}
              >
                {pages.length}
              </button>
            ) : null}

            <button
              onClick={() =>
                setPageIndex((value) => Math.min(pages.length - 1, value + 1))
              }
              disabled={pageIndex === pages.length - 1}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/80 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
