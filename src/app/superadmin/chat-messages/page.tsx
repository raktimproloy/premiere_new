import React from 'react'
import ChatMessages from '@/components/superadmin/chat-message'
import SuperAdminLayout from '@/components/layout/SuperAdminLayout'

export default function page() {
  return (
    <SuperAdminLayout>
      <ChatMessages />
    </SuperAdminLayout>
  )
}
