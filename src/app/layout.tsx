import "./globals.css";

export const metadata = {
  title: "Gate IO Bot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="w-[100vw] overflow-x-hidden">{children}</body>
    </html>
  );
}
