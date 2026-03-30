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
    <div className="fixed inset-0 z-[70] bg-black/90 p-3 md:p-5">
      <div className="mx-auto flex h-full max-w-[1800px] flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-white">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-stone-300">
              Full reader
            </div>
            <div className="text-2xl font-semibold">{collection.title}</div>
            <div className="mt-1 text-sm text-stone-300">
              Page {pageIndex + 1} of {pages.length}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPageIndex((value) => Math.max(0, value - 1))}
              disabled={pageIndex === 0}
              className="rounded-2xl border border-white/20 px-4 py-2 text-sm disabled:opacity-30"
            >
              Prev
            </button>
            <button
              onClick={() => setPageIndex((value) => Math.min(pages.length - 1, value + 1))}
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

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-h-0 overflow-auto rounded-[28px] bg-stone-950 p-4">
            <img
              src={page.src}
              alt={page.title || `Page ${pageIndex + 1}`}
              className="mx-auto max-h-none w-auto max-w-full"
            />
          </div>

          <div className="min-h-0 overflow-auto rounded-[28px] bg-white p-4">
            <h3 className="text-lg font-semibold">{page.title || `Page ${pageIndex + 1}`}</h3>
            {page.summary ? (
              <p className="mt-3 text-sm leading-6 text-stone-700">{page.summary}</p>
            ) : (
              <p className="mt-3 text-sm leading-6 text-stone-500">
                No page summary yet. Add one in your archive data when you want this to be more useful than raw survival by zooming.
              </p>
            )}

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

            <div className="mt-6 space-y-2">
              {pages.map((item, index) => (
                <button
                  key={`${item.src}-${index}`}
                  onClick={() => setPageIndex(index)}
                  className={[
                    "w-full rounded-2xl border p-2 text-left transition",
                    index === pageIndex
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 hover:border-stone-400 hover:bg-stone-50",
                  ].join(" ")}
                >
                  <div className="text-sm font-medium">Page {index + 1}</div>
                  {item.title ? (
                    <div className={index === pageIndex ? "mt-1 text-xs text-stone-300" : "mt-1 text-xs text-stone-500"}>
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
  );
}
