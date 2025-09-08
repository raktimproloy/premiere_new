import React from 'react'
import CreateProperty from '@/components/admin/properties/create'
import SuperAdminLayout from '@/components/layout/SuperAdminLayout'

export default function page() {
  return (
    <SuperAdminLayout>
        <CreateProperty />
    </SuperAdminLayout>
  )
}
