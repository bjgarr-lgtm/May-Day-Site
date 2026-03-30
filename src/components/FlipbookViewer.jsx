import { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";

function LazyImage({ page, index, onOpenReader }) {
  const holderRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = holderRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={holderRef}
      className="relative h-full w-full cursor-zoom-in bg-white"
      onClick={() => onOpenReader(index)}
    >
      {visible ? (
        <img
          src={page.src}
          alt={page.title || `Page ${index + 1}`}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-stone-100 text-sm text-stone-400">
          Loading page...
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-xl bg-black/55 px-3 py-2 text-xs text-white backdrop-blur-sm">
        <div className="font-medium">Page {index + 1}</div>
        {page.title ? <div className="mt-1 text-stone-200">{page.title}</div> : null}
      </div>
    </div>
  );
}

export default function FlipbookViewer({ collection, onOpenReader }) {
  const pages = collection?.pages || [];

  return (
    <div className="flex min-h-[72vh] items-center justify-center">
      <HTMLFlipBook
        key={collection?.id || "empty"}
        width={390}
        height={570}
        size="stretch"
        minWidth={280}
        maxWidth={1100}
        minHeight={420}
        maxHeight={1500}
        showCover={true}
        mobileScrollSupport={true}
        drawShadow={true}
        usePortrait={true}
        startPage={0}
        flippingTime={700}
        className="shadow-2xl"
      >
        {pages.map((page, index) => (
          <div key={`${page.src}-${index}`} className="h-full w-full">
            <LazyImage page={page} index={index} onOpenReader={onOpenReader} />
          </div>
        ))}
      </HTMLFlipBook>
    </div>
  );
}
