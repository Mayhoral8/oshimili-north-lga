"use client";
import {
  CheckCircle2Icon,
  CreditCard,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import React, { useState, useEffect, useRef, useContext } from "react";
import { CreateContext } from "@/Context";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";


interface PaymentResponse {
  reference: string;
  payment_url?: string;
  status: string;
  message?: string;
}

interface VerificationResponse {
  payment_status: "paid" | "pending" | "failed";
  message?: string;
  data?: any;
}

const Approved = () => {
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "verifying" | "success" | "failed"
  >("idle");
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [pollingCount, setPollingCount] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxPollingAttempts = 60; // 5 minutes (60 attempts × 5 seconds)
    const { setCurrentStep } = useContext(CreateContext).portal;
  

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

  const [applicationId, setApplicationId] = useState(""); // Replace with actual ID
  useEffect(() => {
    if (applications?.data?.length) {
      const activeApplicationTemp =
        applications?.data?.[applications?.data?.length - 1];
      setApplicationId(activeApplicationTemp?.id);
    }
  }, [applications]);

  // Get application ID from URL params or props - adjust as needed

  const initializePayment = async () => {
    if (!session?.user?.accessToken) {
      toast.error("Authentication required", {
        duration: Infinity,
        dismissible: true,
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("processing");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/lgo/${applicationId}/pay/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data: PaymentResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment initialization failed");
      }

      setPaymentReference(data.reference);

      // If there's an authorization URL (like Paystack), redirect user
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        // If no redirect URL, start polling immediately
        startPolling(data.reference);
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      setPaymentStatus("failed");
      toast.error(
        error instanceof Error
          ? error.message
          : "Payment initialization failed",
        {
          duration: Infinity,
          dismissible: true,
        }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (
    reference: string
  ): Promise<VerificationResponse> => {
    if (!session?.user?.accessToken) {
      throw new Error("Authentication required");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/lgo/verify/${reference}/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data: VerificationResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Payment verification failed");
    }

    return data;
  };

  const startPolling = (reference: string) => {
    setPaymentStatus("verifying");
    setPollingCount(0);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const result = await verifyPayment(reference);

        setPollingCount((prev) => prev + 1);

        if (result.payment_status === "paid") {
          setPaymentStatus("success");
          stopPolling();
          toast.success(
            "Payment successful! You can now download your certificate.",
            {
              duration: Infinity,
              dismissible: true,
            }
          );
          setCurrentStep(6)
        } else if (result.payment_status === "failed") {
          setPaymentStatus("failed");
          stopPolling();
          toast.error("Payment failed. Please try again.", {
            duration: Infinity,
            dismissible: true,
          });
        } else if (pollingCount >= maxPollingAttempts) {
          setPaymentStatus("failed");
          stopPolling();
          toast.error(
            "Payment verification timed out. Please contact support if payment was deducted.",
            {
              duration: Infinity,
              dismissible: true,
            }
          );
        }
        // Continue polling if status is still 'pending'
      } catch (error) {
        console.error("Payment verification error:", error);
        if (pollingCount >= maxPollingAttempts) {
          setPaymentStatus("failed");
          stopPolling();
          toast.error(
            "Unable to verify payment status. Please contact support.",
            {
              duration: Infinity,
              dismissible: true,
            }
          );
        }
      }
    }, 5000); // Poll every 5 seconds
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Check URL params for payment callback (if using redirect flow)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get("reference");
    
    // const status = urlParams.get("status");

    if (reference) {
      setPaymentReference(reference);
      startPolling(reference);
    } else if (!reference) {
      return;
    }

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, []);

  const getStatusDisplay = () => {
    switch (paymentStatus) {
      case "processing":
        return {
          icon: <Loader className="text-blue-500 animate-spin" size={48} />,
          title: "Initializing Payment...",
          subtitle: "Please wait while we set up your payment",
        };
      case "verifying":
        return {
          icon: <Loader className="text-yellow-500 animate-spin" size={48} />,
          title: "Verifying Payment...",
          subtitle: `Checking payment status... (${pollingCount}/${maxPollingAttempts})`,
        };
      case "success":
        return {
          icon: <CheckCircle className="text-green-500" size={48} />,
          title: "Payment Successful!",
          subtitle: "Your certificate is now ready for download",
        };
      case "failed":
        return {
          icon: <AlertCircle className="text-red-500" size={48} />,
          title: "Payment Failed",
          subtitle: "Please try again or contact support",
        };
      default:
        return {
          icon: <CheckCircle2Icon className="text-green-400" size={64} />,
          title: "Your Application has been submitted.",
          subtitle: "Complete your payment to continue",
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="text-lg text-gray-900 flex items-center justify-center flex-col gap-y-6 min-h-screen p-6">
      <div className="flex flex-col items-center gap-y-4 max-w-md text-center">
        <span>{status.icon}</span>

        <span className="text-xl font-bold">{status.title}</span>

        <span className="text-gray-600 text-base">{status.subtitle}</span>

        {/* Payment Reference Display */}
        {paymentReference && (
          <div className="bg-gray-100 p-3 rounded-lg w-full">
            <p className="text-sm text-gray-600 mb-1">Payment Reference:</p>
            <p className="font-mono text-sm font-medium">{paymentReference}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          {paymentStatus === "idle" && (
            <button
              onClick={initializePayment}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 bg-primary-purple text-white px-6 py-3 rounded-lg hover:bg-secondary-purple disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay Now
                </>
              )}
            </button>
          )}

          {paymentStatus === "failed" && (
            <button
              onClick={initializePayment}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 bg-primary-purple text-white px-6 py-3 rounded-lg hover:bg-secondary-purple disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Retry Payment
                </>
              )}
            </button>
          )}

          {paymentStatus === "verifying" && (
            <button
              onClick={stopPolling}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors w-full"
            >
              Cancel Verification
            </button>
          )}

          {paymentStatus === "success" && (
            <button
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors w-full"
              onClick={() => {
                // Navigate to certificate download or trigger download
                console.log("Navigate to certificate download");
              }}
            >
              <CheckCircle className="w-4 h-4" />
              Download Certificate
            </button>
          )}
        </div>

        {/* Progress indicator for verification */}
        {paymentStatus === "verifying" && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-purple h-2 rounded-full transition-all duration-300"
              style={{ width: `${(pollingCount / maxPollingAttempts) * 100}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Approved;
