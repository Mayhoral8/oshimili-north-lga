"use client";
import React, { useContext, useEffect, useState } from "react";
import { CreateContext } from "@/Context";
import { ChevronRight } from "lucide-react";
import { Formik, Field, ErrorMessage, Form } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

interface FormData {
  father_name: string;
  mother_name: string;
}

interface FormErrors {
  [key: string]: string;
}

export interface Application {
  id: string;
  full_name: string;
  date_of_birth: string;
  gender: "male" | "female";
  address: string;
  email: string;
  tracking_number: string;
  created_at: string;
  last_updated_at: string;
  status: "pending" | "approved" | "rejected" | "submitted_for_review";
  clan: "Agbon" | "Abraka Oruarivie" | "Abraka Umiagwa";
  sub_clan: string;
  lga_of_origin: string;
  state_of_origin: string;
  phone_number: string;
  father_name: string;
  mother_name: string;
  supporting_doc: string;
  application_step: number;
  is_draft: boolean;
  approved_by: string | null;
  approved_at: string | null;
}
const FamilyDetails = () => {
  const [initialValues, setInitialValues] = useState({
    father_name: "",
    mother_name: "",
  });

  const { uploadMode, setUploadMode } = useContext(CreateContext).portal;

  const { setCurrentStep } = useContext(CreateContext).portal;

  const getInputClassName = () => {
    const baseClasses =
      "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-primary-purple outline-none transition-colors border-gray-300 text-gray-700";

    return `${baseClasses}`;
  };

  const validationSchema = Yup.object({
    father_name: Yup.string().min(2).required(),
    mother_name: Yup.string().min(2).required(),
  });
  const { setIsLoading } = useContext(CreateContext).loader;

  const { data: session } = useSession();

  const submitFamilyDetails = async (values: FormData, id: string) => {
    let url = "lgo/step2";
    url = uploadMode === "normal" ? url : `${url}/${id}`;
    setIsLoading(true);
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/${url}/`,

        {
          method: uploadMode === "normal" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
          body: JSON.stringify(values),
        }
      );
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Submission failed");
      }
      toast.success("Submission successful");
      if (uploadMode === "edit") {
        setUploadMode("normal");
        setCurrentStep(4);

      } else {
        setCurrentStep(3);
      }
    } catch (err) {
      console.log("Error during signup:", err);
      toast.error("An error occurred Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
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

  const [activeApplication, setActiveApplication] = useState<Application | null>(null);

  useEffect(() => {
    
    if (applications?.data?.length >= 1) {
      const activeApplicationTemp =
        applications?.data?.[applications?.data?.length - 1];
      setActiveApplication(activeApplicationTemp);
      setInitialValues((prev) => {
        return {
          ...prev,
          father_name: activeApplicationTemp?.father_name ?? "",
          mother_name: activeApplicationTemp?.mother_name ?? "",
        };
      });
    }
  }, [applications]);

  return (
    <div className="overflow-y-auto lg:h-[550px] h-screen ">
      <div className="bg-white lg:p-8 p-2">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Family Details
        </h2>
        <p className="text-gray-600 mb-8">
          Provide information about your family and community of origin.
        </p>
        <Formik
          enableReinitialize
          validationSchema={validationSchema}
          initialValues={initialValues}
          onSubmit={(values) => {
            if(activeApplication) {
              submitFamilyDetails(values, activeApplication?.id)
            }
          }}
        >
          {({ errors, setFieldValue }) => {
            console.log(errors);
            return (
              <Form className="space-y-6">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Father's Full Name *
                  </label>
                  <Field
                    type="text"
                    id="father_name"
                    name="father_name"
                    // value={formData.father_name}
                    // onChange={handleInputChange}
                    // onBlur={handleBlur}
                    placeholder="first name   middle name   last name"
                    className={getInputClassName()}
                  />
                  <ErrorMessage
                    name="father_name"
                    component="p"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {/* Middle Name & Last Name */}
                <div className="">
                  <div>
                    <label
                      htmlFor="mother_name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mother's Full Name *
                    </label>
                    <Field
                      type="text"
                      id="mother_name"
                      name="mother_name"
                      // value={formData.mother_name}
                      // onChange={handleInputChange}
                      // onBlur={handleBlur}
                      placeholder="first name   middle name   last name"
                      className={getInputClassName()}
                    />
                    <ErrorMessage
                      name="mother_name"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>
                </div>

                {/* Proceed Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    // onClick={handleProceed}
                    className="w-full bg-primary-purple hover:bg-secondary-purple text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Proceed
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default FamilyDetails;
