import SuperAdminLayout from '@/components/layout/SuperAdminLayout'
import Bookings from '@/components/admin/bookings'
import React from 'react'

export default function page() {
  return (
    <SuperAdminLayout>
        <Bookings />
    </SuperAdminLayout>
  )
}
