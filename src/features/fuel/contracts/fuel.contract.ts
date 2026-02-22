import { AssetDto } from "@/src/contracts/assets.contract";

export type FuelEventType =
  | "BUNKERED"
  | "CONSUMED"
  | "TRANSFERRED"
  | "ADJUSTMENT";
export type FuelType = "MGO" | "VLSFO" | "HSFO" | "LNG" | "OTHER";
export type FuelUnit = "L" | "MT";

export type FuelDto = {
  id: string;
  assetId: string;
  date: string;
  eventType: FuelEventType;
  fuelType: FuelType;
  quantity: string;
  unit: FuelUnit;
  price: string | null;
  currency: string | null;
  location: string | null;
  note: string | null;
  createdAt: string;
  asset: AssetDto;
};

export type CreateFuelInput = {
  date: string; // ISO
  quantity: string; // Decimal string
  unit?: FuelUnit;
  eventType?: FuelEventType;
  fuelType?: FuelType;
  price?: string;
  currency?: string;
  location?: string;
  note?: string;
};

export type UpdateFuelInput = {
  date: string | null; // ISO o null
  quantity: string; // decimal string
  unit: FuelUnit;

  price: string | null;
  currency: string | null;
  location: string | null;
  note: string | null;

  eventType: FuelEventType;
  fuelType: FuelType;
};
