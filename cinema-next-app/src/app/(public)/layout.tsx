import type { Metadata } from 'next';
import PublicRoute from "components/routes/PublicRoute"

export const metadata: Metadata = {
  title: 'Cinema App | Вход и регистрация',
  description: 'Войдите или зарегистрируйтесь в Cinema App',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PublicRoute>
      {children}
    </PublicRoute>
  )
}
