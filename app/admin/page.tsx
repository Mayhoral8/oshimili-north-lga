"use client";
import React, { useEffect, useState, useContext } from "react";
import {
  Eye,
  Check,
  X,
  Search,
  Filter,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { CreateContext } from "@/Context";
import { formatDate, getStatusBadge } from "@/utils/admin";
import SelectedApplication from "./SelectedApplication";
import TableNavigator from "@/components/TableNavigator";
import { useRouter, useSearchParams } from "next/navigation";

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

const AdminPortal: React.FC = () => {
  const searchParams = useSearchParams();
  const currentParams = new URLSearchParams(searchParams?.toString());
  const page = currentParams.get("page");
  const pageNumber = page ? parseInt(page, 10) : 1;
  const { data: session } = useSession();
  const router = useRouter();

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { setIsLoading } = useContext(CreateContext).loader;
  const queryClient = useQueryClient();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "paid":
        return <Clock className="w-3 h-3" />;
      case "approved":
        return <CheckCircle className="w-3 h-3" />;
      case "rejected":
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getApplicationsAdmin = async (pageNumber: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/localgov-applications?page=${pageNumber}`,
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
      // console.log(responseData);
    } catch (err) {
      // setIsLoading(false);

      console.error(err);
    }
  };
  const { data: applications } = useQuery({
    queryKey: ["admin-applications", pageNumber],
    queryFn: () => getApplicationsAdmin(pageNumber),
  });
  // console.log(applications);

  const [stats, setStats] = useState({
    total: "",
    paid: "",
    rejected: "",
    approved: "",
  });

  const [filteredApplications, setFilteredApplications] = useState<
    Application[]
  >([]);

  useEffect(() => {
    if (applications?.data?.length >= 1) {
      const rawFilteredApps = applications.data?.filter((app: Application) => {
        const matchesSearch =
          app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.tracking_number
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || app.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
      setFilteredApplications(rawFilteredApps);
    }
  }, [applications, searchTerm, statusFilter]);

  useEffect(() => {
    if (applications?.data?.length >= 1) {
      setStats({
        total: applications?.data?.length,
        paid: applications.data?.filter(
          (app: Application) => app.status === "paid"
        ).length,
        approved: applications?.data?.filter(
          (app: Application) => app.status === "approved"
        ).length,
        rejected: applications?.data?.filter(
          (app: Application) => app.status === "rejected"
        ).length,
      });
    }
  }, [applications]);

  // console.log(filteredApplications)
  const prefetchNextPage = () => {
    if (applications?.total_pages > pageNumber) {
      queryClient.prefetchQuery({
        queryKey: ["admin-applications", pageNumber + 1],
        queryFn: () => getApplicationsAdmin(pageNumber + 1),
      });
    }
  };
  const goToPage = (newPage: string) => {
    currentParams.set("page", newPage);
    router.push(`?${currentParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#007AFF] rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Certificate Admin Portal
              </h1>
            </div>
            <div className="text-sm text-gray-600">Welcome, Admin User</div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.total}
                </p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.paid}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.approved}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, tracking number, or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="submitted for review">
                  submitted for review
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => {
                  return (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-[#007AFF]" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">
                          {application.tracking_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {application.clan
                            .replace("-", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.sub_clan}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(application.status)}>
                          {getStatusIcon(application.status)}
                          {application.status.charAt(0).toUpperCase() +
                            application.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(application.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedApplication(application)}
                            className="text-[#007AFF] hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredApplications?.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No applications found</p>
            </div>
          )}
        </div>
      </div>
      {/* Application Details Modal */}
      {selectedApplication && (
        <SelectedApplication
          selectedApplication={selectedApplication}
          setSelectedApplication={setSelectedApplication}
        />
      )}
      <TableNavigator
        pageNumber={pageNumber}
        totalPages={applications?.total_pages}
        prefetchNextPage={prefetchNextPage}
        goToPage={goToPage}
      />
      ;
    </div>
  );
};

export default AdminPortal;
