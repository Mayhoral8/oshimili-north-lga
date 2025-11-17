import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
type Props = {
  pageNumber: number;
  totalPages: number;
  goToPage: (destinationPage: string) => void;
  prefetchNextPage: () => void;
};

const TableNavigator: React.FC<Props> = ({
  pageNumber,
  totalPages,
  goToPage,
  prefetchNextPage,
}) => {
  return (
    <article className="min-h-10 bg-white py-[8px] rounded-[8px] mt-4 mx-46 flex items-center text-sm text-[#8C8C8C] justify-between p-1">
      <span>
        Page {pageNumber} of {totalPages}
      </span>
      <div className="flex flex-row items-center gap-x-2">
        <ChevronLeft
          className={`border-solid border-[1px] text-4xl rounded-full hover:border-[#2C698D] hover:text-[#2C698D] cursor-pointer ${
            pageNumber <= 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => pageNumber > 1 && goToPage(String(pageNumber - 1))}
        />
        <ChevronRight
          className={`border-solid border-[1px] text-4xl rounded-full hover:border-[#2C698D] hover:text-[#2C698D] transition-all cursor-pointer  ${
            pageNumber >= totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onMouseEnter={prefetchNextPage} // Prefetch on hover
          onClick={() => pageNumber < totalPages && goToPage(String(pageNumber + 1))}
        />
      </div>
    </article>
  );
};

export default TableNavigator;
