import React from 'react'
import ApplicationFormPage from '../components/ApplicationFormPage'

export default function VendorApplicationPage() {
  return (
    <ApplicationFormPage
      type="vendor"
      title="vendor application"
      intro="Apply here if you want to vend, table, distro, share organizational material, or otherwise hold space at May Day on the Harbor."
      successTitle="vendor application submitted"
      successBody="We saved your submission. You can follow up at maydayontheharbor@proton.me if you need to add details."
    />
  )
}
