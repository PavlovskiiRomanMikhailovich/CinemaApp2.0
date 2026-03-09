import type { Metadata } from 'next';
import { StoreProvider } from 'providers/StoreProvider';
import 'styles/styles.scss';


export const metadata: Metadata = {
  title: 'Cinema App',
  description: 'Your favorite movies',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
