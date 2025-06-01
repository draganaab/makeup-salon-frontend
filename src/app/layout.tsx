import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Makeup Salon Management',
  description: 'Beautiful makeup appointments made simple',
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en">
      <body className={inter.className}>
      {children}
      <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#3C3C3C',
              border: '1px solid #E0CFE3',
            },
            success: {
              iconTheme: {
                primary: '#D291BC',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#FFFFFF',
              },
            },
          }}
      />
      </body>
      </html>
  );
}