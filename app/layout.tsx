import type { ReactNode } from "react";

// Root layout required for the `app/` tree. All UI remains under `pages/`; only `app/api/*` is used.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
