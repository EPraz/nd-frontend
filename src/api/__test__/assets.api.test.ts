import { normalizeUploadBlob } from "../assets.api";

describe("normalizeUploadBlob", () => {
  it("GIVEN a blob with the expected mime type WHEN normalizing SHOULD keep the original file object", () => {
    const original = new Blob(["vessel"], { type: "image/jpeg" });

    const normalized = normalizeUploadBlob(
      original,
      "vessel.jpg",
      "image/jpeg",
    );

    expect(normalized).toBe(original);
  });

  it("GIVEN a browser blob without mime type WHEN normalizing SHOULD create an uploadable typed blob", () => {
    const original = new Blob(["vessel"]);

    const normalized = normalizeUploadBlob(
      original,
      "vessel.jpg",
      "image/jpeg",
    );

    expect(normalized).not.toBe(original);
    expect(normalized.type).toBe("image/jpeg");
  });
});
