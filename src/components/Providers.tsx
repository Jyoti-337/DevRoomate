"use client";

import "@/lib/env-init";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        />
        <SonnerToaster position="bottom-right" theme="dark" closeButton richColors />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
