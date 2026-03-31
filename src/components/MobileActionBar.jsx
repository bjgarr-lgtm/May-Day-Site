import React from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, MapPinned, Search } from 'lucide-react'

export default function MobileActionBar() {
  function jump(id) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e3a7a5]/18 bg-[#1f3a2c]/95 px-3 py-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        <button
          type="button"
          onClick={() => jump('schedule')}
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-3 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#f7f1e8]"
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          schedule
        </button>
        <button
          type="button"
          onClick={() => jump('map')}
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-3 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#f7f1e8]"
        >
          <MapPinned className="mr-2 h-4 w-4" />
          map
        </button>
        <Link
          to="/hunt"
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#e3a7a5] px-3 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#264636]"
        >
          <Search className="mr-2 h-4 w-4" />
          hunt
        </Link>
      </div>
    </div>
  )
}
