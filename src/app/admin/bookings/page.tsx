import React from 'react'
import Bookings from '@/components/admin/bookings'
import AdminLayout from '@/components/layout/AdminLayout'

export default function page() {
  return (
    <AdminLayout>
        <Bookings/>
    </AdminLayout>
  )
}
