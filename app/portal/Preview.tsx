import React, { useContext, useEffect, useState } from "react";
import { ChevronRight, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { CreateContext } from "@/Context";
import EditDetails from "@/components/EditDetails";
import { toast } from "sonner";
import { Application } from "./FamilyDetails";

interface PersonalInfo {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  emailAddress: string;
  residentialAddress: string;
}

interface FamilyDetails {
  fatherFullName: string;
  motherFullName: string;
  villageOfOrigin: string;
  ward: string;
}

interface UploadedDocument {
  fileName: string;
  fileSize: string;
}

interface PreviewData {
  personalInfo: PersonalInfo;
  familyDetails: FamilyDetails;
  documents: UploadedDocument[];
}

const Preview = () => {
  const [isAgreed, setIsAgreed] = useState(false);
  const { setCurrentStep } = useContext(CreateContext).portal;
  const { setIsLoading } = useContext(CreateContext).loader;

  // Sample data - replace with actual form data
  const previewData: PreviewData = {
    personalInfo: {
      fullName: "James Brown",
      dateOfBirth: "September 4, 2025",
      gender: "Male",
      phoneNumber: "0900 0000 000",
      emailAddress: "jamesbrown@email.com",
      residentialAddress: "Earth, somewhere on the map of the world",
    },
    familyDetails: {
      fatherFullName: "James Brown Snr",
      motherFullName: "Jasmine Brown",
      villageOfOrigin: "James Brown Village",
      ward: "Brown",
    },
    documents: [
      {
        fileName: "My Passport.pdf",
        fileSize: "2.04MB",
      },
    ],
  };
  const { setUploadMode } = useContext(CreateContext).portal;

  const handleEdit = (section: string) => {
    console.log(`Edit ${section} section`);
    // Navigate back to specific step based on section
    setUploadMode("edit");
    switch (section) {
      case "personal":
        setCurrentStep(1);
        break;
      case "family":
        setCurrentStep(2);
        break;
      case "documents":
        setCurrentStep(3);
        break;
    }
  };

  const handleProceedToPayment = async () => {
    if (isAgreed) {
      setIsLoading(true);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/lgo/preview/`,

          {
            method: "POST",
            headers: {
              // "Content-Type": "application/json",
              Authorization: `Bearer ${session?.user?.accessToken}`,
            },
            // body: JSON.stringify(values),
          }
        );
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || "Submission failed");
        }
        toast.success("Submission successful");
        setCurrentStep(5);
        // if (uploadMode === "edit") {
        //   setUploadMode("normal");
        // } else {
        //   setCurrentStep(3);
        // }
      } catch (err) {
        console.log("Error during signup:", err);
        toast.error("An error occurred Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const InfoSection: React.FC<{
    title: string;
    onEdit: () => void;
    children: React.ReactNode;
  }> = ({ title, onEdit, children }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button
          onClick={onEdit}
          className="text-primary-purple text-sm font-medium hover:text-blue-600 transition-colors"
        >
          Edit
        </button>
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
  const { data: session } = useSession();

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
      // console.log(responseData);
      // const { fileUrl, fileName, uploadDate } = responseData;
      // setIsLoading(false);
      return responseData.results;
      console.log(responseData);
    } catch (err) {
      // setIsLoading(false);

      console.error(err);
    }
  };
  const { data: applications, isLoading: isApplicationsLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });

  const [activeApplication, setActiveApplication] =
    useState<Application | null>(null);

  useEffect(() => {
    if (applications?.data?.length >= 1) {
      const activeApplicationTemp =
        applications?.data?.[applications?.data?.length - 1];
      setActiveApplication(activeApplicationTemp);
      const activeApplication =
        applications?.data?.[applications?.data?.length - 1];
      setCurrentStep(activeApplication?.application_step + 1);
    }
  }, [applications]);
  if (activeApplication) {
    return (
      <>
        <EditDetails />
        <div className="max-w-2xl mx-auto bg-white p-6 h-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Preview</h1>
            <p className="text-gray-600 text-sm">
              Upload the required documents to support your application
            </p>
          </div>

          {/* Personal Information Section */}
          <InfoSection
            title="Personal Information"
            onEdit={() => handleEdit("personal")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <InfoRow label="FULL NAME" value={activeApplication?.full_name} />
              <InfoRow
                label="DATE OF BIRTH"
                value={activeApplication?.date_of_birth}
              />
              <InfoRow label="GENDER" value={activeApplication?.gender} />
              <InfoRow
                label="PHONE NUMBER"
                value={activeApplication?.phone_number}
              />
              <InfoRow label="EMAIL ADDRESS" value={activeApplication?.email} />
              <InfoRow
                label="RESIDENTIAL ADDRESS"
                value={activeApplication?.address}
              />
            </div>
          </InfoSection>

          {/* Family Details Section */}
          <InfoSection
            title="Family Details"
            onEdit={() => handleEdit("family")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <InfoRow
                label="FATHER'S FULL NAME"
                value={activeApplication?.father_name}
              />
              <InfoRow
                label="MOTHER'S FULL NAME"
                value={activeApplication?.mother_name}
              />
            </div>
          </InfoSection>

          {/* Document Upload Section */}
          <InfoSection
            title="Document Upload"
            onEdit={() => handleEdit("documents")}
          >
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 font-medium">
                UPLOAD PASSPORT PHOTOGRAPH
              </p>

              {previewData.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-gray-500">{doc.fileSize}</p>
                  </div>
                </div>
              ))}
            </div>
          </InfoSection>

          {/* Declaration Checkbox */}
          <div className="mb-8">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="w-4 h-4 text-primary-purple border-gray-300 rounded focus:ring-primary-purple focus:ring-2 mt-1"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                I hereby declare that the information provided is true and
                correct to the best of my knowledge.
              </span>
            </label>
          </div>

          {/* Proceed to Payment Button */}
          <button
            onClick={handleProceedToPayment}
            disabled={!isAgreed}
            className="w-full bg-primary-purple hover:bg-secondary-purple text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Submit Application
            <ChevronRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </>
    );
  }
};

export default Preview;
