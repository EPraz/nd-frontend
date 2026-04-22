import { useState } from "react";
import {
  approveCrewCertificate,
  cancelCrewCertificateIngestion,
  deleteCrewCertificate,
  deleteCrewCertificateAttachment,
  rejectCrewCertificate,
} from "../api/crewCertificates.api";

export function useCrewCertificateWorkflowActions(
  projectId: string,
  assetId: string,
  crewId: string,
  certificateId?: string,
  ingestionId?: string,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function wrap<T>(fn: () => Promise<T>) {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    approveCertificate: () => {
      if (!certificateId) throw new Error("Missing certificate id.");
      return wrap(() => approveCrewCertificate(projectId, assetId, crewId, certificateId));
    },
    rejectCertificate: () => {
      if (!certificateId) throw new Error("Missing certificate id.");
      return wrap(() => rejectCrewCertificate(projectId, assetId, crewId, certificateId));
    },
    cancelIngestion: () => {
      if (!ingestionId) throw new Error("Missing ingestion id.");
      return wrap(() => cancelCrewCertificateIngestion(projectId, assetId, crewId, ingestionId));
    },
    deleteAttachment: (attachmentId: string) => {
      if (!certificateId) throw new Error("Missing certificate id.");
      return wrap(() =>
        deleteCrewCertificateAttachment(projectId, assetId, crewId, certificateId, attachmentId),
      );
    },
    deleteCertificate: () => {
      if (!certificateId) throw new Error("Missing certificate id.");
      return wrap(() => deleteCrewCertificate(projectId, assetId, crewId, certificateId));
    },
  };
}
