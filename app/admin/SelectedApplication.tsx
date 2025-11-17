import React, { useContext, useState } from "react";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  X,
  Check,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { formatDate, getStatusBadge } from "@/utils/admin";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CreateContext } from "@/Context";
import { useQueryClient } from "@tanstack/react-query";

interface Application {
  id: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  address: string;
  email: string;
  tracking_number: string;
  created_at: string;
  last_updated_at: string;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "submitted_for_review"
    | "submitted for review"
    | "paid";
  clan: string;
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

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: "approve" | "reject";
  applicationName: string;
  trackingNumber: string;
  isLoading: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  applicationName,
  trackingNumber,
  isLoading,
}) => {
  if (!isOpen) return null;

  const isApprove = action === "approve";
  const actionText = isApprove ? "Approve" : "Reject";
  const actionColor = isApprove ? "green" : "red";
  const bgColor = isApprove ? "bg-green-50" : "bg-red-50";
  const iconColor = isApprove ? "text-green-600" : "text-red-600";
  const buttonColor = isApprove
    ? "bg-green-600 hover:bg-green-700"
    : "bg-red-600 hover:bg-red-700";

  return (
    <div className="fixed inset-0 bg-[#00000061] bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div
            className={`flex items-center gap-3 p-4 ${bgColor} rounded-lg mb-4`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isApprove ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {isApprove ? (
                <CheckCircle className={`w-5 h-5 ${iconColor}`} />
              ) : (
                <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {actionText} 
              </h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-700 mb-3">
              Are you sure you want to{" "}
              <span className="font-semibold text-gray-900">{action}</span> this
              application?
            </p>

            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Applicant:</span>
                <span className="text-sm font-medium text-gray-900">
                  {applicationName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Tracking Number:</span>
                <span className="text-sm font-mono font-medium  text-gray-900">
                  {trackingNumber}
                </span>
              </div>
            </div>

            {isApprove && (
              <p className="text-sm text-green-700 mt-3 p-3 bg-green-50 rounded-lg">
                ✓ The applicant will be notified and can then proceed to pay.
              </p>
            )}

            {!isApprove && (
              <p className="text-sm text-red-700 mt-3 p-3 bg-red-50 rounded-lg">
                ✗ The applicant will be notified of the rejection.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${buttonColor}`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  {isApprove ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  {actionText} 
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SelectedApplication: React.FC<{
  selectedApplication: Application;
  setSelectedApplication: React.Dispatch<
    React.SetStateAction<Application | null>
  >;
}> = ({ selectedApplication, setSelectedApplication }) => {
  const { data: session } = useSession();
  const { setIsLoading } = useContext(CreateContext).loader;
  const queryClient = useQueryClient();

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    action: "approve" | "reject";
    applicationId: string;
  }>({
    isOpen: false,
    action: "approve",
    applicationId: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "approved":
        return <CheckCircle className="w-3 h-3" />;
      case "rejected":
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: "approve" | "reject"
  ) => {
    setIsProcessing(true);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/localgov-applications/${applicationId}/`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: newStatus === "approve" ? "approved" : "rejected",
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Submission failed");
      }

      toast.success(`Application ${newStatus} successfully`);
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });

      // Close modal and selected application
      setConfirmationModal({
        isOpen: false,
        action: "approve",
        applicationId: "",
      });
      setSelectedApplication(null);
    } catch (err) {
      // console.log("Error during status update:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const openConfirmationModal = (action: "approve" | "reject") => {
    setConfirmationModal({
      isOpen: true,
      action,
      applicationId: selectedApplication.id,
    });
  };

  const closeConfirmationModal = () => {
    if (!isProcessing) {
      setConfirmationModal({
        isOpen: false,
        action: "approve",
        applicationId: "",
      });
    }
  };

  const confirmAction = () => {
    handleStatusUpdate(
      confirmationModal.applicationId,
      confirmationModal?.action
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#00000067] bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Application Details
              </h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Personal Information
                </h3>

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-700">Full Name</p>
                    <p className="font-medium text-gray-600">
                      {selectedApplication.full_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-700">Date of Birth</p>
                    <p className="font-medium text-gray-600">
                      {formatDate(selectedApplication.date_of_birth)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-700">Gender</p>
                    <p className="font-medium text-gray-600 capitalize">
                      {selectedApplication.gender}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-700">Phone Number</p>
                    <p className="font-medium text-gray-600">
                      {selectedApplication.phone_number}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-700">Email</p>
                    <p className="font-medium text-gray-600">{selectedApplication.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-700">Address</p>
                    <p className="font-medium text-gray-600">{selectedApplication.address}</p>
                  </div>
                </div>
              </div>

              {/* Family & Origin Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Family & Origin Details
                </h3>

                <div>
                  <p className="text-sm text-gray-700">Father's Name</p>
                  <p className="font-medium text-gray-600">
                    {selectedApplication.father_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-700">Mother's Name</p>
                  <p className="font-medium text-gray-600">
                    {selectedApplication.mother_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-700">Clan</p>
                  <p className="font-medium text-gray-600">{selectedApplication.clan}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-700">Sub-Clan</p>
                  <p className="font-medium text-gray-600">{selectedApplication.sub_clan}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-700">LGA of Origin</p>
                  <p className="font-medium- text-gray-600">
                    {selectedApplication.lga_of_origin
                      .replace("-", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-700">State of Origin</p>
                  <p className="font-medium text-gray-600">
                    {selectedApplication.state_of_origin}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-700">Supporting Document</p>
                  <a
                    href={selectedApplication.supporting_doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#007AFF] hover:underline text-sm"
                  >
                    View Document
                  </a>
                </div>
              </div>
            </div>

            {/* Application Status & Actions */}
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Application Status
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-700">Tracking Number</p>
                      <p className="font-mono font-medium text-gray-600">
                        {selectedApplication.tracking_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">Current Status</p>
                      <span
                        className={getStatusBadge(selectedApplication.status)}
                      >
                        {getStatusIcon(selectedApplication.status)}
                        {selectedApplication.status.charAt(0).toUpperCase() +
                          selectedApplication.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">Created</p>
                      <p className="font-medium text-gray-500">
                        {formatDate(selectedApplication.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">Last Updated</p>
                      <p className="font-medium">
                        {formatDate(selectedApplication.last_updated_at)}
                      </p>
                    </div>
                    {selectedApplication.approved_by && (
                      <div>
                        <p className="text-sm text-gray-700">Processed By</p>
                        <p className="font-medium">
                          {selectedApplication.approved_by}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {(selectedApplication.status === "submitted_for_review" ||
                  selectedApplication.status === "submitted for review" ||
                  selectedApplication.status === "paid") && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Actions
                    </h3>
                    <div className="flex gap-3 ">
                      <button
                        onClick={() => openConfirmationModal("approve")}
                        disabled={isProcessing}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 lg:text-sm text-xs"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => openConfirmationModal("reject")}
                        disabled={isProcessing}
                        className="flex items-center gap-2 bg-red-600 text-white lg:px-4 px-2 py-4 w-fit rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 lg:text-sm text-xs"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmAction}
        action={confirmationModal.action}
        applicationName={selectedApplication.full_name}
        trackingNumber={selectedApplication.tracking_number}
        isLoading={isProcessing}
      />
    </>
  );
};

export default SelectedApplication;
