
import DefaultLayout from '@/components/layout/DefaultLayout'
import Contact from '@/components/contact'
import React from 'react'
import { generateNextMetadata } from '@/utils/metadataUtils'

// Generate metadata for the contact page
export const metadata = generateNextMetadata('/contact');

export default function page() {

  return (
    <DefaultLayout>
      <Contact />
    </DefaultLayout>
  )
}
