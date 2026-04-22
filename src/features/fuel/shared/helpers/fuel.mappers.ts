import { formatDate } from "@/src/helpers";
import {
  CreateFuelInput,
  FuelDto,
  FuelFormValues,
  UpdateFuelInput,
} from "../contracts";

function dateOnlyFromIso(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}
function isoFromDateOnly(dateOnly: string): string {
  return `${dateOnly}T00:00:00.000Z`;
}

export function fuelFormFromDto(dto: FuelDto): FuelFormValues {
  return {
    assetId: dto.assetId ?? null,
    date: dateOnlyFromIso(dto.date),
    quantity: String(dto.quantity ?? ""),
    unit: dto.unit,
    note: dto.note ?? "",
    eventType: dto.eventType,
    fuelType: dto.fuelType,
    price: dto.price ?? "",
    currency: dto.currency ?? "",
    location: dto.location ?? "",
  };
}

export function toCreateFuelInput(values: FuelFormValues): CreateFuelInput {
  return {
    date: isoFromDateOnly(values.date.trim()),
    quantity: values.quantity.trim(),
    unit: values.unit,
    note: values.note.trim() || undefined,

    // defaults backend ok, pero si ya tienes UI, puedes mandar:
    eventType: values.eventType,
    fuelType: values.fuelType,

    price: values.price.trim() || undefined,
    currency: values.currency.trim() || undefined,
    location: values.location.trim() || undefined,
  };
}

export function toUpdateFuelInput(values: FuelFormValues): UpdateFuelInput {
  return {
    date: values.date.trim() ? isoFromDateOnly(values.date.trim()) : null,
    quantity: values.quantity.trim(),
    unit: values.unit,

    eventType: values.eventType,
    fuelType: values.fuelType,

    price: values.price.trim() || null,
    currency: values.currency.trim() || null,
    location: values.location.trim() || null,
    note: values.note.trim() || null,
  };
}

export function fuelDisplayTitle(f: FuelDto) {
  return `${f.fuelType} ${f.eventType} · ${f.quantity} ${f.unit} · ${f.location} · ${formatDate(f.date)}`;
}
