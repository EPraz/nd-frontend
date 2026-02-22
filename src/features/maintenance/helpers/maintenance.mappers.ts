import {
  CreateMaintenanceInput,
  MaintenanceDto,
  UpdateMaintenanceInput,
} from "../contracts";
import { MaintenanceFormValues } from "./maintenance.form";

function dateOnlyFromIso(iso: string | null): string {
  if (!iso) return "";
  // "2026-01-31T00:00:00.000Z" -> "2026-01-31"
  return iso.slice(0, 10);
}

function isoFromDateOnly(dateOnly: string): string {
  return `${dateOnly}T00:00:00.000Z`;
}

export function maintenanceFormFromDto(
  dto: MaintenanceDto,
): MaintenanceFormValues {
  return {
    assetId: dto.assetId ?? null,
    selectedVessel: dto.asset ?? null,
    title: dto.title ?? "",
    description: dto.description ?? "",
    dueDate: dateOnlyFromIso(dto.dueDate),
    status: dto.status,
    priority: dto.priority,
  };
}

export function toCreateMaintenanceInput(args: {
  values: MaintenanceFormValues;
  assetId: string; // final (effective)
  allowDefaults?: boolean; // si true no manda status/priority
}): CreateMaintenanceInput {
  const { values, assetId, allowDefaults = true } = args;

  const dueDate = values.dueDate.trim()
    ? isoFromDateOnly(values.dueDate.trim())
    : undefined;

  return {
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    dueDate,
    ...(allowDefaults
      ? {} // backend defaults: OPEN/MEDIUM
      : { status: values.status, priority: values.priority }),
    // assetId va por path en tu endpoint si ya lo tienes así (pid/aid)
    // si tu API lo requiere en body, lo agregas aquí:
    // assetId,
  };
}

export function toUpdateMaintenanceInput(args: {
  values: MaintenanceFormValues;
  allowMoveVessel: boolean;
  assetId: string;
}): UpdateMaintenanceInput {
  const { values } = args;

  const dueDate = values.dueDate.trim()
    ? isoFromDateOnly(values.dueDate.trim())
    : null;

  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    dueDate,
    status: values.status,
    priority: values.priority,
  };
}
