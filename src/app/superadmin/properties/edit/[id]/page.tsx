import SuperAdminLayout from '@/components/layout/SuperAdminLayout'
import EditPropertyPage from '@/components/superadmin/properties/edit'
import React from 'react'

export default function page() {
  return (
    <SuperAdminLayout>
        <EditPropertyPage />
    </SuperAdminLayout>
  )
}
