import React, { useContext, useEffect, useState } from "react";
import { CreateContext } from "@/Context";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Formik, Field, ErrorMessage, Form } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Application } from "./FamilyDetails";
interface FormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone_number: string;
  email: string;
  address: string;
  clan: string;
  sub_clan: string;
}

const CLAN_CHOICES = ["Agbon", "Abraka Oruarivie", "Abraka Umiagwa"];

const SUB_CLAN_CHOICES: Record<ClanType, string[]> = {
  Agbon: [
    "Okpara Inland/Waterside",
    "Kokori Inland",
    "Eku",
    "Orhoakpor",
    "Otorho-Agbon (Isiokolo)",
    "Igun",
    "Ovu-Inland",
    "Okurekpo",
    "Oviorie-Ovu",
    "Samagidi",
  ],
  "Abraka Oruarivie": [
    "Uhruoka",
    "Ekrejeta",
    "Ajalomi",
    "Urhuovie",
    "Ehro",
    "Ugono",
    "Erhirhie",
    "Ogbeje",
    "Otorho",
  ],
  "Abraka Umiagwa": [
    "Orial",
    "Uruagbesa",
    "Umeghe",
    "Ughere",
    "Oteri",
    "Agbarha",
  ],
};
type ClanType = "Agbon" | "Abraka Oruarivie" | "Abraka Umiagwa";

