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
          <p className="mt-4 text-base leading-7 text-[#f7f1e8]/84">
            If a vendor fee applies, please submit payment after completing this application using the event donation link below.
          </p>
          <a
            href="https://hcb.hackclub.com/donations/start/may-day-organizing-committee"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-12 items-center rounded-full bg-[#e3a7a5] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636] transition hover:bg-[#efbbb9]"
          >
            pay vendor fee
          </a>
          <p className="mt-4 text-sm leading-7 text-[#f7f1e8]/76">
            Include your vendor or organization name in the payment note so we can match it to your application.
          </p>
        </>
      }
      successTitle="vendor application submitted"
      successBody="We saved your submission. You can follow up at maydayontheharbor@proton.me if you need to add details."
    />
  )
}
