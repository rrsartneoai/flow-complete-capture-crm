
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Share } from "lucide-react";

const CompletionScreen = () => {
  const handleDownloadReceipt = () => {
    // Simulate downloading a receipt
    console.log("Downloading completion receipt...");
  };

  const handleContactSupport = () => {
    // Open support contact
    console.log("Opening support contact...");
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <Card className="p-8 bg-green-50 border-green-200">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
        
        <h2 className="text-2xl font-bold text-green-900 mb-4">
          Application Complete!
        </h2>
        
        <p className="text-green-700 mb-6">
          Thank you for submitting all required documents. Your application has been successfully 
          processed and all information has been verified and sent to our CRM system.
        </p>

        <div className="bg-white rounded-lg p-6 mb-6 border border-green-200">
          <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
          <ul className="text-left space-y-2 text-gray-700">
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Your documents have been verified and stored securely</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Electronic signature has been captured and validated</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Data has been integrated with our CRM system</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>You will receive updates via SMS and email</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleDownloadReceipt}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download Receipt</span>
          </Button>
          
          <Button
            onClick={handleContactSupport}
            className="flex items-center space-x-2"
          >
            <Share className="h-4 w-4" />
            <span>Contact Support</span>
          </Button>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p>
            <strong>Reference ID:</strong> SEC-{Date.now().toString().slice(-8)}
          </p>
          <p className="mt-2">
            Keep this reference number for your records. You can use it to track 
            your application status or contact support.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default CompletionScreen;
