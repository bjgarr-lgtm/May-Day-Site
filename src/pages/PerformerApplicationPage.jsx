import React from 'react'
import ApplicationFormPage from '../components/ApplicationFormPage'

export default function PerformerApplicationPage() {
  return (
    <ApplicationFormPage
      type="performer"
      title="performer application"
      intro="Apply here if you want to perform at May Day on the Harbor. Bands, solo acts, noise projects, spoken word, and adjacent weirdness all belong here."
      successTitle="performer application submitted"
      successBody="We saved your submission. You can follow up at maydayontheharbor@proton.me if you need to add details."
    />
  )
}
