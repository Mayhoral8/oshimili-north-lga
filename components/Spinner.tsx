"use client";
import React, { useContext } from "react";
import { Loader2Icon } from "lucide-react";
import { CreateContext } from "@/Context";

export default function Spinner() {
  const { loader } = useContext(CreateContext);
  const { isLoading } = loader;

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.36)] z-50 backdrop-blur-sm">
        <Loader2Icon
          size={48}
          className="text-6xl animate-spin  text-primary-purple"
        />
      </div>
    );
  } else {
    return null;
  }
}
