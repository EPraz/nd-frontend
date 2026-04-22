import {
  getGuardedProjectModule,
  getGuardedVesselSection,
  resolveVesselSectionModuleKey,
} from "../projectEntitlements";

describe("projectEntitlements helpers", () => {
  it("GIVEN a vessel overview section WHEN resolving inheritance SHOULD map to the vessels module", () => {
    expect(resolveVesselSectionModuleKey("overview")).toBe("vessels");
  });

  it("GIVEN a vessel certificates section WHEN resolving inheritance SHOULD map to the certificates module", () => {
    expect(resolveVesselSectionModuleKey("certificates")).toBe("certificates");
  });

  it("GIVEN a crew certificates route inside crew WHEN resolving the guarded module SHOULD map to crew", () => {
    expect(
      getGuardedProjectModule(
        "/projects/project-1/crew/certificates/upload",
        "project-1",
      ),
    ).toEqual({
      label: "Crew",
      moduleKey: "crew",
    });
  });

  it("GIVEN a vessel maintenance route WHEN resolving the guarded section SHOULD map to maintenance", () => {
    expect(
      getGuardedVesselSection(
        "/projects/project-1/vessels/vessel-1/maintenance",
        "/projects/project-1/vessels/vessel-1",
      ),
    ).toEqual({
      label: "Maintenance",
      moduleKey: "maintenance",
    });
  });
});
