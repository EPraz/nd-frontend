import type { ReactNode } from "react";
import { OperationalEditorHeader } from "@/src/components";

type Props = {
  title: string;
  description: string;
  backLabel: string;
  onBack: () => void;
  disabled?: boolean;
  actions: ReactNode;
};

export function VesselEditorHeader({
  title,
  description,
  backLabel,
  onBack,
  disabled,
  actions,
}: Props) {
  return (
    <OperationalEditorHeader
      title={title}
      description={description}
      backLabel={backLabel}
      onBack={onBack}
      disabled={disabled}
      actions={actions}
    />
  );
}
