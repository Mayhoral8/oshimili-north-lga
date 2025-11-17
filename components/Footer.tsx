import React from "react";
import Image from "next/image";
import logo from "@/assets/logo.png";
const Footer = () => {
  return (
    <footer className="bg-[#007AFF] text-white py-8 min-h-64 flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Image src={logo} alt="logo" />
          </div>
          <p className="text-blue-100">
            © 2025 Ethiope East Local Government Area. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
