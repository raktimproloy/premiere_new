import SuperAdminLayout from '@/components/layout/SuperAdminLayout'
import Profile from '@/components/superadmin/profile'
import React from 'react'

export default function page() {
  return (
    <SuperAdminLayout>
        <Profile />
    </SuperAdminLayout>
  )
}
