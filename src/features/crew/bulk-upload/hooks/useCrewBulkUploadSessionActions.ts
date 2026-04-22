import { useState } from "react";
import {
  commitCrewBulkUploadSession,
  discardCrewBulkUploadSession,
  downloadCrewBulkUploadTemplate,
  reuploadCrewBulkUploadSession,
} from "../api/crewBulkUpload.api";
import type {
  CreateCrewBulkUploadSessionInput,
  CrewBulkUploadSessionDto,
} from "../contracts/crewBulkUpload.contract";

export function useCrewBulkUploadSessionActions(
  projectId: string,
  sessionId?: string,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function commit(): Promise<CrewBulkUploadSessionDto> {
    if (!sessionId) throw new Error("Missing session id");
    setLoading(true);
    setError(null);
    try {
      return await commitCrewBulkUploadSession(projectId, sessionId);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function discard(): Promise<CrewBulkUploadSessionDto> {
    if (!sessionId) throw new Error("Missing session id");
    setLoading(true);
    setError(null);
    try {
      return await discardCrewBulkUploadSession(projectId, sessionId);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function reupload(
    input: CreateCrewBulkUploadSessionInput,
  ): Promise<CrewBulkUploadSessionDto> {
    if (!sessionId) throw new Error("Missing session id");
    setLoading(true);
    setError(null);
    try {
      return await reuploadCrewBulkUploadSession(projectId, sessionId, input);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function downloadTemplate(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      await downloadCrewBulkUploadTemplate(projectId);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { commit, discard, reupload, downloadTemplate, loading, error };
}
