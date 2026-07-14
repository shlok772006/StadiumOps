import "../styles/globals.css";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

// Pages that DON'T use the dashboard layout
const PUBLIC_PAGES = ["/", "/login"];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isPublic = PUBLIC_PAGES.includes(router.pathname);

  if (isPublic) {
    return <Component {...pageProps} />;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
