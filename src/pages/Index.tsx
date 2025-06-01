
import { useState } from "react";
import DocumentCollectionFlow from "@/components/DocumentCollectionFlow";
import { Card } from "@/components/ui/card";
import { Shield, FileCheck, Signature, Database } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SecureFlow</h1>
              <p className="text-sm text-gray-600">Document Collection & Verification Platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Complete Your Document Submission
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our secure platform uses advanced OCR technology to verify your documents instantly. 
            Complete all steps to finalize your application.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <FileCheck className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">OCR Verification</h3>
            <p className="text-gray-600">Instant document type verification and data extraction</p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Signature className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">E-Signature</h3>
            <p className="text-gray-600">Secure electronic signature capture and validation</p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Database className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">CRM Integration</h3>
            <p className="text-gray-600">Automatic data sync with your existing systems</p>
          </Card>
        </div>

        {/* Main Document Collection Flow */}
        <DocumentCollectionFlow />
      </div>
    </div>
  );
};

export default Index;
