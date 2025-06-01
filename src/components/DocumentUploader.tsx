
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileCheck, File, X, CheckCircle } from "lucide-react";
import type { DocumentType } from "./DocumentCollectionFlow";

interface DocumentUploaderProps {
  document: DocumentType;
  onDocumentUploaded: (documentId: string, file: File, verified: boolean) => void;
}

const DocumentUploader = ({ document, onDocumentUploaded }: DocumentUploaderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate OCR verification
  const simulateOCRVerification = async (file: File): Promise<boolean> => {
    console.log(`Running OCR verification for ${document.name}:`, file.name);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate verification logic based on document type and filename
    const fileName = file.name.toLowerCase();
    let verified = false;

    switch (document.id) {
      case "proof-id":
        verified = fileName.includes("id") || fileName.includes("license") || fileName.includes("passport");
        break;
      case "proof-address":
        verified = fileName.includes("bill") || fileName.includes("statement") || fileName.includes("address");
        break;
      case "bank-statement":
        verified = fileName.includes("bank") || fileName.includes("statement");
        break;
      case "written-summary":
        verified = fileName.includes("summary") || fileName.includes("description") || file.type.includes("text");
        break;
      case "authorization":
        verified = fileName.includes("auth") || fileName.includes("signed");
        break;
      default:
        verified = Math.random() > 0.3; // 70% success rate for demo
    }

    return verified;
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    
    try {
      const verified = await simulateOCRVerification(file);
      onDocumentUploaded(document.id, file, verified);
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Upload Error",
        description: "Failed to process the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const getStatusIcon = () => {
    if (document.verified) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (document.uploaded && !document.verified) {
      return <X className="h-5 w-5 text-red-600" />;
    }
    return <File className="h-5 w-5 text-gray-400" />;
  };

  const getStatusColor = () => {
    if (document.verified) return "border-green-200 bg-green-50";
    if (document.uploaded && !document.verified) return "border-red-200 bg-red-50";
    return "border-gray-200";
  };

  return (
    <Card className={`p-4 ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h4 className="font-medium text-gray-900">{document.name}</h4>
            <p className="text-sm text-gray-600">{document.description}</p>
            {document.uploaded && document.file && (
              <p className="text-xs text-gray-500 mt-1">
                Uploaded: {document.file.name}
              </p>
            )}
          </div>
        </div>
        {document.required && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Required
          </span>
        )}
      </div>

      {!document.verified && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="space-y-2">
              <FileCheck className="h-8 w-8 text-blue-600 mx-auto animate-pulse" />
              <p className="text-sm text-gray-600">Processing with OCR...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-600">
                Drag and drop your file here, or click to browse
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
              >
                Choose File
              </Button>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
        </div>
      )}

      {document.uploaded && !document.verified && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            Document verification failed. Please ensure the document is clear and matches the required type.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2"
          >
            Upload Different File
          </Button>
        </div>
      )}

      {document.verified && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            ✓ Document verified successfully
          </p>
        </div>
      )}
    </Card>
  );
};

export default DocumentUploader;
