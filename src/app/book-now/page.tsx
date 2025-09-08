import MainPage from '@/components/booknow/MainPage';
import Breadcrumb from '@/components/common/Breadcrumb'
import DefaultLayout from '@/components/layout/DefaultLayout'
import React, { Suspense } from 'react'

export default function page() {
  return (
    <DefaultLayout>
      <Breadcrumb bgImage={"/images/booknow_breadcrumb.jpg"} path={["Home", "Listing Page"]} title="Book now from Luxury Miami Listings" description="Immerse yourself in sophistication with our finest upscale properties—reserve now for an unforgettable experience." />
      <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div></div>}>
        <MainPage />
      </Suspense>
    </DefaultLayout>
  );
}
