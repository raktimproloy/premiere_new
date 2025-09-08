'use client'
import MainSection from '@/components/checkout/MainSection'
import DefaultLayout from '@/components/layout/DefaultLayout'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { useSearchParams, useParams } from 'next/navigation'
import React from 'react'

export default function Page() {
  const searchParams = useSearchParams()
  const params = useParams()
  const searchId = searchParams.get('id') || undefined
  const propertyId = params?.id as string

  return (
    <ProtectedRoute propertyId={propertyId} searchId={searchId}>
      <DefaultLayout>
        <MainSection />
      </DefaultLayout>
    </ProtectedRoute>
  )
}
