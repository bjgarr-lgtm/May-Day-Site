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

  return (
    <div className="fixed inset-0 z-[70] bg-black/95 text-white">
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 bg-black/60 px-4 py-3 backdrop-blur">
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

        <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-h-0 overflow-auto bg-[#0b0b0b]">
            <div className="flex min-h-full items-start justify-center p-4 md:p-6">
              <img
                src={page.src}
                alt={page.title || `Page ${pageIndex + 1}`}
                className="block h-auto max-h-[calc(100vh-120px)] w-auto max-w-full rounded-xl bg-white shadow-2xl"
              />
            </div>
          </div>

          <div className="min-h-0 overflow-auto border-t border-white/10 bg-white text-stone-900 xl:border-l xl:border-t-0">
            <div className="p-4 md:p-5">
              <h3 className="text-xl font-semibold leading-tight">
                {page.title || `Page ${pageIndex + 1}`}
              </h3>

              <p className="mt-3 text-sm leading-6 text-stone-600">
                {page.summary
                  ? page.summary
                  : "No page summary yet. Add one later when you want this to be more than a beautifully organized pile of evidence."}
              </p>

              {(page.keywords || []).length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {page.keywords.map((word) => (
                    <span
                      key={word}
                      className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="border-t border-stone-200 p-3 md:p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                Pages
              </div>

              <div className="space-y-2">
                {pages.map((item, index) => (
                  <button
                    key={`${item.src}-${index}`}
                    onClick={() => setPageIndex(index)}
                    className={[
                      "w-full rounded-2xl border p-3 text-left transition",
                      index === pageIndex
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50",
                    ].join(" ")}
                  >
                    <div className="text-sm font-medium">Page {index + 1}</div>
                    {item.title ? (
                      <div
                        className={
                          index === pageIndex
                            ? "mt-1 text-xs text-stone-300"
                            : "mt-1 text-xs text-stone-500"
                        }
                      >
                        {item.title}
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
