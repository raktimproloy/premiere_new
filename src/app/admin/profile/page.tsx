import React from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import Profile from '@/components/admin/profile'

export default function page() {
  return (
    <AdminLayout>
        <Profile role="admin"/>
    </AdminLayout>
  )
}
