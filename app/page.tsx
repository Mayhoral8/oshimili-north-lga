"use client";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();
  useEffect(() => {
    router.push("/auth/login");
    setIsLoading(false);
  }, []);
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.36)] z-50 backdrop-blur-sm">
        <Loader2Icon
          size={48}
          className="text-6xl animate-spin  text-primary-purple"
        />
      </div>
    );
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
    
    </div>
  );
}
