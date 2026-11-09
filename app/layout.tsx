// app/layout.tsx
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // ...
  return (
    <html lang="en">
      {/* ដាក់ Class bg-anime-4d នៅក្នុង body */}
      <body className="bg-anime-4d antialiased selection:bg-brand-primary/30">
        <div className="bg-grid-4d" /> {/* ស្រទាប់ Grid សម្រាប់ 4D */}
        <RouteProgress />
        <CurrencyProvider exchangeRate={exchangeRate}>
          <AnnouncementBar />
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}