import '../styles/zameentrace.css';
import '../styles/themes.css';
import '../styles/responsive.css';
import 'leaflet/dist/leaflet.css';

export const metadata = {
  title: 'ZameenTrace | Pakistan\'s Property Intelligence Layer',
  description: 'Premium property intelligence platform for land verification and investment analysis.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1a1f2e',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Inter', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
