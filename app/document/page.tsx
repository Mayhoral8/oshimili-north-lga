"use client";
import React, { useState, useRef, useEffect } from "react";
import { Download, Printer } from "lucide-react";
import certificateImg from "@/assets/certificate.png";
import signature from "@/assets/sign.png";
import stamp from "@/assets/stamp.png";
import QRCode from "qrcode";
import "./page.css";
import { Application } from "../portal/FamilyDetails";
import { toast } from "sonner";
import Image from "next/image";

interface CertificateData {
  first_name: string;
  middle_name: string;
  last_name: string;
  tracking_number: string;
  date_of_birth: string;
  lga_of_origin: string;
  state_of_origin: string;
  clan: string;
  sub_clan: string;
  father_name: string;
  mother_name: string;
  issue_date: string;
  authorized_signature: string;
  authorized_name: string;
  authorized_title: string;
}

const CertificateGenerator: React.FC<{ certificateData: Application }> = ({
  certificateData,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  console.log(certificateData);
  // Sample certificate data - replace with props or API data

  const generatePDF = async () => {
    if (!certificateRef.current) return;

    setIsGenerating(true);

    try {
      // Dynamic import for better performance
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const element = certificateRef.current;

      // Create canvas from the certificate
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        ignoreElements: (element) => false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a1",
      });

      const imgWidth = 595;
      const imgHeight = 840;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Download the PDF
      pdf.save(`Certificate_${certificateData.tracking_number}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const previewPDF = async () => {
    if (!certificateRef.current) return;

    setIsGenerating(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a1",
      });

      const imgWidth = 595;
      const imgHeight = 840;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Open PDF in new tab for preview
      const pdfBlob = pdf.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error previewing PDF:", error);
      alert("Error previewing PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className=" bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center justify-between">
            <div className="flex lg:flex-row flex-col items-center gap-3">
              <button
                onClick={previewPDF}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 lg:text-base text-sm w-fit"
              >
                <Printer className="w-4 h-4" />
                Preview Certificate
              </button>

              <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-primary-purple text-white rounded-lg lg:text-base text-sm w-fit hover:bg-secondary-purple transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? "Generating..." : "Download Certificate"}
              </button>
            </div>
          </div>
        </div>

        {/* Hidden certificate for PDF generation - positioned off-screen */}
        <div style={{ position: "absolute", left: "-9999px", top: "0" }}>
          <CertificateTemplate data={certificateData} ref={certificateRef} />
        </div>
      </div>
    </div>
  );
};

// Certificate Template Component - keeping your exact styling
interface CertificateTemplateProps {
  data: Application;
}

const CertificateTemplate = React.forwardRef<
  HTMLDivElement,
  CertificateTemplateProps
>(({ data }, ref) => {
  const date = new Date();
  date.toLocaleDateString("en-GB");
  const currentMonth = date.toLocaleDateString("en-GB");

  const [qrCode, setQrCode] = useState("");
  const handleGenerateQrCode = async () => {
    try {
      const response = await QRCode.toDataURL(
        `https://portal.oshimilinorthlga.dl.gov.ng/verify?id=${data?.tracking_number}` ||
          "oshimillinorth"
      );
      setQrCode(response);
    } catch (err) {
      toast.error("Error generating QR code");
    }
  };
  useEffect(() => {
    handleGenerateQrCode();
  }, []);
  if (qrCode) {
    return (
      <div
        ref={ref}
        className="relative lg:w-[595px] lg:h-[540px] w-[595px] h-[540px] flex items-center justify-center -z-10]"
      >
        <div className="absolute text-sm top-0 ml-[360px] mt-[138px] z-20 flex items-center gap-x-2">
          <span style={{ color: "#1e2939" }} className="date-display">
            {`${currentMonth}`}
          </span>
        </div>

        <span
          style={{ color: "#1e2939" }}
          className="date-display absolute mt-[-195px] mr-[350px] z-20 text-sm"
        >
          {data?.tracking_number}
        </span>

        <span
          style={{ color: "#1e2939" }}
          className="name-display z-20 absolute text-sm top-0 mt-[275px]"
        >
          {data?.full_name}
        </span>

        <span
          style={{ color: "#1e2939" }}
          className="name-display z-20 absolute text-sm top-0 mt-[295px] ml-[20px]"
        >
          {data?.sub_clan}, {data?.clan}
        </span>

        <img
          className="absolute z-20 mt-[390px] h-28 w-28 mr-98"
          src={data?.supporting_doc}
          alt="doc"
        />
        <img
          className="absolute z-20 mt-[390px] h-28 w-28 mr-28"
          src={qrCode}
          alt="qrCode"
        />

        <img
          className="absolute z-20 mt-[380px] h-28 w-28 ml-[280px]"
          src={signature.src}
          alt="Signature"
        />

        <img
          className="absolute z-20 mt-[360px] h-24 w-60 ml-[280px]"
          src={stamp.src}
          alt="stamp"
        />

        {/* Background img Container */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={certificateImg.src}
            alt="Certificate Background"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  }
});

CertificateTemplate.displayName = "CertificateTemplate";

export default CertificateGenerator;