const PersonalDetails = () => {
  const { setCurrentStep } = useContext(CreateContext).portal;

  const { data: session } = useSession();
  const [initialValues, setInitialValues] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone_number: "",
    email: "",
    address: "",
    clan: "",
    sub_clan: "",
  });
  const getInputClassName = () => {
    const baseClasses =
      "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-primary-purple outline-none transition-colors border-gray-300 text-gray-700";

    return `${baseClasses}`;
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    first_name: Yup.string().min(2).required("First name is required"),
    middle_name: Yup.string().min(2).required("Middle name is required"),
    last_name: Yup.string().min(2).required("Last name is required"),
    date_of_birth: Yup.date().required("Date of Birth is required"),
    gender: Yup.string().required("Gender is required"),
    phone_number: Yup.string()
      .required("Phone number is required")
      .max(10, "Field must not be more than 10 digits")
      .min(10, "Field must not be less than 10 digits"),
    address: Yup.string().min(10).required("Residential address is required"),
    clan: Yup.string(),
    sub_clan: Yup.string(),
  });
  const { setIsLoading } = useContext(CreateContext).loader;
  const { uploadMode, setUploadMode } = useContext(CreateContext).portal;

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

  const submitPersonalDetails = async (values: FormData) => {
    if (uploadMode === "edit" && !activeApplication) {
      return;
    }
    const payload1 = {
      ...values,
      full_name: `${values.first_name} ${values.middle_name} ${values.last_name}`,
    };
    const { first_name, middle_name, last_name, ...payload } = payload1;
    let url = "lgo/step1";
    url = uploadMode === "normal" ? url : `${url}/${activeApplication?.id}`;
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
          body: JSON.stringify({
            ...payload,
            state_of_origin: "Delta",
            lga_of_origin: "ethiope-east",
          }),
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
        setCurrentStep(2);
      }
    } catch (err) {
      console.log("Error during signup:", err);
      toast.error("An error occurred Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const [subClanValues, setSubclanValues] = useState<string[]>([]);

  const getSubClans = (clanValue: string) => {
    setSubclanValues((prev) => {
      return SUB_CLAN_CHOICES[clanValue as ClanType] || [];
    });
    // return SUB_CLAN_CHOICES[clanValue as ClanType] || [];
  };

  const [activeApplication, setActiveApplication] =
    useState<Application | null>(null);

  useEffect(() => {
    if (applications?.data?.length >= 1 && uploadMode === "edit") {
      const activeApplicationTemp =
        applications?.data?.[applications?.data?.length - 1];
      setActiveApplication(activeApplicationTemp);
      const fullName = activeApplicationTemp.full_name.split(" ");
      setInitialValues((prev) => {
        return {
          ...prev,
          first_name: fullName[0],
          middle_name: fullName[1],
          last_name: fullName[2],
          gender: activeApplicationTemp.gender,
          date_of_birth: activeApplicationTemp.date_of_birth,
          clan: activeApplicationTemp.clan,
          sub_clan: activeApplicationTemp.sub_clan,
          address: activeApplicationTemp.address,
          email: activeApplicationTemp.email,
          phone_number: activeApplicationTemp.phone_number,
        };
      });
    }
  }, [applications]);

  return (
    <div className="overflow-y-auto lg:h-[550px] h-full w-full">
      <div className="bg-white rounded-lg shadow-sm lg:p-8 px-4 w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600 mb-8">
          Tell us about yourself. Please provide your basic details accurately.
        </p>
        <Formik
          enableReinitialize
          validationSchema={validationSchema}
          initialValues={initialValues}
          onSubmit={(values) => {
            submitPersonalDetails(values);
          }}
        >
          {({ errors, setFieldValue }) => {
            console.log(errors);
            return (
              <Form className="space-y-6 py-4">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="first_name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    First Name *
                  </label>
                  <Field
                    type="text"
                    id="first_name"
                    name="first_name"
                    // value={formData.first_name}
                    // onChange={handleInputChange}
                    // onBlur={handleBlur}
                    placeholder="Enter your first name"
                    className={getInputClassName()}
                  />
                  <ErrorMessage
                    name="first_name"
                    component="p"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {/* Middle Name & Last Name */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="middle_name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Middle Name
                    </label>
                    <Field
                      type="text"
                      id="middle_name"
                      name="middle_name"
                      // value={formData.middle_name}
                      // onChange={handleInputChange}
                      // onBlur={handleBlur}
                      placeholder="Enter your middle name"
                      className={getInputClassName()}
                    />
                    <ErrorMessage
                      name="middle_name"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="last_name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Last Name *
                    </label>
                    <Field
                      type="text"
                      id="last_name"
                      name="last_name"
                      // value={formData.last_name}
                      // onChange={handleInputChange}
                      // onBlur={handleBlur}
                      placeholder="Enter your last name"
                      className={getInputClassName()}
                    />
                    <ErrorMessage
                      name="last_name"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>
                </div>

                {/* Date of Birth & Gender */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="date_of_birth"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Date of Birth *
                    </label>
                    <div className="">
                      <Field
                        type="date"
                        id="date_of_birth"
                        name="date_of_birth"
                        placeholder="DD/MM/YYYY"
                        className={`${getInputClassName} text-gray-900`}
                      />
                      {/* <Calendar className="absolute right-21 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /> */}
                    </div>
                    <ErrorMessage
                      name="date_of_birth"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Gender *
                    </label>
                    <div className="relative">
                      <Field
                        id="gender"
                        name="gender"
                        type="select"
                        as="select"
                        className={`${getInputClassName()} pr-10 appearance-none bg-white`}
                      >
                        <option value="">Select your gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </Field>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    <ErrorMessage
                      name="gender"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number *
                  </label>
                  <div className="flex">
                    <div className="flex items-center px-3 py-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50">
                      <div className="w-6 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-sm mr-2"></div>
                      <span className="text-sm text-gray-600">+234</span>
                      <ChevronDown className="ml-1 w-4 h-4 text-gray-400" />
                    </div>
                    <Field
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      placeholder="8060555123"
                      className={getInputClassName()}
                    />
                  </div>
                  <ErrorMessage
                    name="phone_number"
                    component={"p"}
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <Field
                    type="text"
                    id="email"
                    name="email"
                    placeholder="Enter your email address"
                    className={getInputClassName()}
                  />
                  <ErrorMessage
                    name="email"
                    component={"p"}
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {/* Residential Address */}
                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Residential Address *
                  </label>
                  <Field
                    type="text"
                    id="address"
                    name="address"
                    // value={formData.address}
                    // onChange={handleInputChange}
                    // onBlur={handleBlur}
                    placeholder="Enter your complete residential address"
                    className={getInputClassName()}
                  />
                  <ErrorMessage
                    name="address"
                    component={"p"}
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="clan"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Clan
                  </label>
                  <div className="relative">
                    <Field
                      id="clan"
                      name="clan"
                      type="select"
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        getSubClans(e.target.value);
                        setFieldValue("clan", e.target.value);
                      }}
                      as="select"
                      className={`${getInputClassName()} pr-10 appearance-none bg-white`}
                    >
                      <option value="">Select your clan</option>
                      {CLAN_CHOICES.map((clan: string) => {
                        return (
                          <option key={clan} value={clan}>
                            {clan}
                          </option>
                        );
                      })}
                    </Field>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  <ErrorMessage
                    name="clan"
                    component={"p"}
                    className="mt-1 text-sm text-red-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="sub_clan"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Sub Clan
                  </label>
                  <div className="relative">
                    <Field
                      id="sub_clan"
                      name="sub_clan"
                      type="select"
                      as="select"
                      className={`${getInputClassName()} pr-10 appearance-none bg-white`}
                    >
                      <option value="">Select your sub clan</option>
                      {subClanValues.length >= 1 ? (
                        subClanValues?.map((clan: string) => {
                          return (
                            <option key={clan} value={clan}>
                              {clan}
                            </option>
                          );
                        })
                      ) : (
                        <option>Please select a Clan first</option>
                      )}
                    </Field>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  <ErrorMessage
                    name="sub_clan"
                    component={"p"}
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {/* Proceed Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    // onClick={() => console.log(errors)}
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

export default PersonalDetails;
