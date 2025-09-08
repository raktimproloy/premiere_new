import React from 'react'
import Head from 'next/head';
import SignUpForm from "@/components/signup"

export default function page() {
  return (
    <>
    <Head>
      <title>Sign Up | Create Account</title>
      <meta name="description" content="Create an account to access exclusive features" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    
    <main>
      <SignUpForm />
    </main>
  </>
  )
}
