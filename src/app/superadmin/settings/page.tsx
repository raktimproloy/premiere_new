import SuperAdminLayout from '@/components/layout/SuperAdminLayout'
import Settings from '@/components/superadmin/settings'
import React from 'react'

export default function page() {
  return (
    <SuperAdminLayout>
        <Settings />
    </SuperAdminLayout>
  )
}
