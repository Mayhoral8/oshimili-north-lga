"use client";
import React from "react";
import Navbar from "@/components/navbar";
import AuthGuard from "../auth/AuthGuard";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  return (
    <AuthGuard>
      <Navbar />
      {children}
    </AuthGuard>
  );
};

export default Layout;
