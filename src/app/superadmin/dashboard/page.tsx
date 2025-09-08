import React from 'react'
import SuperAdminLayout from '@/components/layout/SuperAdminLayout'
import Dashboard from '@/components/superadmin/dashboard'

// Super Admin Dashboard Page
export default function page() {
  return (
    <SuperAdminLayout>
        <Dashboard />
    </SuperAdminLayout>
  )
}
