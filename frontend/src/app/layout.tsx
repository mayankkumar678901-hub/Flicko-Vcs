import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Mini-VCS | Web Version Control Platform',
  description: 'Lightweight web-based Version Control System platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-github-bg text-github-text antialiased">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
