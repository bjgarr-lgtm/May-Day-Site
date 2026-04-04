import React from 'react'
import ApplicationFormPage from '../components/ApplicationFormPage'

export default function VendorApplicationPage() {
  return (
    <ApplicationFormPage
      type="vendor"
      title="vendor application"
      intro="Apply here if you want to vend or table."
      extraIntro={
        <>
          <p className="mt-4 text-base text-white">
            If a vendor fee applies, submit payment here:
          </p>
          <a
            href="https://hcb.hackclub.com/donations/start/may-day-organizing-committee"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex px-6 py-3 bg-pink-300 text-green-900 font-bold rounded-full"
          >
            pay vendor fee
          </a>
        </>
      }
      successTitle="submitted"
      successBody="we got it"
    />
  )
}
