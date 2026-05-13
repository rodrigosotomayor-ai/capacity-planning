export const metadata = {
  title: 'Capacity App',
  description: 'Gestión de capacity mensual',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css" />
      </head>
      <body style={{ margin: 0, padding: '24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#f5f5f3', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
