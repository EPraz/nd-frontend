import { useProjectData } from "@/src/context";

export function useCertificatesData() {
  const { certificates, loading, error, refresh } = useProjectData();

  return {
    data: certificates,
    isLoading: loading.certificates,
    error: error.certificates,
    refetch: refresh.certificates,
  };
}
