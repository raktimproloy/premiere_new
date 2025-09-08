import React from 'react'
import PropertyPage from "@/components/admin/properties"
import AdminLayout from '@/components/layout/AdminLayout'

export default function page() {
  return (
    <AdminLayout>
      <PropertyPage role="admin"/>
    </AdminLayout>
  )
}
