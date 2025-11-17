"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ReactQueryProvider from "./ReactQueryProvider";
import ContextProvider from "@/Context";
import Spinner from "@/components/Spinner";
import Toast from "@/components/toast/toast";
import { Suspense } from "react";
const ProviderWrapper = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <ReactQueryProvider>
        <ReactQueryDevtools initialIsOpen={false} />
        <SessionProvider>
          <ContextProvider>
            <Suspense>
              <Spinner />
              <Toast />
              {children}
            </Suspense>
          </ContextProvider>
        </SessionProvider>
      </ReactQueryProvider>
    </>
  );
};

export default ProviderWrapper;
