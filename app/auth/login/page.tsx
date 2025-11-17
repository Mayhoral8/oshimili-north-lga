"use client";
import React, { useState, useContext } from "react";
import { Formik, Form, ErrorMessage, Field } from "formik";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
// import heroImage from "../../../assets/landing-page/hero-img.png";
import Image from "next/image";
import Link from "next/link";
import { getSession, signIn, useSession } from "next-auth/react";
import { CreateContext } from "@/Context";

interface LoginFormData {
  email: string;
  password: string;
}

const Page = () => {
  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });
  const router = useRouter();

  const InputField: React.FC<{
    name: string;
    type?: string;
    placeholder: string;
    icon: React.ReactNode;
    showPasswordToggle?: boolean;
    showPassword?: boolean;
    togglePassword?: () => void;
  }> = ({
    name,
    type = "text",
    placeholder,
    icon,
    showPasswordToggle = false,
    showPassword = false,
    togglePassword,
  }) => (
    <div className="space-y-1">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          {icon}
        </div>
        <Field
          name={name}
          type={
            showPasswordToggle ? (showPassword ? "text" : "password") : type
          }
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-primary-purple outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-sm ml-1"
      />
    </div>
  );

  
  const handleSubmit = async (
    values: LoginFormData,
    { setSubmitting }: any
  ) => {
    // onLoginUser.mutate(formattedPayload);
    try {
      const response = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (!response?.ok) {
        throw new Error(response?.error || "An error occurred");
      }
      const updatedSession = await getSession();
      const userRole = updatedSession?.user?.role;

      // console.log("response", response);
      
      if (userRole === "Admin") {
        router.push("/admin?page=1");
      } else {
        router.push("/portal");
      }
      // setIsLoading(false);
    } catch (error: any) {
      // setErrorMsg(error.message);
      // setShowErrorModal(true);
      console.error("an error  occured");
      // setIsLoading(false);
    } finally {
      setSubmitting(false);
    }
  };
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-screen bg-white p-4">
       <div className="w-full flex lg:flex-row items-center h-full border-red-400  gap-x-4">
        
        {/* Form Container */}
        <div className="bg-white rounded-2xl lg:p-8 border-red-400 lg:w-1/2 w-full h-full flex flex-col items-center justify-center mx-auto ">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-primary-purple rounded-full mb-4">
              <LogIn className="text-white" size={18} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="lg:gap-y-6 gap-y-10 w-full flex flex-col">
                <InputField
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  icon={<Mail size={20} />}
                />

                <InputField
                  name="password"
                  placeholder="Enter your password"
                  icon={<Lock size={20} />}
                  showPasswordToggle
                  showPassword={showPassword}
                  togglePassword={() => setShowPassword(!showPassword)}
                />

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary-purple border-gray-300 rounded focus:ring-primary-purple"
                    />
                    <span className="ml-2 text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-primary-purple hover:secondary-purple font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-purple text-white py-3 px-4 rounded-lg font-medium hover:bg-secondary-purple focus:outline-none focus:ring-2 focus:ring-primary-purple focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </button>
              </Form>
            )}
          </Formik>
          <div className="pt-2 text-gray-800 flex gap-x-2">
            <span>Don't have an account?</span>
            <Link href={"/auth/register"}>
              <span className="text-primary-purple font-medium">Sign Up</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
