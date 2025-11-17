"use client";
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useContext,
} from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  Upload,
  X,
  Crop,
  RotateCw,
  ZoomIn,
  Image as LucideImage,
} from "lucide-react";
import { Application } from "../portal/FamilyDetails";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CreateContext } from "@/Context";
import Image from "next/image";

interface UploadedFile {
  file: File;
  cloudinaryUrl?: string;
  uploading: boolean;
  error?: string;
  success: boolean;
  preview?: string;
  fileType?: string;
}

interface URLFile {
  url: string;
  name: string;
  size: string;
  type: string;
  preview?: string;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Passport photo dimensions (in pixels) - 235x300 as required
const PASSPORT_WIDTH = 235;
const PASSPORT_HEIGHT = 300;
const ASPECT_RATIO = PASSPORT_WIDTH / PASSPORT_HEIGHT;

const DocumentUploadWithCrop = () => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [urlFile, setUrlFile] = useState<URLFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewModal, setPreviewModal] = useState<{
    show: boolean;
    url: string;
    type: string;
  }>({
    show: false,
    url: "",
    type: "",
  });
  const { data: session } = useSession();
  // Crop state
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null
  );
  const { uploadMode, setUploadMode, setCurrentStep } =
    useContext(CreateContext).portal;
  const { setIsLoading } = useContext(CreateContext).loader;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

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

  const [activeApplication, setActiveApplication] =
    useState<Application | null>(null);

  useEffect(() => {
    if (applications?.data?.length) {
      const activeApplicationTemp =
        applications?.data?.[applications?.data?.length - 1];
      setActiveApplication(activeApplicationTemp);
      if (activeApplicationTemp?.supporting_doc) {
        setUrlFile({
          url: activeApplicationTemp?.supporting_doc ?? "",
          size: "",
          name: "",
          type: "",
        });
      }
    }
  }, [applications]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i];
  };

  const getFileTypeFromUrl = (url: string): string => {
    const extension = url.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return "image";
      case "pdf":
        return "pdf";
      default:
        return "file";
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return "Only JPEG, PNG, and WEBP image files are allowed";
    }

    return null;
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: CropArea,
    rotation = 0
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, "image/jpeg");
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);

    if (validationError) {
      const preview = await createPreview(file);
      setUploadedFile({
        file,
        uploading: false,
        error: validationError,
        success: false,
        preview,
        fileType: file.type,
      });
      return;
    }

    // Show crop modal for all images
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageToCrop(e.target?.result as string);
      setOriginalFile(file);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async () => {
    if (!croppedAreaPixels || !imageToCrop || !originalFile) return;

    try {
      const croppedBlob = await getCroppedImg(
        imageToCrop,
        croppedAreaPixels,
        rotation
      );

      const croppedFile = new File([croppedBlob], originalFile.name, {
        type: "image/jpeg",
      });

      const preview = await createPreview(croppedFile);

      setUploadedFile({
        file: croppedFile,
        uploading: true,
        success: false,
        preview,
        fileType: croppedFile.type,
      });

      setShowCropModal(false);
      setImageToCrop("");
      setOriginalFile(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);

      handleUpload(croppedFile);
    } catch (error) {
      console.error("Crop error:", error);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "illusion");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/don4jzbar/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload to Cloudinary");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      throw new Error("Cloudinary upload failed");
    }
  };

  const uploadToBackend = async (cloudinaryUrl: string) => {
    setIsLoading(true);
    let url = "lgo/step3";
    url =
      uploadMode === "normal" ? `${url}/` : `${url}/${activeApplication?.id}`;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/${url}`,
        {
          method: uploadMode === "normal" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
          body: JSON.stringify({ supporting_doc: cloudinaryUrl }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save document to backend");
      }

      toast.success("Document Upload Successful");
      if (uploadMode === "edit") {
        setUploadMode("normal");
      } else {
        setCurrentStep(4);
      }
      return await response.json();
    } catch (error) {
      throw new Error("Backend upload failed");
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);

      const cloudinaryUrl = await uploadToCloudinary(file);

      setUploadedFile((prev) =>
        prev ? { ...prev, cloudinaryUrl, uploading: true } : null
      );

      setUploadedFile((prev) =>
        prev ? { ...prev, uploading: false, success: true } : null
      );

      const newUrlFile: URLFile = {
        url: cloudinaryUrl,
        name: file.name,
        size: formatFileSize(file.size),
        type: getFileTypeFromUrl(cloudinaryUrl),
        preview: uploadedFile?.preview,
      };

      setUrlFile(newUrlFile);
    } catch (error) {
      setUploadedFile((prev) =>
        prev
          ? {
              ...prev,
              uploading: false,
              error: error instanceof Error ? error.message : "Upload failed",
              success: false,
            }
          : null
      );
    } finally {
      setIsUploading(false);
    }
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = () => {
    setUrlFile(null);
    setUploadedFile(null);
  };

  const openPreview = (url: string, type: string) => {
    setPreviewModal({ show: true, url, type });
  };

  const closePreview = () => {
    setPreviewModal({ show: false, url: "", type: "" });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleProceed = () => {
    if (canProceed && urlFile) {
      uploadToBackend(urlFile.url);
    }
  };

  // Simple crop handler for demonstration
  const handleManualCrop = useCallback(() => {
    if (!imageRef.current || !cropContainerRef.current) return;

    const container = cropContainerRef.current;
    const img = imageRef.current;

    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    // Calculate crop area based on container size and aspect ratio
    const cropWidth = Math.min(containerRect.width * 0.8, imgRect.width);
    const cropHeight = cropWidth / ASPECT_RATIO;

    const x = (imgRect.width - cropWidth) / 2;
    const y = (imgRect.height - cropHeight) / 2;

    setCroppedAreaPixels({
      x: x * (img.naturalWidth / imgRect.width),
      y: y * (img.naturalHeight / imgRect.height),
      width: cropWidth * (img.naturalWidth / imgRect.width),
      height: cropHeight * (img.naturalHeight / imgRect.height),
    });
  }, []);

  const hasFile = urlFile || uploadedFile;
  const canProceed =
    hasFile && (!uploadedFile || uploadedFile.success) && !isUploading;

  const FileIcon: React.FC<{ type: string; className?: string }> = ({
    type,
    className = "w-4 h-4",
  }) => {
    return <LucideImage className={`${className} text-blue-600`} />;
  };

  return (
    <div className="w-full mx-auto p-8 h-screen flex flex-col lg:justify-center bg-gray-50">
      <div className="max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Document Upload
          </h1>
          <p className="text-gray-600 text-sm">
            Upload your passport photograph (235x300px recommended)
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Upload Passport Photograph
          </h3>

          {!hasFile ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 bg-white"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-xs text-gray-400">
                  Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {urlFile && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <FileIcon type={urlFile.type} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {urlFile.name || "Passport Photograph"}
                      </p>
                      <p className="text-xs text-gray-500">{urlFile.size}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <button
                      onClick={() => openPreview(urlFile.url, urlFile.type)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Preview file"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={removeFile}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {!uploadedFile && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-center text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 bg-white"
                >
                  Replace file
                </button>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          />

          {uploadedFile?.error && (
            <div className="mt-3">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{uploadedFile.error}</span>
              </p>
            </div>
          )}
        </div>

        {isUploading && uploadedFile && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Uploading file...</span>
              <span>{uploadedFile.success ? "Complete" : "In progress"}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{
                  width: uploadedFile.success ? "100%" : "50%",
                }}
              />
            </div>
          </div>
        )}

        <button
          onClick={() => handleProceed()}
          disabled={!canProceed}
          className="w-full bg-primary-purple hover:bg-secondary-purple text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              Proceed
              <ChevronRight className="ml-2 w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-[#00000060] bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col ">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Crop Passport Photograph
              </h3>
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setImageToCrop("");
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-800 font-bold border rounded-md" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div
                ref={cropContainerRef}
                className="relative bg-[#0000005c] rounded-lg overflow-hidden mx-auto py-20 lg:py-10"
                style={{ maxWidth: "600px", maxHeight: "600px" }}
              >
                <img
                  ref={imageRef}
                  src={imageToCrop}
                  alt="Crop"
                  className="w-full h-auto "
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: "center",
                    transition: "transform 0.2s",
                  }}
                  onLoad={handleManualCrop}
                />
                <div
                  className="absolute border-2 border-white border-dashed pointer-events-none"
                  style={{
                    top: "10%",
                    left: "10%",
                    width: "80%",
                    aspectRatio: `${ASPECT_RATIO}`,
                  }}
                />
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                    <ZoomIn className="w-4 h-4" />
                    Zoom: {zoom.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                    <RotateCw className="w-4 h-4" />
                    Rotation: {rotation}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setImageToCrop("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                className="flex-1 px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-secondary-purple transition-colors flex items-center justify-center gap-2"
              >
                <Crop className="w-4 h-4" />
                Apply Crop & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal.show && (
        <div className="fixed inset-0 bg-[#00000062] bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl h-[50%] w-[80%] lg:w-[25%] overflow-auto relative flex items-center justify-center">
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-700 font-bold" />
            </button>

            <div className="p-6 h-full w-full mx-auto flex items-center justify-center">
              <img
                src={previewModal.url}
                alt="Preview"
                className=" h-full rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadWithCrop;
