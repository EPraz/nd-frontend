import { FuelEventType, FuelType, FuelUnit } from "./fuel.contract";

export type FuelFormValues = {
  assetId: string | null; // fijo por ruta, pero lo mantenemos por consistencia
  date: string; // YYYY-MM-DD
  quantity: string;
  unit: FuelUnit;

  note: string;

  // MVP: solo editables si quieres (por ahora defaults)
  eventType: FuelEventType;
  fuelType: FuelType;

  // opcionales (future)
  price: string;
  currency: string;
  location: string;
};

export function emptyFuelFormValues(): FuelFormValues {
  return {
    assetId: null,
    date: "",
    quantity: "",
    unit: "L",
    note: "",
    eventType: "BUNKERED",
    fuelType: "MGO",
    price: "",
    currency: "",
    location: "",
  };
}
