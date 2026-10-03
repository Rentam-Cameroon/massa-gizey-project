import '../index.css';
import { AppLayout } from '../components/AppLayout';

export const metadata = {
  title: 'Massa Gizey Project — One place for every word',
  description: 'The Massa Gizey Project brings trusted Massa and Gizey dictionaries, specialist lexicons, and cultural video stories together so you can explore language with confidence.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body>
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
