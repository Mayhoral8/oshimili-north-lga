import React from "react";
import { createContext, useState } from "react";
import { usePathname } from "next/navigation";

interface ContextTypes {
  modal: {
    showModal: boolean;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    errMsg: string;
    setErrMsg: React.Dispatch<React.SetStateAction<string>>;
  };
  loader: {
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    skeletalLoading: boolean;
    setSkeletalLoading: React.Dispatch<React.SetStateAction<boolean>>;
  };
  auth: {
    showSignOutModal: boolean;
    setShowSignOutModal: React.Dispatch<React.SetStateAction<boolean>>;
  };
  portal: {
    uploadMode: string;
    setUploadMode: React.Dispatch<React.SetStateAction<"edit" | "normal">>;
    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    applicationStatus: string;
    setApplicationStatus: React.Dispatch<
      React.SetStateAction<
        "pending" | "submitted_for_review" | "approved" | "rejected" | ""
      >
    >;
  };
}
export const CreateContext = createContext({} as ContextTypes);

const ContextProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  // Other states

  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [skeletalLoading, setSkeletalLoading] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<"edit" | "normal">("normal");
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationStatus, setApplicationStatus] = useState<
    "pending" | "submitted_for_review" | "approved" | "rejected" | ""
  >("");

  return (
    <CreateContext.Provider
      value={{
        modal: {
          showModal,
          setShowModal,
          errMsg,
          setErrMsg,
        },
        loader: {
          isLoading,
          setIsLoading,
          skeletalLoading,
          setSkeletalLoading,
        },
        auth: {
          showSignOutModal,
          setShowSignOutModal,
        },
        portal: {
          uploadMode,
          setUploadMode,
          currentStep,
          setCurrentStep,
          applicationStatus,
          setApplicationStatus
        },
      }}
    >
      {children}
    </CreateContext.Provider>
  );
};

export default ContextProvider;
