import React from 'react'

export default function NoiseBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 opacity-[0.11] mix-blend-screen [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,.65)_0,transparent_18%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,.25)_0,transparent_16%),radial-gradient(circle_at_40%_70%,rgba(255,255,255,.35)_0,transparent_14%),radial-gradient(circle_at_75%_80%,rgba(255,255,255,.2)_0,transparent_16%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.16] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"160\" viewBox=\"0 0 160 160\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"1.1\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"160\" height=\"160\" filter=\"url(%23n)\" opacity=\"0.75\"/></svg>')]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.18),transparent_18%,transparent_82%,rgba(0,0,0,.22))]" />
    </>
  )
}
