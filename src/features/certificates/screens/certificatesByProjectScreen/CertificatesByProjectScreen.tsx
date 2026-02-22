import { Button, PageHeader, StatCard } from "@/src/components";
import { useCertificatesPageData } from "@/src/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { CertificatesTable } from "../../components";
import { CertificateDto } from "../../contracts";
import { CertificateQuickViewModal } from "../certificateQuickViewModal";

export default function CertificatesByProjectScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateDto | null>(null);

  const page = useCertificatesPageData(pid);

  return (
    <View className="gap-6 p-4 web:p-6">
      <PageHeader
        title="Certificates"
        subTitle="Monitor certificate validity and compliance across vessels."
      />

      <View className="gap-2 xl:gap-5 flex flex-row flex-wrap items-center justify-start xl:justify-between">
        <StatCard
          loading={page.isLoading || !!page.error}
          iconName="documents-outline"
          iconLib="ion"
          title="Total Certificates"
          value={String(page.stats.total)}
          suffix="in this project"
          badgeValue={String(page.stats.critical)}
          badgeColor={page.stats.critical > 0 ? "fail" : "success"}
          badgeLabel="critical items"
        />

        <StatCard
          loading={page.isLoading || !!page.error}
          iconName="alert-circle-outline"
          iconLib="ion"
          title="Expired"
          value={String(page.stats.expired)}
          suffix="require immediate action"
          badgeValue={page.stats.expired > 0 ? "CRITICAL" : "OK"}
          badgeColor={page.stats.expired > 0 ? "fail" : "success"}
          badgeLabel="status"
        />

        <StatCard
          loading={page.isLoading || !!page.error}
          iconName="time-outline"
          iconLib="ion"
          title="Expiring Soon"
          value={String(page.stats.expiringSoon)}
          suffix="upcoming renewals"
          badgeValue={page.stats.expiringSoon > 0 ? "ATTN" : "OK"}
          badgeColor={page.stats.expiringSoon > 0 ? "fail" : "success"}
          badgeLabel="status"
        />

        <StatCard
          loading={page.isLoading || !!page.error}
          iconName="checkmark-circle-outline"
          iconLib="ion"
          title="Valid"
          value={String(page.stats.valid)}
          suffix="currently compliant"
          badgeValue={String(page.stats.pending)}
          badgeColor={page.stats.pending > 0 ? "fail" : "success"}
          badgeLabel="pending"
        />
      </View>

      <View className="flex-1 gap-4">
        <Button
          variant="default"
          size="sm"
          className="rounded-full self-end"
          onPress={() => router.push(`/projects/${pid}/certificates/new`)}
        >
          + Add Certificate
        </Button>
        <CertificatesTable
          title="Certificates"
          subtitleRight="Sorted by expiry"
          data={page.list}
          isLoading={page.isLoading}
          error={page.error}
          onRetry={page.refetch}
          showVesselColumn
          sortByExpiry
          selectedRowId={selectedCertificate?.id ?? null}
          onRowPress={(row) => setSelectedCertificate(row)}
        />

        {selectedCertificate && (
          <CertificateQuickViewModal
            certificate={selectedCertificate}
            projectId={pid}
            onClose={() => setSelectedCertificate(null)}
          />
        )}
      </View>
    </View>
  );
}
