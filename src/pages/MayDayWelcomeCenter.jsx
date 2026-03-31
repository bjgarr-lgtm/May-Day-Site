// PATCH: adds performer button next to vendor button in two places
// requires siteMeta.performerHref to be set

// FIND both vendor button sections and ADD this block directly after vendor button:

{siteMeta.performerHref ? (
  <a
    href={siteMeta.performerHref}
    target="_blank"
    rel="noreferrer"
    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#e3a7a5]/25 bg-black/20 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
  >
    <ClipboardPenLine className="mr-2 h-4 w-4 shrink-0" />
    performer application
  </a>
) : null}

