import { FuelEventType } from "@/src/features/fuel/contracts/fuel.contract";

export type VesselIdentifierType = "IMO" | "LICENSE";

export type VesselProfileDto = {
  identifierType: VesselIdentifierType;
  imo: string | null;
  licenseNumber: string | null;
  flag: string | null;

  callSign: string | null;
  mmsi: string | null;
  homePort: string | null;

  vesselType: string | null;
  classSociety: string | null;
  builder: string | null;
  yearBuilt: number | null;

  loaM: string | null; // Decimal -> string en JSON (mejor)
  beamM: string | null;
  draftM: string | null;
  grossTonnage: number | null;
  deadweightTonnage: number | null;

  maxSpeedKn: string | null;
  propulsionType: string | null;
  mainEngineModel: string | null;
};

export type UpdateVesselProfileInput = Partial<{
  identifierType: VesselIdentifierType;
  imo: string;
  licenseNumber: string;
  flag: string;

  callSign: string;
  mmsi: string;
  homePort: string;

  vesselType: string;
  classSociety: string;
  builder: string;
  yearBuilt: number;

  loaM: string;
  beamM: string;
  draftM: string;
  grossTonnage: number;
  deadweightTonnage: number;

  maxSpeedKn: string;
  propulsionType: string;
  mainEngineModel: string;
}>;

export type VesselSummaryDto = {
  assetId: string;

  certificates: {
    total: number;
    valid: number;
    pending: number;
    expired: number;
    expiringSoon: number;
  };

  crew: {
    total: number;
    active: number;
    inactive: number;
  };

  maintenance: {
    total: number;
    open: number;
    inProgress: number;
    done: number;
    overdue: number; // dueDate < now && status != DONE
  };

  fuel: {
    total: number;
    lastEventAt: string | null; // ISO
    lastEventType: FuelEventType | null;
  };

  updatedAt: string; // ISO
};
