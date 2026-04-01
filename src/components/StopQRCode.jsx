import React from 'react'

export default function StopQRCode({ value, title = 'Stop QR code' }) {
  const src = `https://chart.googleapis.com/chart?cht=qr&chs=220x220&chl=${encodeURIComponent(value)}`

  return (
    <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">{title}</p>
      <div className="mt-4 flex justify-center">
        <img src={src} alt="QR code for this stop" className="h-[220px] w-[220px] rounded-2xl bg-white p-3" />
      </div>
      <p className="mt-4 text-center text-xs leading-6 text-[#f7f1e8]/62">Print this for the physical stop, or scan it from another device to open the exact page.</p>
    </div>
  )
}
