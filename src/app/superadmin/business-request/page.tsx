import SuperAdminLayout from '@/components/layout/SuperAdminLayout'
import BusinessRequest from '@/components/superadmin/business-request'
import React from 'react'

export default function page() {
  return (
    <SuperAdminLayout>
        <BusinessRequest />
    </SuperAdminLayout>
  )
}
