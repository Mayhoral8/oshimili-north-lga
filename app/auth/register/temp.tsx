"use client";
import React, { useState } from "react";
import { Formik, Form, ErrorMessage, Field } from "formik";
import { Eye, EyeOff, Lock, LogIn, Mail, User } from "lucide-react";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import heroImage from "../../../assets/landing-page/hero-img.png";
import Image from "next/image";
import Link from "next/link";

interface SignupFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: string;
}

const Page = () => {
  const signupSchema = Yup.object().shape({
    first_name: Yup.string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters")
      .required("First name is required"),
    last_name: Yup.string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters")
      .required("Last name is required"),
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      )
      .required("Password is required"),
    confirm_password: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Please confirm your password"),
    role: Yup.string().required("Please select a role"),
  });

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
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

  const handleSignup = async (values: SignupFormData) => {
    console.log("Signup values:", values);
    // Handle signup logic here
    alert("Signup successful! (Check console for values)");
  };
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-screen bg-white   p-4 border border-green-400">
      <div className="w-full flex flex-row items-center h-full border-red-400  gap-x-4">
        <div className="w-1/2 h-[95%] items-center ">
          <Image
            src={heroImage}
            alt="hero-image"
            // objectFit="cover"
            // objectPosition="cover"
            className="h-full"
          />
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-8 border-red-400 w-1/2 h-full flex flex-col items-center justify-center ">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full mb-4">
              <LogIn className="text-white" size={18} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to your account to continue'
            </p>
          </div>
          <Formik
            initialValues={{
              first_name: "",
              last_name: "",
              email: "",
              password: "",
              confirm_password: "",
              role: "",
            }}
            validationSchema={signupSchema}
            onSubmit={handleSignup}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    name="first_name"
                    placeholder="First Name"
                    icon={<User size={20} />}
                  />
                  <InputField
                    name="last_name"
                    placeholder="Last Name"
                    icon={<User size={20} />}
                  />
                </div>

                <InputField
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  icon={<Mail size={20} />}
                />

                {/* <SelectField
                    name="role"
                    options={roleOptions}
                  /> */}

                <InputField
                  name="password"
                  placeholder="Create a password"
                  icon={<Lock size={20} />}
                  showPasswordToggle
                  showPassword={showPassword}
                  togglePassword={() => setShowPassword(!showPassword)}
                />

                <InputField
                  name="confirm_password"
                  placeholder="Confirm your password"
                  icon={<Lock size={20} />}
                  showPasswordToggle
                  showPassword={showConfirmPassword}
                  togglePassword={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                />

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the{" "}
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>
              </Form>
            )}
          </Formik>
          <div className="pt-2 text-gray-800 flex gap-x-2">
            <span>Already have an account?</span>
            <Link href={"/auth/login"}>
              <span className="text-[#007AFF] font-medium">Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
