import Header from "components/Header/Header"
import ProtectedRoute from "components/routes/ProtectedRoute"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
        <Header/>
        {children}
    </ProtectedRoute>
  )
}