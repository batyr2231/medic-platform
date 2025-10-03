import './globals.css';
import ClientProviders from './ClientProviders';

export const metadata = {
  title: 'Medic Platform',
  description: 'Платформа для взаимодействия клиентов и медиков',
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