import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCrewCertificateById } from "../api/crewCertificates.api";
import type {
  CrewCertificateDto,
  CrewCertificateRequirementDto,
} from "../contracts";
import {
  summarizeCrewCertificateRequirements,
  summarizeCrewCertificates,
  type CrewCertificateOverviewStats,
} from "../helpers";

function getCertificateLookups(requirements: CrewCertificateRequirementDto[]) {
  const seen = new Set<string>();
  const lookups: {
    assetId: string;
    crewMemberId: string;
    structuredCertificateId: string;
  }[] = [];

  for (const requirement of requirements) {
    if (!requirement.hasStructuredCertificate || !requirement.structuredCertificateId) {
      continue;
    }

    const lookup = {
      assetId: requirement.assetId,
      crewMemberId: requirement.crewMemberId,
      structuredCertificateId: requirement.structuredCertificateId,
    };
    const key = `${lookup.assetId}:${lookup.crewMemberId}:${lookup.structuredCertificateId}`;

    if (seen.has(key)) continue;
    seen.add(key);
    lookups.push(lookup);
  }

  return lookups;
}

function dedupeCertificates(certificates: CrewCertificateDto[]) {
  const seen = new Set<string>();
  const unique: CrewCertificateDto[] = [];

  for (const certificate of certificates) {
    if (seen.has(certificate.id)) continue;
    seen.add(certificate.id);
    unique.push(certificate);
  }

  return unique;
}

export function useCrewCertificateOverviewStatsByProject(
  projectId: string,
  requirements: CrewCertificateRequirementDto[],
) {
  const [certificates, setCertificates] = useState<CrewCertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const certificateLookups = useMemo(
    () => getCertificateLookups(requirements),
    [requirements],
  );

  const refresh = useCallback(async () => {
    if (!projectId) {
      setCertificates([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (certificateLookups.length === 0) {
      setCertificates([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const results = await Promise.allSettled(
      certificateLookups.map((lookup) =>
        fetchCrewCertificateById(
          projectId,
          lookup.assetId,
          lookup.crewMemberId,
          lookup.structuredCertificateId,
        ),
      ),
    );

    const fulfilledCertificates = results
      .filter(
        (
          result,
        ): result is PromiseFulfilledResult<CrewCertificateDto> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);

    setCertificates(dedupeCertificates(fulfilledCertificates));

    const rejected = results.find(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    setError(
      rejected ? "Some certificate details could not be loaded for the expiring stats." : null,
    );
    setLoading(false);
  }, [certificateLookups, projectId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const stats = useMemo<CrewCertificateOverviewStats>(() => {
    return {
      ...summarizeCrewCertificateRequirements(requirements),
      ...summarizeCrewCertificates(certificates),
    };
  }, [certificates, requirements]);

  return { stats, loading, error, refresh };
}
