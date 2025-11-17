"use client";
import React, { useState } from "react";
import {
  Menu,
  X,
  ChevronRight,
  Heart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import logo from "../assets/lga-logo.png";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
const Navbar = () => {
  const { status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDepDropdowOpen, setIsDepDropdowOpen] = useState(false);
  const [isGovernanceDropdownOpen, setIsGovernanceDropdownOpen] =
    useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDepDropdown = () => setIsDepDropdowOpen(!isDepDropdowOpen);
  const toggleGovDropdown = () =>
    setIsGovernanceDropdownOpen(!isGovernanceDropdownOpen);

  const router = useRouter();
  const signout = () => {
    signOut();
    router.push("/auth/login");
  };
  return (
    <header className="relative bg-white shadow-md">
      <nav className="w-full mx-auto px-4 sm:px-6 lg:px-8 fixed z-30 top-0 bottom-0 left-0 right-0 bg-white h-fit">
        <div className="flex justify-between items-center py-4 ">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-purple rounded-full flex items-center justify-center">
              <Image src={logo} alt="logo" />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="p-2">
              {isMenuOpen ? (
                <X size={24} className="text-gray-800" />
              ) : (
                <Menu size={24} className="text-gray-800" />
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {status === "authenticated" ? (
              <div
                onClick={signout}
                className="bg-primary-purple text-white w-fit px-2 py-1 rounded-md cursor-pointer"
              >
                Sign out
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-primary-purple"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary-purple text-white w-fit px-2 py-1 rounded-md"
                >
                  Signup
                </Link>
              </>
            )}
          </div>

         
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200  space-y-2 fixed top-0 bottom-0 left-0 right-0 h-[70vh] overflow-scroll py-4 flex items-start flex-col z-20 bg-white mt-16 px-4  shadow-md">
            {status === "authenticated" ? (
              <div
                onClick={signout}
                className="bg-primary-purple text-white w-fit px-2 py-1 rounded-md cursor-pointer"
              >
                Sign out
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-primary-purple"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary-purple text-white w-fit px-2 py-1 rounded-md"
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
