import type { Metadata } from 'next';
import { StoreProvider } from 'providers/StoreProvider';
import { ThemeProvider } from 'providers/ThemeProvider';
import 'styles/styles.scss';

export const metadata: Metadata = {
  title: 'Cinema App',
  description: 'Your favorite movies',
};

const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('theme');
    var preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    var theme = saved || preferred;
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <StoreProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
