
import { supabase } from "@/integrations/supabase/client";

export interface CRMData {
  userId: string;
  userProfile: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  documents: Array<{
    type: string;
    fileName: string;
    verified: boolean;
    uploadDate: string;
  }>;
  signature: {
    signed: boolean;
    signedAt?: string;
  };
  submissionId: string;
  completedAt: string;
}

export interface CRMSyncResult {
  success: boolean;
  crmId?: string;
  error?: string;
  retryable: boolean;
}

export const syncToCRM = async (data: CRMData): Promise<CRMSyncResult> => {
  try {
    console.log("Syncing to CRM:", data);
    
    // Simulate API call to external CRM
    // In production, this would be a real API call
    const response = await simulateCRMSync(data);
    
    if (response.success) {
      // Update submission with CRM sync status
      await supabase
        .from('submissions')
        .update({
          crm_synced: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.submissionId);

      return {
        success: true,
        crmId: response.crmId,
        retryable: false
      };
    }

    return {
      success: false,
      error: response.error,
      retryable: response.retryable
    };

  } catch (error) {
    console.error("CRM sync error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      retryable: true
    };
  }
};

const simulateCRMSync = async (data: CRMData): Promise<{
  success: boolean;
  crmId?: string;
  error?: string;
  retryable: boolean;
}> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Simulate different outcomes
  const outcomes = [
    { success: true, crmId: `CRM-${Date.now()}`, retryable: false },
    { success: false, error: "Network timeout", retryable: true },
    { success: false, error: "Invalid data format", retryable: false },
    { success: true, crmId: `CRM-${Date.now()}`, retryable: false }
  ];
  
  // 80% success rate
  return Math.random() > 0.2 ? outcomes[0] : outcomes[1];
};

export const sendReminder = async (type: "incomplete" | "missing_signature", contact: string) => {
  console.log(`Sending ${type} reminder to ${contact}`);
  
  const messages = {
    incomplete: "📋 Reminder: You have incomplete document uploads. Please complete your submission to proceed.",
    missing_signature: "✍️ Reminder: Please sign your agreement to complete the process."
  };

  // In production, this would send actual SMS/email
  // For now, we'll just log it
  console.log(`SMS to ${contact}: ${messages[type]}`);
  
  // You could integrate with services like Twilio, SendGrid, etc.
  return { sent: true, message: messages[type] };
};

export const retryFailedSync = async (submissionId: string, maxRetries: number = 3): Promise<CRMSyncResult> => {
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    console.log(`CRM sync retry attempt ${retryCount + 1} for submission ${submissionId}`);
    
    // Get submission data
    const { data: submission, error } = await supabase
      .from('submissions')
      .select(`
        *,
        profiles(*),
        documents(*)
      `)
      .eq('id', submissionId)
      .single();

    if (error || !submission) {
      return {
        success: false,
        error: "Submission not found",
        retryable: false
      };
    }

    const crmData: CRMData = {
      userId: submission.user_id,
      userProfile: {
        firstName: submission.profiles?.first_name || "",
        lastName: submission.profiles?.last_name || "",
        email: submission.profiles?.email || "",
        phone: submission.profiles?.phone || undefined
      },
      documents: submission.documents?.map((doc: any) => ({
        type: doc.document_type,
        fileName: doc.file_name,
        verified: doc.verification_status === 'verified',
        uploadDate: doc.created_at
      })) || [],
      signature: {
        signed: !!submission.signature_data,
        signedAt: submission.agreement_signed_at
      },
      submissionId: submission.id,
      completedAt: submission.completed_at || new Date().toISOString()
    };

    const result = await syncToCRM(crmData);
    
    if (result.success || !result.retryable) {
      return result;
    }
    
    retryCount++;
    if (retryCount < maxRetries) {
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
  
  return {
    success: false,
    error: `Failed after ${maxRetries} retry attempts`,
    retryable: false
  };
};
