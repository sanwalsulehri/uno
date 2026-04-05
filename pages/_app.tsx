import type { AppProps } from "next/app";
import { DM_Sans, Fraunces } from "next/font/google";
import "@/styles/globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

/** Self-hosted fonts via `next/font` avoid extra `<link>` churn that can race with CSS HMR (parentNode null). */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${dmSans.variable} ${fraunces.variable} font-sans antialiased`}>
      <Component {...pageProps} />
    </div>
  );
}
