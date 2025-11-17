
  export const getStatusBadge = (status: string) => {
    const baseClasses =
      "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1";
    switch (status) {
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  

  export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };