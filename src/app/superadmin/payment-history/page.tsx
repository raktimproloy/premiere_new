import SuperAdminLayout from '@/components/layout/SuperAdminLayout'
import PaymentHistory from '@/components/superadmin/payment-history'
import React from 'react'

export default function page() {
  return (
    <SuperAdminLayout>
        <PaymentHistory />
    </SuperAdminLayout>
  )
}
