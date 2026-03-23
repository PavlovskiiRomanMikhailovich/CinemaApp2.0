// app/(protected)/layout.tsx
import type { Metadata } from 'next';
import Header from "components/Header/Header"
import ProtectedRoute from "components/routes/ProtectedRoute"

type Props = {
  params: Promise<{ documentId?: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  
  if (resolvedParams?.documentId) {
    return {
      title: 'Страница фильма | Cinema App',
      description: 'Просмотр информации о фильме',
    };
  } else {
    return {
      title: 'Cinema App',
      description: 'Ваш персональный кинотеатр',
    };
  }
}

export default async function ProtectedLayout({ 
  children,
  params 
}: Props) {
  const resolvedParams = await params;
  
  return (
    <ProtectedRoute>
      <Header/>
      {children}
    </ProtectedRoute>
  );
}
