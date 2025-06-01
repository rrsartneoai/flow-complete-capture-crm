
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DocumentUploader from "./DocumentUploader";
import SignatureCapture from "./SignatureCapture";
import CompletionScreen from "./CompletionScreen";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useReminderSystem } from "@/hooks/useReminderSystem";
import { syncToCRM, retryFailedSync, type CRMData } from "@/utils/crmIntegration";
import { CheckCircle, Circle, Clock, AlertTriangle, RefreshCw } from "lucide-react";

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
  uploaded: boolean;
  verified: boolean;
  file?: File;
}

const DocumentCollectionFlow = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [crmSyncStatus, setCrmSyncStatus] = useState<'pending' | 'success' | 'failed' | 'syncing'>('pending');
  const [documents, setDocuments] = useState<DocumentType[]>([
    {
      id: "proof-id",
      name: "Proof of ID",
      description: "Driver's license, passport, or state ID",
      required: true,
      uploaded: false,
      verified: false,
    },
    {
      id: "proof-address",
      name: "Proof of Address",
      description: "Utility bill or bank statement (last 3 months)",
      required: true,
      uploaded: false,
      verified: false,
    },
    {
      id: "bank-statement",
      name: "Bank Statement",
      description: "Most recent bank statement showing payment",
      required: true,
      uploaded: false,
      verified: false,
    },
    {
      id: "written-summary",
      name: "Written Summary",
      description: "Brief description of your situation",
      required: true,
      uploaded: false,
      verified: false,
    },
    {
      id: "authorization",
      name: "Authorization Form",
      description: "Signed authorization document",
      required: true,
      uploaded: false,
      verified: false,
    },
  ]);
  
  const [signatureCompleted, setSignatureCompleted] = useState(false);
  const [workflowCompleted, setWorkflowCompleted] = useState(false);

  // Initialize reminder system
  const reminderSystem = useReminderSystem({
    enabled: true,
    incompleteDocumentDelay: 30, // 30 minutes for demo (would be longer in production)
    missingSignatureDelay: 60, // 1 hour for demo
    userContact: user?.email || ""
  });

  const steps = [
    "Document Upload",
    "Electronic Signature", 
    "Final Review"
  ];

  // Load existing submission data
  useEffect(() => {
    if (user) {
      loadSubmissionData();
    }
  }, [user]);

  // Set up reminders based on current state
  useEffect(() => {
    if (!user) return;

    const allDocsVerified = documents.every(doc => doc.verified);
    const hasIncompleteRequiredDocs = documents.some(doc => doc.required && !doc.verified);

    if (hasIncompleteRequiredDocs && !allDocsVerified) {
      reminderSystem.scheduleIncompleteReminder();
    } else {
      reminderSystem.cancelReminder("incomplete");
    }

    if (allDocsVerified && !signatureCompleted) {
      reminderSystem.scheduleSignatureReminder();
    } else {
      reminderSystem.cancelReminder("signature");
    }

    return () => {
      reminderSystem.cancelReminder("incomplete");
      reminderSystem.cancelReminder("signature");
    };
  }, [documents, signatureCompleted, user, reminderSystem]);

  const loadSubmissionData = async () => {
    if (!user) return;

    try {
      // Get user's submission
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (submissionError && submissionError.code !== 'PGRST116') {
        console.error('Error loading submission:', submissionError);
        return;
      }

      if (submission) {
        setSubmissionId(submission.id);
        setCrmSyncStatus(submission.crm_synced ? 'success' : 'pending');
        
        if (submission.status === 'completed') {
          setWorkflowCompleted(true);
          setCurrentStep(2);
          return;
        }
        if (submission.signature_data) {
          setSignatureCompleted(true);
        }
      }

      // Get user's documents
      const { data: userDocuments, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id);

      if (docsError) {
        console.error('Error loading documents:', docsError);
        return;
      }

      if (userDocuments && userDocuments.length > 0) {
        setDocuments(prev => prev.map(doc => {
          const userDoc = userDocuments.find(ud => ud.document_type === doc.id);
          if (userDoc) {
            return {
              ...doc,
              uploaded: true,
              verified: userDoc.verification_status === 'verified'
            };
          }
          return doc;
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const totalDocuments = documents.length;
  const uploadedDocuments = documents.filter(doc => doc.verified).length;
  const progress = (uploadedDocuments / totalDocuments) * 100;

  const handleDocumentUploaded = async (documentId: string, file: File, verified: boolean) => {
    if (!user) return;

    try {
      // Save document to database
      const { error } = await supabase
        .from('documents')
        .upsert({
          user_id: user.id,
          document_type: documentId,
          file_name: file.name,
          verification_status: verified ? 'verified' : 'failed',
          ocr_data: { filename: file.name, size: file.size }
        });

      if (error) {
        console.error('Error saving document:', error);
        toast({
          title: "Save Error",
          description: "Failed to save document. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, uploaded: true, verified, file }
          : doc
      ));

      if (verified) {
        toast({
          title: "Document Verified",
          description: `${documents.find(d => d.id === documentId)?.name} has been successfully verified.`,
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "Please re-upload a clear, readable document.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error handling document upload:', error);
    }
  };

  const handleSignatureComplete = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          signature_data: 'signature_captured',
          agreement_signed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving signature:', error);
        return;
      }

      setSignatureCompleted(true);
      toast({
        title: "Signature Captured",
        description: "Your electronic signature has been recorded successfully.",
      });
    } catch (error) {
      console.error('Error handling signature:', error);
    }
  };

  const canProceedToSignature = documents.every(doc => doc.verified);
  const canComplete = canProceedToSignature && signatureCompleted;

  const handleCompleteWorkflow = async () => {
    if (!user || !submissionId) return;

    try {
      setCrmSyncStatus('syncing');

      // Update submission status
      const { error: updateError } = await supabase
        .from('submissions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error completing workflow:', updateError);
        setCrmSyncStatus('failed');
        return;
      }

      // Prepare CRM data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const crmData: CRMData = {
        userId: user.id,
        userProfile: {
          firstName: profile?.first_name || "",
          lastName: profile?.last_name || "",
          email: profile?.email || user.email || "",
          phone: profile?.phone || undefined
        },
        documents: documents.map(doc => ({
          type: doc.id,
          fileName: doc.file?.name || "",
          verified: doc.verified,
          uploadDate: new Date().toISOString()
        })),
        signature: {
          signed: signatureCompleted,
          signedAt: new Date().toISOString()
        },
        submissionId,
        completedAt: new Date().toISOString()
      };

      // Sync to CRM
      const syncResult = await syncToCRM(crmData);

      if (syncResult.success) {
        setCrmSyncStatus('success');
        toast({
          title: "Workflow Complete",
          description: "All documents verified and data sent to CRM system.",
        });
        setWorkflowCompleted(true);
        setCurrentStep(2);
      } else {
        setCrmSyncStatus('failed');
        toast({
          title: "CRM Sync Failed",
          description: syncResult.error || "Failed to sync with CRM. Will retry automatically.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error completing workflow:', error);
      setCrmSyncStatus('failed');
      toast({
        title: "Error",
        description: "Failed to complete workflow. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRetryCrmSync = async () => {
    if (!submissionId) return;

    setCrmSyncStatus('syncing');
    toast({
      title: "Retrying CRM Sync",
      description: "Attempting to sync data with CRM system...",
    });

    const result = await retryFailedSync(submissionId);
    
    if (result.success) {
      setCrmSyncStatus('success');
      toast({
        title: "CRM Sync Successful",
        description: "Data has been successfully synced to CRM system.",
      });
    } else {
      setCrmSyncStatus('failed');
      toast({
        title: "CRM Sync Failed",
        description: result.error || "Failed to sync with CRM system.",
        variant: "destructive",
      });
    }
  };

  if (workflowCompleted) {
    return <CompletionScreen />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <Card className="p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Application Progress</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {uploadedDocuments} of {totalDocuments} documents verified
            </span>
            {crmSyncStatus === 'failed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryCrmSync}
                className="flex items-center space-x-1 text-orange-600 border-orange-200"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Retry CRM Sync</span>
              </Button>
            )}
          </div>
        </div>
        <Progress value={progress} className="mb-4" />
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center space-x-2 ${
                index <= currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : index === currentStep ? (
                  <Clock className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
                <span className="text-sm font-medium">{step}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* CRM Sync Status Indicator */}
        {currentStep >= 1 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">CRM Sync Status:</span>
              {crmSyncStatus === 'success' && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Synced</span>
                </div>
              )}
              {crmSyncStatus === 'syncing' && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Syncing...</span>
                </div>
              )}
              {crmSyncStatus === 'failed' && (
                <div className="flex items-center space-x-1 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Failed</span>
                </div>
              )}
              {crmSyncStatus === 'pending' && (
                <div className="flex items-center space-x-1 text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Pending</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Current Step Content */}
      {currentStep === 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Upload Required Documents</h3>
          <div className="space-y-6">
            {documents.map((document) => (
              <DocumentUploader
                key={document.id}
                document={document}
                onDocumentUploaded={handleDocumentUploaded}
              />
            ))}
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button
              onClick={() => setCurrentStep(1)}
              disabled={!canProceedToSignature}
              className="px-8"
            >
              Proceed to Signature
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 1 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Electronic Signature</h3>
          <SignatureCapture 
            onSignatureComplete={handleSignatureComplete}
            completed={signatureCompleted}
          />
          
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(0)}
            >
              Back to Documents
            </Button>
            <Button
              onClick={handleCompleteWorkflow}
              disabled={!canComplete || crmSyncStatus === 'syncing'}
              className="px-8"
            >
              {crmSyncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Complete Application'
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DocumentCollectionFlow;
