
export interface CRMData {
  documents: {
    id: string;
    name: string;
    verified: boolean;
    fileUrl?: string;
  }[];
  signatureCompleted: boolean;
  userInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  timestamp: string;
  referenceId: string;
}

export const sendToCRM = async (data: CRMData, webhookUrl?: string): Promise<boolean> => {
  try {
    console.log("Sending data to CRM:", data);

    // If webhook URL is provided, use it; otherwise simulate CRM integration
    if (webhookUrl) {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          source: "SecureFlow Document Collection",
          status: "completed",
        }),
      });

      return response.ok;
    } else {
      // Simulate CRM API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful integration
      console.log("CRM Integration successful:", {
        recordId: `CRM-${Date.now()}`,
        status: "created",
        data,
      });
      
      return true;
    }
  } catch (error) {
    console.error("CRM integration failed:", error);
    return false;
  }
};

export const sendReminder = async (type: "incomplete" | "missing_signature", userContact: string): Promise<void> => {
  console.log(`Sending ${type} reminder to:`, userContact);
  
  const messages = {
    incomplete: "Reminder: Please complete your document upload to continue with your application.",
    missing_signature: "Reminder: Your electronic signature is required to finalize your application.",
  };

  // Simulate sending reminder (SMS/Email)
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log("Reminder sent:", messages[type]);
};

export const updateGHLTags = async (contactId: string, tags: string[]): Promise<void> => {
  console.log("Updating GHL tags for contact:", contactId, "with tags:", tags);
  
  // Simulate GHL API call to update tags
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log("GHL tags updated successfully");
};
