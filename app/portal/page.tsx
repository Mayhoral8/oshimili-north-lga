"use client";
import React, { useContext, useEffect, useState } from "react";

import * as Yup from "yup";
import Navbar from "@/components/navbar";
import PersonalDetails from "./PersonalDetails";
import FamilyDetails from "./FamilyDetails";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import DocumentUpload from "./DocumentUpload";
import Preview from "./Preview";
import { CreateContext } from "@/Context";
import Approved from "./Approved";
import EditDetails from "@/components/EditDetails";
import Review from "./Review";
import Paid from "./Paid";

// For this example, I'll create a simplified validation system
interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string;
  residentialAddress: string;
}

interface FormErrors {
  [key: string]: string;
}

const Page: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const initialValues = {
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    email: "",
    residentialAddress: "",
  };
  const { data: session } = useSession();
  const {
    currentStep,
    setCurrentStep,
    uploadMode,
    applicationStatus,
    setApplicationStatus,
  } = useContext(CreateContext).portal;

  const handleProceed = () => {
    // Mark all fields as touched
    const allTouched: { [key: string]: boolean } = {};
    // Object.keys(formData).forEach((key) => {
    //   allTouched[key] = true;
    // });

    // if (validateForm()) {
    //   setCurrentStep(2);
    //   console.log('Form data:', formData);
    // }
  };

  const steps = [
    { number: 1, title: "Personal Information", active: currentStep === 1 },
    { number: 2, title: "Family Details", active: currentStep === 2 },
    { number: 3, title: "Document Upload", active: currentStep === 3 },
    {
      number: 4,
      title: "Preview/Submission",
      active: currentStep === 4,
    },
    {
      number: 5,
      title: "Payment",
      active: currentStep === 5,
    },
    {
      number: 6,
      title: "Review",
      active: currentStep === 6,
    },
    {
      number: 7,
      title: "Certificate Generation",
      active: currentStep === 7,
    },
  ];

  // console.log(currentStep, steps);

  const getApplications = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/lgo/my-apps`,
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("An error occured");
      }
      const responseData = await response.json();

      return responseData.results;
    } catch (err) {
      // setIsLoading(false);

      console.error(err);
    }
  };
  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });

  useEffect(() => {
    if (applications?.data?.length >= 1) {
      const activeApplicationTemp =
        applications?.data?.[applications?.data?.length - 1];

      if (
        activeApplicationTemp?.application_step === 4 &&
        activeApplicationTemp?.status === "payment_pending"
      ) {
        setCurrentStep(activeApplicationTemp.application_step + 1);
      } else if (
        activeApplicationTemp?.application_step === 4 &&
        activeApplicationTemp?.status === "paid"
      ) {
        setCurrentStep(activeApplicationTemp.application_step + 2);
      } else if (
        activeApplicationTemp?.application_step === 4 &&
        activeApplicationTemp?.status === "approved"
      ) {
        setCurrentStep(activeApplicationTemp.application_step + 3);
      } else {
        setCurrentStep(activeApplicationTemp?.application_step + 1);
      }
      setApplicationStatus(activeApplicationTemp.status);
    }
  }, [applications]);

  return (
    <main className="w-screen max-h-screen">
      <Navbar />
      <EditDetails />

      <div className=" bg-gray-50 flex lg:flex-row flex-col gap-x-8 px-4  lg:px-16 border  items-center w-full pt-20">
        {/* Main Content */}

        {/* Left Sidebar */}
        <div className="lg:w-[40%] h-screen hidden lg:flex bg-[#F4F5FA] items-center">
          <div className=" rounded-lg p-6 ">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Apply for Local Government of Origin Certificate
            </h1>
            <p className="text-gray-600 mb-8">
              This certificate confirms your indigeneship of Ethiope East LGA.
              Please provide accurate details and required documents.
            </p>

            {/* Step Indicator */}
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={step.number} className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      step.active
                        ? "bg-primary-purple text-white"
                        : currentStep > step.number
                        ? "bg-green-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`font-medium ${
                      step.active ? "text-primary-purple" : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:w-[55%] w-full h-full  text-white lg:px-5 p relative flex justify-center">
          {isLoading ? (
            <div className="flex items-center justify-center w-full h-screen z-30">
              <Loader2 size={64} className="animate-spin" color="#007AFF" />
            </div>
          ) : currentStep === 1 ? (
            <div>
              <span
                style={{ color: "#101828" }}
                className="text-xl font-bold lg:hidden"
              >
                1. Personal Details{" "}
              </span>
              <PersonalDetails />
            </div>
          ) : currentStep === 2 ? (
            <div>
              <span
                style={{ color: "#101828" }}
                className="text-xl font-bold lg:hidden"
              >
                2. Family Details{" "}
              </span>
              <FamilyDetails />
            </div>
          ) : currentStep === 3 ? (
            <div>
              <span
                style={{ color: "#101828" }}
                className="text-xl font-bold lg:hidden"
              >
                3. Document Upload{" "}
              </span>
              <DocumentUpload />
            </div>
          ) : currentStep === 4 ? (
            <div>
              <span
                style={{ color: "#101828" }}
                className="text-xl font-bold lg:hidden"
              >
                4. Preview{" "}
              </span>
              <Preview />
            </div>
          ) : currentStep === 5 ? (
            <div>
              <span
                style={{ color: "#101828" }}
                className="text-xl font-bold lg:hidden"
              >
                5. Payment{" "}
              </span>
              <Approved />
            </div>
          ) : currentStep === 6 ? (
            <div>
              <span
                style={{ color: "#101828" }}
                className="text-xl font-bold lg:hidden"
              >
                6. Review{" "}
              </span>
              <Review />
            </div>
          ) : currentStep === 7 ? (
            <div className="flex flex-col items-center justify-center">
              <span
                style={{ color: "#101828" }}
                className="text-xl font-bold lg:hidden"
              >
                7. Get Certificate{" "}
              </span>

              <Paid />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
};

export default Page;
