import './globals.css';
import Nav from './nav';

export const metadata = { title: 'Scholarship Finder' };

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
