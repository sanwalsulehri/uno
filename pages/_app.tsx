import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/globals.css";

/** Fonts via `next/head` — avoids a custom `_document` (which webpack dev can break via vendor-chunks). */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="font-sans antialiased">
        <Component {...pageProps} />
      </div>
    </>
  );
}
