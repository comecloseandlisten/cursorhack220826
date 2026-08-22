import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

describe("App", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens the current day's photo pile from the live API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo) => {
        const url = String(input);
        if (url.includes("/canvases")) {
          return new Response(
            JSON.stringify({
              items: [
                {
                  id: "canvas_default",
                  title: "Default",
                  ownerId: "system",
                  createdAt: "2026-08-22T00:00:00Z",
                },
              ],
            }),
          );
        }

        if (url.includes("/messages")) {
          return new Response(
            JSON.stringify({
              items: [
                {
                  id: "msg_live",
                  text: { body: "у нас туса" },
                  revealAnimation: null,
                  media: [
                    {
                      mime: "image/jpeg",
                      url: "https://example.com/party.jpg",
                    },
                  ],
                  dateTimeSend: "2026-08-22T08:31:45.425Z",
                  canvasId: "canvas_default",
                  dateTimeReveal: null,
                  senderId: "tg:1",
                  parentMessageId: null,
                  tag: null,
                  channel: "dm",
                },
              ],
            }),
          );
        }

        return new Response("not found", { status: 404 });
      }),
    );

    const user = userEvent.setup();
    window.history.replaceState({}, "", "/");
    render(<App />);

    expect(screen.getByRole("button", { name: "Open calendar" })).toHaveTextContent(
      "August 22",
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Open photo gallery" })).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "Open photo gallery" }));

    expect(screen.getAllByRole("button", { name: /Open (photo|video) from/ })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });
});
