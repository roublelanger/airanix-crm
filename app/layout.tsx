'use client'

import './globals.css'
import MobileHeader from '@/components/MobileHeader'
import { AuthProvider } from '@/app/context/AuthContext'
import ProtectedLayout from '@/components/ProtectedLayout'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <title>Airanix CRM</title>
        <meta name="description" content="Professional CRM System" />
        <style>{`
          @media (max-width: 768px) {
            nav { display: none !important; }
            main { margin-left: 0 !important; padding-top: 64px !important; }
          }
          .nav-link {
            background: #f5f5f5 !important;
            border-radius: 8px !important;
            margin: 6px 12px !important;
            padding: 12px 16px !important;
            transition: all 0.25s ease !important;
            border-left: 3px solid #000000 !important;
          }
          .nav-link:hover {
            background: #e0e0e0 !important;
            color: #000000 !important;
            padding-left: 20px !important;
            border-left-color: #000000 !important;
          }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#ffffff' }}>
        <AuthProvider>
          <ProtectedLayout>{children}</ProtectedLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
