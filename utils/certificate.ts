import certificateImg from "@/assets/certificate.png";
import signature from "@/assets/sign.png";
export interface CertificateData {
  full_name: string;
  tracking_number: string;
  date_of_birth: string;
  lga_of_origin: string;
  state_of_origin: string;
  clan: string;
  sub_clan: string;
  father_name: string;
  mother_name: string;
  issue_date?: string;
  authorized_signature?: string;
  authorized_name?: string;
  authorized_title?: string;
}

const createCertificateHTML = (data: CertificateData): string => {
  const currentDate = new Date().toLocaleDateString("en-GB");
  
  return `
    <div style="
      position: relative;
      width: 595px;
      height: 540px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
      background: white;
    ">
      <!-- Date -->
      <div style="
        position: absolute;
        top: 120px;
        left: 360px;
        font-size: 14px;
        color: #1e2939;
        z-index: 20;
      ">
        ${currentDate}
      </div>

      <!-- Tracking Number -->
      <div style="
        position: absolute;
        top: 55px;
        right: 350px;
        font-size: 14px;
        color: #1e2939;
        z-index: 20;
      ">
        ${data.tracking_number}
      </div>

      <!-- Full Name -->
      <div style="
        position: absolute;
        top: 280px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 14px;
        color: #1e2939;
        z-index: 20;
        text-align: center;
      ">
        ${data.full_name}
      </div>

      <!-- LGA Info -->
      <div style="
        position: absolute;
        top: 300px;
        left: 150px;
        font-size: 14px;
        color: #1e2939;
        z-index: 20;
      ">
        ${data.lga_of_origin}
      </div>

      <!-- Background Image -->
      <img 
        src="${certificateImg.src}" 
        alt="Certificate Background"
        style="
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          z-index: 1;
        "
      />

      <!-- Signature -->
      <img 
        src="${signature.src}"
        alt="Signature"
        style="
          position: absolute;
          top: 380px;
          left: 72%;
          transform: translateX(-50%);
          height: 64px;
          width: 64px;
          z-index: 20;
        "
      />
    </div>
  `;
};


export const downloadCertificatePDF = async (data: CertificateData): Promise<void> => {
  try {
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    // Create temporary element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = createCertificateHTML(data);
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    document.body.appendChild(tempDiv);

    // Generate canvas
    const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    // Remove temporary element
    document.body.removeChild(tempDiv);

    // Create PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Certificate_${data.tracking_number}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
};

// Preview PDF in new tab
export const previewCertificatePDF = async (data: CertificateData): Promise<void> => {
  try {
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    // Create temporary element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = createCertificateHTML(data);
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    document.body.appendChild(tempDiv);

    // Generate canvas
    const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    // Remove temporary element
    document.body.removeChild(tempDiv);

    // Create PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    // Open in new tab
    const pdfBlob = pdf.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  } catch (error) {
    console.error("Error previewing PDF:", error);
    throw new Error("Failed to preview PDF");
  }
};