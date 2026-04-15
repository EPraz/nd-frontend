import { useProjectData } from "@/src/context/ProjectDataProvider";
import { buildAlertsFeedItems } from "./alertsFeed.shared";
import { useMemo } from "react";
export type { AlertItem, AlertSeverity } from "./alertsFeed.shared";

export function useAlertsFeedData() {
  const { certificates, maintenance, loading, error, refresh } =
    useProjectData();

  const data = useMemo(
    () => buildAlertsFeedItems(certificates, maintenance),
    [certificates, maintenance],
  );

  return {
    data,
    isLoading: loading.certificates || loading.maintenance,
    error: error.certificates ?? error.maintenance,
    refetch: refresh.all,
  };
}
