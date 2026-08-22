import { describe, expect, it } from "vitest";
import { pickCanvasId } from "./api";

describe("pickCanvasId", () => {
  it("prefers canvas_default when present", () => {
    expect(
      pickCanvasId([
        { id: "canvas_other", title: "Other", ownerId: "system", createdAt: "" },
        { id: "canvas_default", title: "Default", ownerId: "system", createdAt: "" },
      ]),
    ).toBe("canvas_default");
  });

  it("falls back to canvas_default when the list is empty", () => {
    expect(pickCanvasId([])).toBe("canvas_default");
  });
});
