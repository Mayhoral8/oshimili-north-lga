import { CircleCheckBig } from "lucide-react";
import React from "react";
import CertificateGenerator from "../document/page";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
const Paid = () => {
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

      return responseData.results;
    } catch (err) {
      console.error(err);
    }
  };
  const { data: applications, isLoading: isApplicationsLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });

  if (applications) {
    return (
      <div className="text-lg flex items-center justify-center flex-col gap-y-4 min-h-screen">
        <span>
          <CircleCheckBig className="" size={64} style={{ color: "#05df72" }} />
        </span>
        <span className="text-xl font-bold" style={{ color: "#101828" }}>
          Application Approved
        </span>
        <CertificateGenerator
          certificateData={applications?.data?.[applications?.data?.length - 1]}
        />
      </div>
    );
  }
};

export default Paid;
