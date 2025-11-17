"use client";
import React, { useContext, useState } from "react";
import PersonalDetails from "@/app/portal/PersonalDetails";
import DocumentUpload from "@/app/portal/DocumentUpload";
import FamilyDetails from "@/app/portal/FamilyDetails";
import { CreateContext } from "@/Context";
import { X } from "lucide-react";

const EditDetails = () => {
  const { uploadMode, setUploadMode, currentStep, setCurrentStep } =
    useContext(CreateContext).portal;
  
  if (uploadMode === "edit") {
    return (
      <div className="flex fixed top-0 bottom-0 right-0 left-0 items-center justify-center z-30 bg-[#00000061]  backdrop-blur-sm">
        <div className="lg:h-[90vh] h-[85vh] lg:w-[50%] w-[90%] bg-white p-4 rounded-l flex flex-col gap-y-4 items-center justify-center">
          <X
            size={32}
            className="text-gray-800 border rounded-md block ml-auto"
            onClick={() => {
              setUploadMode("normal");
              setCurrentStep(4);
            }}
          />
          {currentStep === 1 ? (
            <PersonalDetails />
          ) : currentStep === 2 ? (
            <FamilyDetails />
          ) : currentStep === 3 ? (
            <DocumentUpload />
          ) : null}
        </div>
      </div>
    );
  }
};

export default EditDetails;
