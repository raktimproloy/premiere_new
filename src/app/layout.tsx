import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google"; // ✅ Import Inter Tight
import "./globals.css";
import { AuthProvider } from "@/components/common/AuthContext";
import SessionProvider from "@/components/common/SessionProvider";
import Script from "next/script";
import PagePreloader from "@/components/common/PagePreloader";
import { Toaster } from 'react-hot-toast';
import { NotificationProvider } from "@/components/common/NotificationContext";
import { generateNextMetadata } from "@/utils/metadataUtils";

// ✅ Load the Inter Tight font
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap", // Optional for better font loading behavior
});

// Generate metadata using our centralized system
export const metadata: Metadata = {
  ...generateNextMetadata('/'),
  icons: {
    icon: [
      { url: '/favicon-16x16.png?v=2', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png?v=2', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico?v=2', sizes: '16x16', type: 'image/x-icon' },
    ],
    apple: '/apple-touch-icon.png?v=2',
    shortcut: '/favicon.ico?v=2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.quilljs.com/1.3.6/quill.snow.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        {/* Favicon links for better browser compatibility */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <Script
          src="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${interTight.variable} antialiased`}>
        <PagePreloader>
          <SessionProvider>
            <AuthProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </AuthProvider>
          </SessionProvider>
        </PagePreloader>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              borderRadius: '8px',
              padding: '16px',
            },
          }}
        />
      </body>
      
    </html>
  );
}
