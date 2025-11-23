"use client";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2Icon, Loader2Icon, X } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
  const searchParams = useSearchParams();
  const currentParams = new URLSearchParams(searchParams?.toString());

  const InfoSection: React.FC<{
    title: string;

    children: React.ReactNode;
  }> = ({ title, children }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );

  const InfoRow: React.FC<{
    label: string;
    value: string;
    fullWidth?: boolean;
  }> = ({ label, value, fullWidth = false }) => (
    <div className={`mb-4 ${fullWidth ? "col-span-2" : ""}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-medium">
        {label}
      </p>
      <p className="text-gray-900 font-medium">{value}</p>
    </div>
  );

  const [tracking_number, setTrackingNumber] = useState<string | null>("");

  const getApplication = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/track/${tracking_number}/`
      );

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData?.error === "Application not found") {
          setStatus("failed");
        }
        throw new Error(responseData?.error ?? "An error occured");
      }

      return responseData;
    } catch (err: any) {
      // toast.error(err?.message ?? "An error occured");
      return null;
    }
  };
  const { data: application, isLoading } = useQuery({
    queryKey: ["application"],
    queryFn: getApplication,
    enabled: !!tracking_number,
  });
  const [status, setStatus] = useState("");
  useEffect(() => {
    const rawTrackingNumber = currentParams.get("id");

    setTrackingNumber(rawTrackingNumber);
    if (!rawTrackingNumber) {
      setStatus("error");
    }
  }, [currentParams]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-white flex-col">
        <Loader2Icon
          size={48}
          className="text-6xl animate-spin  text-[#007AFF]"
        />
        <span className="text-4xl font-bold text-gray-800 text-center">
          Verifying
        </span>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="text-lg text-gray-900 flex items-center justify-center flex-col gap-y-4 min-h-screen bg-white">
        <span className="text-xl font-bold text-center">
          Oops! Invalid or no Verification Link
        </span>
      </div>
    );
  }
  if (application) {
    return (
      <div className="text-lg text-gray-900 flex items-center justify-center flex-col gap-y-2 min-h-screen bg-white pt-20">
        <div className="flex flex-col items-center gap-x-2">
          <CheckCircle2Icon className="text-green-400" size={28} />
          <span className="font-bold text-base text-center">
            Application retrieved
          </span>
        </div>
        <div className=" mx-auto lg:max-w-7xl w-full bg-white p-6 h-full ">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 ">
              Application Details
            </h1>
          </div>
          {/* Header */}
          <section className="flex  lg:flex-row flex-col lg:justify-evenly w-full  shadow-md p-2 lg:p-0">

          <InfoSection title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <InfoRow label="FULL NAME" value={application?.full_name} />
              <InfoRow
                label="DATE OF BIRTH"
                value={application?.date_of_birth}
              />
              <InfoRow label="GENDER" value={application?.gender} />
              <InfoRow label="PHONE NUMBER" value={application?.phone_number} />
              <InfoRow label="EMAIL ADDRESS" value={application?.email} />
              <InfoRow
                label="RESIDENTIAL ADDRESS"
                value={application?.address}
              />
            </div>
          </InfoSection>
          <InfoSection title="LGA Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <InfoRow label="LGA" value={application?.lga_of_origin} />
              <InfoRow label="CLAN" value={application?.clan} />
              <InfoRow label="SUB-CLAN" value={application?.sub_clan} />
            </div>
          </InfoSection>
          <InfoSection title="Others">
            <InfoRow label="Tracking Number" value={application?.tracking_number}/>
            <div className="mb-4 grid grid-cols-2 md:grid-cols-2 gap-x-8">
              
            </div>
            <div>

              <Image src={application?.supporting_doc} alt="passport" width={100} height={100}/>
           
            </div>
          </InfoSection>
          </section>

        </div>
      </div>
    );
  }
  if (status === "failed") {
    return (
      <div className="text-lg text-gray-900 flex items-center justify-center flex-col gap-y-4 min-h-screen bg-white">
        <X className="text-red-400 border rounded-full" size={64} />
        <span className="font-bold text-4xl text-center">
          Verification Failed!
        </span>
      </div>
    );
  }
};

export default Page;
