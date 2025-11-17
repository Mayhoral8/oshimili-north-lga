"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Optional: specify which roles can access this route
  redirectPath?: string; // Optional: custom redirect path for unauthorized users
}

const AuthGuard = ({
  children,
  allowedRoles = [],
  redirectPath,
}: AuthGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isJwtExpired = (token: string) => {
    try {
      const decoded = jwtDecode(token);
      if (decoded && decoded.exp) {
        return decoded.exp;
      } else {
        throw new Error("Token does not contain an 'exp' field.");
      }
    } catch (error) {
      console.error("Invalid token or decoding error:", error);
      return null;
    }
  };

  const getDefaultRouteForRole = (role: string | null): string => {
    console.log(role?.toLowerCase);
    switch (role?.toLowerCase()) {
      case "admin":
        return "/admin";
      case "customer":
        return "/portal";
      default:
        return "/portal";
    }
  };

  const isRoleAuthorized = (
    userRole: string | null | undefined,
    allowedRoles: string[]
  ): boolean => {
    // If no specific roles are required, allow all authenticated users
    if (allowedRoles.length === 0) return true;

    // Check if user's role is in the allowed roles
    return allowedRoles.some(
      (role) => role.toLowerCase() === userRole?.toLowerCase()
    );
  };

  useEffect(() => {
    // Check token expiry
    if (session?.expires && session?.user?.accessToken) {
      const currentTime = new Date().getTime() / 1000;
      const expiryTime = isJwtExpired(session?.user?.accessToken);

      if (expiryTime && currentTime > expiryTime) {
        signOut();
        return;
      }
    }

    // Handle unauthenticated users
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    // Handle authenticated users
    if (status === "authenticated" && session?.user) {
      const userRole = session.user.role;

      // Check if user has required role for this route
      if (
        allowedRoles.length > 0 &&
        !isRoleAuthorized(userRole, allowedRoles)
      ) {
        // User doesn't have permission for this route
        if (redirectPath) {
          router.push(redirectPath);
        } else {
          // Redirect to their default dashboard based on role
          router.push(getDefaultRouteForRole(userRole));
        }
        return;
      }

      // Role-based initial navigation (only if on root or auth pages)
      if (pathname === "/" || pathname?.startsWith("/auth")) {
        const defaultRoute = getDefaultRouteForRole(userRole);
        router.push(defaultRoute);
        return;
      }
    }
  }, [status, session, pathname, allowedRoles, redirectPath, router]);

  // Show loading spinner while session is being checked
  if (status === "loading") {
    return (
      <div className="top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-white z-50 fixed">
        <Loader size={64} className=" animate-spin text-[#007AFF]" />
      </div>
    );
  }

  // Show loading while redirecting
  if (
    status === "unauthenticated" ||
    (status === "authenticated" &&
      (pathname === "/" || pathname?.startsWith("/auth")))
  ) {
    return (
      <div className="top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-[rgba(0,0,0,0.36)] z-50 fixed">
        <Loader className="text-6xl animate-spin text-[#007AFF]" />
      </div>
    );
  }

  // Render children for authenticated and authorized users
  if (status === "authenticated") {
    const userRole = session?.user?.role;

    // Final role check before rendering
    if (allowedRoles.length > 0 && !isRoleAuthorized(userRole, allowedRoles)) {
      return (
        <div className="top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-[rgba(0,0,0,0.36)] z-50 fixed">
          <Loader className="text-6xl animate-spin text-[#007AFF]" />
        </div>
      );
    }

    return <main>{children}</main>;
  }

  // Default fallback
  return null;
};

export default AuthGuard;
