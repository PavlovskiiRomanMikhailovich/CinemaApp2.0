import PublicRoute from "components/routes/PublicRoute"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PublicRoute>{children}</PublicRoute>
  )
}