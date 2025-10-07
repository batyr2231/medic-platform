import './globals.css';
import ClientProviders from './ClientProviders';

export const metadata = {
  title: 'MediCare - Медицинская помощь на дому',
  description: 'Профессиональная медицинская помощь у вас дома. Квалифицированные врачи 24/7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}