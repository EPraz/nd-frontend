import { useState } from "react";
import {
  approveCertificate,
  cancelCertificateIngestion,
  deleteCertificateAttachment,
  rejectCertificate,
} from "../api/certificates.api";
import { CertificateDto, CertificateIngestionDto } from "../contracts";

export function useCertificateWorkflowActions(
  projectId: string,
  assetId: string,
  certificateId?: string,
  ingestionId?: string,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function approve(): Promise<CertificateDto> {
    if (!certificateId) throw new Error("Missing certificate id");
    setLoading(true);
    setError(null);
    try {
      return await approveCertificate(projectId, assetId, certificateId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function reject(): Promise<CertificateDto> {
    if (!certificateId) throw new Error("Missing certificate id");
    setLoading(true);
    setError(null);
    try {
      return await rejectCertificate(projectId, assetId, certificateId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function cancelIngestion(): Promise<CertificateIngestionDto> {
    if (!ingestionId) throw new Error("Missing ingestion id");
    setLoading(true);
    setError(null);
    try {
      return await cancelCertificateIngestion(projectId, assetId, ingestionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function removeAttachment(attachmentId: string): Promise<CertificateDto> {
    if (!certificateId) throw new Error("Missing certificate id");
    setLoading(true);
    setError(null);
    try {
      return await deleteCertificateAttachment(
        projectId,
        assetId,
        certificateId,
        attachmentId,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { approve, reject, cancelIngestion, removeAttachment, loading, error };
}
