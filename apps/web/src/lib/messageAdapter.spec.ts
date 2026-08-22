import { describe, expect, it } from "vitest";

import { adaptMessagesToDays } from "./messageAdapter";
import type { MessageView } from "../types/messages";

function message(overrides: Partial<MessageView> = {}): MessageView {
  return {
    id: "msg_1",
    text: { body: "hello from the park" },
    revealAnimation: null,
    media: [],
    dateTimeSend: "2026-08-22T15:30:00.000Z",
    canvasId: "canvas_default",
    dateTimeReveal: null,
    senderId: "tg:1",
    parentMessageId: null,
    tag: null,
    channel: "dm",
    ...overrides,
  };
}

describe("adaptMessagesToDays", () => {
  it("maps video/mp4 onto a video entry with the media url", () => {
    const [day] = adaptMessagesToDays(
      [
        message({
          media: [{ mime: "video/mp4", url: "https://example.com/clip.mp4" }],
        }),
      ],
      { "tg:1": "Kate" },
    );

    expect(day?.entries[0]).toMatchObject({
      kind: "video",
      video: "https://example.com/clip.mp4",
      caption: "hello from the park",
      author: "Kate",
    });
  });
});
