
import { useState, useEffect } from "react";
import { sendReminder } from "@/utils/crmIntegration";

interface ReminderConfig {
  enabled: boolean;
  incompleteDocumentDelay: number; // minutes
  missingSignatureDelay: number; // minutes
  userContact: string;
}

export const useReminderSystem = (config: ReminderConfig) => {
  const [reminderTimers, setReminderTimers] = useState<{
    incomplete?: NodeJS.Timeout;
    signature?: NodeJS.Timeout;
  }>({});

  const scheduleReminder = (type: "incomplete" | "signature", delay: number) => {
    if (!config.enabled || !config.userContact) return;

    console.log(`Scheduling ${type} reminder in ${delay} minutes`);

    const timer = setTimeout(() => {
      sendReminder(
        type === "incomplete" ? "incomplete" : "missing_signature",
        config.userContact
      );
    }, delay * 60 * 1000); // Convert minutes to milliseconds

    setReminderTimers(prev => ({
      ...prev,
      [type]: timer,
    }));
  };

  const cancelReminder = (type: "incomplete" | "signature") => {
    const timer = reminderTimers[type];
    if (timer) {
      clearTimeout(timer);
      setReminderTimers(prev => {
        const updated = { ...prev };
        delete updated[type];
        return updated;
      });
      console.log(`Cancelled ${type} reminder`);
    }
  };

  const scheduleIncompleteReminder = () => {
    scheduleReminder("incomplete", config.incompleteDocumentDelay);
  };

  const scheduleSignatureReminder = () => {
    scheduleReminder("signature", config.missingSignatureDelay);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(reminderTimers).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [reminderTimers]);

  return {
    scheduleIncompleteReminder,
    scheduleSignatureReminder,
    cancelReminder,
  };
};
