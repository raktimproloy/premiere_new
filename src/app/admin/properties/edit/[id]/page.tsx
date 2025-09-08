import AdminLayout from '@/components/layout/AdminLayout'
import EditPropertyPage from '@/components/admin/properties/edit'
import React from 'react'

export default function page() {
  return (
    <AdminLayout>
        <EditPropertyPage />
    </AdminLayout>
  )
}
