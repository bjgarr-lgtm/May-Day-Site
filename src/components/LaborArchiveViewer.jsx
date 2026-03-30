import { useState } from "react";
import HTMLFlipBook from "react-pageflip";

export default function LaborArchiveViewer({ pages = [] }) {
  const [zoomPage, setZoomPage] = useState(null);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#f5f1e8]">

      <HTMLFlipBook
        width={350}
        height={500}
        size="stretch"
        minWidth={300}
        maxWidth={900}
        minHeight={400}
        maxHeight={1200}
        showCover={true}
        mobileScrollSupport={true}
        className="shadow-2xl"
      >
        {pages.map((src, i) => (
          <div
            key={i}
            className="bg-white flex items-center justify-center cursor-zoom-in"
            onClick={() => setZoomPage(src)}
          >
            <img
              src={src}
              alt={`page-${i}`}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </HTMLFlipBook>

      {zoomPage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center cursor-zoom-out"
          onClick={() => setZoomPage(null)}
        >
          <img
            src={zoomPage}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
