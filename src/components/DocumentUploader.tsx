
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileCheck, File, X, CheckCircle, AlertCircle, RotateCcw } from "lucide-react";
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
  const [uploadAttempts, setUploadAttempts] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const maxRetries = 3;

  // Enhanced OCR verification with more detailed feedback
  const simulateOCRVerification = async (file: File): Promise<{
    verified: boolean;
    confidence: number;
    issues?: string[];
  }> => {
    console.log(`Running OCR verification for ${document.name}:`, file.name);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
    
    const fileName = file.name.toLowerCase();
    const fileSize = file.size;
    const issues: string[] = [];
    
    // File size validation
    if (fileSize > 10 * 1024 * 1024) { // 10MB
      issues.push("File size too large (max 10MB)");
    }
    
    if (fileSize < 1024) { // 1KB
      issues.push("File appears to be empty or corrupted");
    }

    // Enhanced verification logic based on document type
    let verified = false;
    let confidence = 0;

    switch (document.id) {
      case "proof-id":
        if (fileName.includes("id") || fileName.includes("license") || fileName.includes("passport")) {
          verified = true;
          confidence = 0.9;
        } else if (fileName.includes("driver") || fileName.includes("permit")) {
          verified = true;
          confidence = 0.85;
        } else {
          issues.push("Document doesn't appear to be a valid ID");
          confidence = 0.3;
        }
        break;
      
      case "proof-address":
        if (fileName.includes("bill") || fileName.includes("statement") || fileName.includes("address")) {
          verified = true;
          confidence = 0.88;
        } else if (fileName.includes("utility") || fileName.includes("bank")) {
          verified = true;
          confidence = 0.82;
        } else {
          issues.push("Document doesn't appear to be a valid address proof");
          confidence = 0.25;
        }
        break;
      
      case "bank-statement":
        if (fileName.includes("bank") || fileName.includes("statement")) {
          verified = true;
          confidence = 0.92;
        } else {
          issues.push("Document doesn't appear to be a bank statement");
          confidence = 0.2;
        }
        break;
      
      case "written-summary":
        if (file.type.includes("text") || fileName.includes("summary") || fileName.includes("description")) {
          verified = true;
          confidence = 0.95;
        } else {
          issues.push("Document should be a text file or written summary");
          confidence = 0.4;
        }
        break;
      
      case "authorization":
        if (fileName.includes("auth") || fileName.includes("signed") || fileName.includes("consent")) {
          verified = true;
          confidence = 0.87;
        } else {
          issues.push("Document doesn't appear to be an authorization form");
          confidence = 0.3;
        }
        break;
      
      default:
        // Random verification for unknown types
        verified = Math.random() > 0.3;
        confidence = verified ? 0.7 + Math.random() * 0.3 : Math.random() * 0.5;
    }

    // Additional quality checks
    if (verified) {
      if (Math.random() < 0.1) { // 10% chance of quality issues
        issues.push("Image quality could be improved - ensure document is clear and well-lit");
        confidence *= 0.8;
      }
      
      if (Math.random() < 0.05) { // 5% chance of completeness issues
        issues.push("Some parts of the document may be cut off");
        verified = false;
        confidence *= 0.6;
      }
    }

    return { verified, confidence, issues: issues.length > 0 ? issues : undefined };
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setLastError(null);
    const currentAttempt = uploadAttempts + 1;
    setUploadAttempts(currentAttempt);
    
    try {
      const result = await simulateOCRVerification(file);
      
      if (result.verified) {
        onDocumentUploaded(document.id, file, true);
        toast({
          title: "Document Verified",
          description: `${document.name} verified with ${Math.round(result.confidence * 100)}% confidence`,
        });
        setUploadAttempts(0);
      } else {
        const errorMessage = result.issues ? result.issues.join("; ") : "Document verification failed";
        setLastError(errorMessage);
        
        onDocumentUploaded(document.id, file, false);
        
        if (currentAttempt >= maxRetries) {
          toast({
            title: "Maximum Retries Reached",
            description: `After ${maxRetries} attempts, please contact support for assistance.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Verification Failed",
            description: `${errorMessage}. You have ${maxRetries - currentAttempt} attempts remaining.`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error processing file:", error);
      setLastError("Processing error occurred");
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
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
    return <File className="h-5 w-5 text-gray-400" />;
  };

  const getStatusColor = () => {
    if (document.verified) return "border-green-200 bg-green-50";
    if (document.uploaded && !document.verified) return "border-red-200 bg-red-50";
    return "border-gray-200";
  };

  const canRetry = uploadAttempts < maxRetries && document.uploaded && !document.verified;

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
            {uploadAttempts > 0 && (
              <p className="text-xs text-orange-600 mt-1">
                Attempts: {uploadAttempts}/{maxRetries}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {document.required && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Required
            </span>
          )}
          {canRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Retry</span>
            </Button>
          )}
        </div>
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
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-600">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
                disabled={uploadAttempts >= maxRetries}
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
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
          />
        </div>
      )}

      {document.uploaded && !document.verified && lastError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-700 font-medium">Verification Issues:</p>
              <p className="text-sm text-red-600 mt-1">{lastError}</p>
              <div className="mt-2 space-y-1 text-xs text-red-600">
                <p>• Ensure the document is clear and well-lit</p>
                <p>• Check that all corners are visible</p>
                <p>• Verify the document type matches what's requested</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {uploadAttempts >= maxRetries && !document.verified && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm text-orange-700 font-medium">Maximum attempts reached</p>
              <p className="text-sm text-orange-600 mt-1">
                Please contact support for assistance with document verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {document.verified && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-700">
              ✓ Document verified successfully
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DocumentUploader;
