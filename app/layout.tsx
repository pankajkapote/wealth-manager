import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Personal AI Wealth Manager',
  description: 'Your personal investment analyst powered by AI',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Wealth Manager',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1e40af" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="bg-invest-blue text-white antialiased">
        {children}
      </body>
    </html>
  );
}
