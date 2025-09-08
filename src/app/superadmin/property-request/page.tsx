import SuperAdminLayout from '@/components/layout/SuperAdminLayout'
import PropertyRequest from '@/components/superadmin/property-request'
import React from 'react'

export default function page() {
  return (
    <SuperAdminLayout>
        <PropertyRequest />
    </SuperAdminLayout>
  )
}
