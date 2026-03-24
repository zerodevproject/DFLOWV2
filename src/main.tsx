import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import './index.css'
import App from './App.tsx'

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

function Root() {
  // If no URL is provided, we still wrap with a dummy client to avoid hook crashes.
  // The user should run 'npx convex dev' to set the real VITE_CONVEX_URL.
  const client = new ConvexReactClient(convexUrl || "https://placeholder-url-until-convex-dev.convex.cloud");

  return (
    <ConvexAuthProvider client={client}>
      <App />
    </ConvexAuthProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
