import React from 'react'

export default function NoiseBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 opacity-[0.11] mix-blend-screen [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,.65)_0,transparent_18%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,.25)_0,transparent_16%),radial-gradient(circle_at_40%_70%,rgba(255,255,255,.35)_0,transparent_14%),radial-gradient(circle_at_75%_80%,rgba(255,255,255,.2)_0,transparent_16%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.14] mix-blend-overlay [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.045)_0_1px,transparent_1px_3px),repeating-linear-gradient(90deg,rgba(0,0,0,.04)_0_1px,transparent_1px_4px)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.10] mix-blend-soft-light [background-image:radial-gradient(rgba(255,255,255,.12)_0.7px,transparent_0.7px)] [background-size:9px_9px]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.18),transparent_18%,transparent_82%,rgba(0,0,0,.22))]" />
    </>
  )
}
