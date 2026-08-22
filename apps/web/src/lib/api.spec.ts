import { describe, expect, it } from "vitest";
import { mergeLiveWithMocks, pickCanvasId } from "./api";
import type { MessageView } from "../types/messages";

function message(id: string): MessageView {
  return {
    id,
    revealAnimation: null,
    media: [],
    dateTimeSend: "2026-08-22T08:00:00Z",
    canvasId: "canvas_default",
    dateTimeReveal: null,
    senderId: "tg:1",
    parentMessageId: null,
    tag: null,
    channel: "dm",
  };
}

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

describe("mergeLiveWithMocks", () => {
  it("keeps mocks that are not already in live data", () => {
    expect(mergeLiveWithMocks([message("live-1")], [message("live-1"), message("mock-1")])).toEqual(
      [message("live-1"), message("mock-1")],
    );
  });
});
