import banner from "@/src/assets/ship-banner-2.jpg";
import { useProjectContext } from "@/src/context";
import { useOverviewKpisData } from "@/src/hooks";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { HeroBanner } from "./HeroBanner";

function alertTone(n: number): "ok" | "warn" | "fail" {
  if (n === 0) return "ok";
  if (n <= 3) return "warn";
  return "fail";
}

export default function OverviewKpisModule() {
  const { data, isLoading, error, refetch } = useOverviewKpisData();
  const { projectName } = useProjectContext();
  const certsAtRisk =
    data.certificates.expiringSoon + data.certificates.expired;
  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      <HeroBanner
        title={projectName ?? "Project Dashboard"}
        source={banner}
        rightTitle="Operational Highlights"
        left={[
          { label: "Project", value: projectName ?? "—" },
          { label: "Fleet", value: `${data.totalVessels} vessels` },
        ]}
        right={[
          {
            label: "Critical alerts",
            value: String(data.criticalAlerts),
            kind: "status",
            statusTone: alertTone(data.criticalAlerts),
          },
          {
            label: "Certs at risk",
            value: String(certsAtRisk),
            kind: "status",
            statusTone:
              certsAtRisk === 0 ? "ok" : certsAtRisk <= 3 ? "warn" : "fail",
          },
          { label: "Crew active", value: String(data.crewActive) },
          { label: "Certificates", value: String(data.certificates.total) },
        ]}
      />
    </ModuleFrame>
  );
}
