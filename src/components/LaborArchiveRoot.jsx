import { useEffect, useMemo, useState } from "react";
import ArchiveSidebar from "./ArchiveSidebar";
import FlipbookViewer from "./FlipbookViewer";
import ReaderOverlay from "./ReaderOverlay";

export default function LaborArchiveRoot({
  collections = [],
  title = "Labor Archive",
  subtitle = "A browsable archive with flipbook browsing, searchable collections, and a full reader mode.",
}) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(collections[0]?.id ?? null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [readerIndex, setReaderIndex] = useState(0);

  const filteredCollections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return collections;

    return collections.filter((collection) => {
      const pageText = (collection.pages || [])
        .flatMap((page) => [
          page.title || "",
          page.summary || "",
          ...(page.keywords || []),
        ])
        .join(" ");

      const text = [
        collection.title || "",
        collection.description || "",
        collection.year ? String(collection.year) : "",
        collection.event || "",
        ...(collection.tags || []),
        pageText,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [collections, query]);

  useEffect(() => {
    if (!filteredCollections.length) {
      setActiveId(null);
      return;
    }

    const stillVisible = filteredCollections.some((item) => item.id === activeId);
    if (!stillVisible) {
      setActiveId(filteredCollections[0].id);
    }
  }, [filteredCollections, activeId]);

  const activeCollection =
    filteredCollections.find((item) => item.id === activeId) ?? null;

  useEffect(() => {
    setReaderIndex(0);
  }, [activeId]);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <div className="mx-auto grid max-w-[1700px] grid-cols-1 gap-5 p-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <ArchiveSidebar
          title={title}
          subtitle={subtitle}
          query={query}
          setQuery={setQuery}
          collections={filteredCollections}
          activeId={activeId}
          setActiveId={setActiveId}
        />

        <main className="rounded-[28px] border border-stone-300 bg-[#f3ede0] p-4 shadow-sm">
          {activeCollection ? (
            <>
              <div className="mb-4 flex flex-col gap-3 border-b border-stone-300 pb-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {activeCollection.year ? (
                      <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white">
                        {activeCollection.year}
                      </span>
                    ) : null}
                    {activeCollection.event ? (
                      <span className="rounded-full bg-stone-200 px-3 py-1 text-xs text-stone-700">
                        {activeCollection.event}
                      </span>
                    ) : null}
                    {(activeCollection.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-stone-200 px-3 py-1 text-xs text-stone-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-3xl font-semibold tracking-tight">
                    {activeCollection.title}
                  </h2>

                  {activeCollection.description ? (
                    <p className="mt-2 max-w-4xl text-sm leading-6 text-stone-700">
                      {activeCollection.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setReaderOpen(true)}
                    className="rounded-2xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
                  >
                    Open reader
                  </button>
                </div>
              </div>

              <FlipbookViewer
                collection={activeCollection}
                onOpenReader={(index) => {
                  setReaderIndex(index);
                  setReaderOpen(true);
                }}
              />
            </>
          ) : (
            <div className="flex min-h-[65vh] items-center justify-center rounded-[28px] border border-dashed border-stone-300 bg-white/60 p-8 text-center text-stone-500">
              No matching collections. Humanity remains undefeated in its war against metadata.
            </div>
          )}
        </main>
      </div>

      <ReaderOverlay
        open={readerOpen}
        onClose={() => setReaderOpen(false)}
        collection={activeCollection}
        initialIndex={readerIndex}
      />
    </div>
  );
}
