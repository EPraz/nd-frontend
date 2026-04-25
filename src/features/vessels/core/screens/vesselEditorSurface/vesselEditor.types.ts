export type VesselEditorFormValues = {
  identifierType: "IMO" | "LICENSE";
  name: string;
  imo: string;
  licenseNumber: string;
  flag: string;
  email: string;
  callSign: string;
  mmsi: string;
  homePort: string;
  vesselType: string;
  classSociety: string;
  builder: string;
  yearBuilt: string;
};

export type VesselEditorMode = "create" | "edit";
