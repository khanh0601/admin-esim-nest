"use client";

import queryClientConfig from "@/config/tanstack";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PropsWithChildren } from "react";

export default function MainLayout({ children }: PropsWithChildren) {
    return (
            <QueryClientProvider client={queryClientConfig}>
                <ReactQueryDevtools initialIsOpen={false} />
                {children}
            </QueryClientProvider>
    );
}
