
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DocumentCollectionFlow from "@/components/DocumentCollectionFlow";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, FileCheck, Signature, Database, LogOut, User, Menu } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">SecureFlow</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Document Collection & Verification Platform
                </p>
              </div>
            </div>
            
            {/* Desktop User Info */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">{user.email}</span>
              </div>
              <Button
                variant="outline"
                onClick={signOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={signOut}
                  className="flex items-center justify-center space-x-2 w-full"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Complete Your Document Submission
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            Our secure platform uses advanced OCR technology to verify your documents instantly. 
            Complete all steps to finalize your application.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-12">
          <Card className="p-4 lg:p-6 text-center hover:shadow-lg transition-shadow">
            <FileCheck className="h-8 w-8 lg:h-12 lg:w-12 text-green-600 mx-auto mb-3 lg:mb-4" />
            <h3 className="text-base lg:text-lg font-semibold mb-2">OCR Verification</h3>
            <p className="text-sm lg:text-base text-gray-600">
              Instant document type verification and data extraction
            </p>
          </Card>
          <Card className="p-4 lg:p-6 text-center hover:shadow-lg transition-shadow">
            <Signature className="h-8 w-8 lg:h-12 lg:w-12 text-blue-600 mx-auto mb-3 lg:mb-4" />
            <h3 className="text-base lg:text-lg font-semibold mb-2">E-Signature</h3>
            <p className="text-sm lg:text-base text-gray-600">
              Secure electronic signature capture and validation
            </p>
          </Card>
          <Card className="p-4 lg:p-6 text-center hover:shadow-lg transition-shadow">
            <Database className="h-8 w-8 lg:h-12 lg:w-12 text-purple-600 mx-auto mb-3 lg:mb-4" />
            <h3 className="text-base lg:text-lg font-semibold mb-2">CRM Integration</h3>
            <p className="text-sm lg:text-base text-gray-600">
              Automatic data sync with your existing systems
            </p>
          </Card>
        </div>

        {/* Main Document Collection Flow */}
        <DocumentCollectionFlow />
      </div>
    </div>
  );
};

export default Index;
