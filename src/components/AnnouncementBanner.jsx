import React from 'react'
import { AlertTriangle, Info, Megaphone } from 'lucide-react'

export default function AnnouncementBanner({ text, level = 'info' }) {
  if (!text) return null

  const styles = {
    info: {
      wrap: 'border-y border-[#e3a7a5]/18 bg-[#e3a7a5]/10',
      text: 'text-[#f7f1e8]',
      Icon: Info,
      label: 'announcement',
    },
    warning: {
      wrap: 'border-y border-yellow-300/20 bg-yellow-300/10',
      text: 'text-yellow-50',
      Icon: AlertTriangle,
      label: 'important',
    },
    urgent: {
      wrap: 'border-y border-red-300/20 bg-red-500/10',
      text: 'text-red-50',
      Icon: Megaphone,
      label: 'urgent update',
    },
  }

  const style = styles[level] || styles.info
  const Icon = style.Icon

  return (
    <section className={style.wrap}>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Icon className="h-4 w-4 shrink-0" />
        <p className={`text-sm font-semibold uppercase tracking-[0.08em] ${style.text}`}>
          {style.label}
        </p>
        <p className={`text-sm ${style.text}/90`}>{text}</p>
      </div>
    </section>
  )
}