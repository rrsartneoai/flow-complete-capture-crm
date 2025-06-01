
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, RefreshCw, Database, FileCheck, Signature } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const CompletionScreen = () => {
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadSummary = async () => {
    setIsDownloading(true);
    // Simulate download process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would generate and download a PDF summary
    console.log("Downloading completion summary...");
    setIsDownloading(false);
  };

  const completionData = {
    submissionId: `SUB-${Date.now()}`,
    completedAt: new Date().toLocaleDateString(),
    documentsVerified: 5,
    crmSynced: true,
    signatureCaptured: true,
    nextSteps: [
      "Your application has been submitted successfully",
      "You will receive a confirmation email within 24 hours",
      "Our team will review your submission and contact you within 3-5 business days",
      "Keep your reference number for future correspondence"
    ]
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Header */}
      <Card className="p-6 lg:p-8 text-center bg-green-50 border-green-200 mb-8">
        <CheckCircle className="h-16 w-16 lg:h-20 lg:w-20 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl lg:text-3xl font-bold text-green-900 mb-2">
          Application Complete!
        </h1>
        <p className="text-lg text-green-700 mb-4">
          Your document submission has been successfully processed and verified.
        </p>
        <div className="bg-white rounded-lg p-4 inline-block border border-green-200">
          <p className="text-sm text-gray-600">Reference Number</p>
          <p className="text-lg font-mono font-semibold text-gray-900">
            {completionData.submissionId}
          </p>
        </div>
      </Card>

      {/* Completion Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        {/* Process Summary */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FileCheck className="h-5 w-5 text-blue-600 mr-2" />
            Process Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Documents Verified</span>
              <span className="font-semibold text-green-600">
                {completionData.documentsVerified}/5
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Electronic Signature</span>
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="font-semibold">Captured</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">CRM Integration</span>
              <div className="flex items-center text-green-600">
                <Database className="h-4 w-4 mr-1" />
                <span className="font-semibold">Synced</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Completed Date</span>
              <span className="font-semibold">{completionData.completedAt}</span>
            </div>
          </div>
        </Card>

        {/* User Information */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Signature className="h-5 w-5 text-purple-600 mr-2" />
            Submission Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Submitted By</label>
              <p className="font-semibold">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Submission ID</label>
              <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                {completionData.submissionId}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-700 font-semibold">Complete</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Next Steps */}
      <Card className="p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">What Happens Next?</h3>
        <div className="space-y-3">
          {completionData.nextSteps.map((step, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                {index + 1}
              </div>
              <p className="text-gray-700">{step}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleDownloadSummary}
            disabled={isDownloading}
            className="flex items-center justify-center space-x-2 flex-1"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Download Summary</span>
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex items-center justify-center space-x-2 flex-1"
          >
            <span>Print Confirmation</span>
          </Button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Important:</strong> Save your reference number ({completionData.submissionId}) 
            for future correspondence. You can also bookmark this page or take a screenshot.
          </p>
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-900">Email Support</p>
            <p className="text-gray-600">support@secureflow.com</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Phone Support</p>
            <p className="text-gray-600">(555) 123-4567</p>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Support hours: Monday - Friday, 9:00 AM - 6:00 PM EST
        </div>
      </Card>
    </div>
  );
};

export default CompletionScreen;
