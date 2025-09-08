import React from 'react'
import SuperAdminLayout from '@/components/layout/SuperAdminLayout'
import HelpMessages from '@/components/superadmin/help-message'

export default function page() {
  return (
    <SuperAdminLayout>
        <HelpMessages />
    </SuperAdminLayout>
  )
}
