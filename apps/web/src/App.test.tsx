import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

describe("App", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens the current day's photo pile", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/");
    render(<App />);

    expect(screen.getByRole("button", { name: "Open calendar" })).toHaveTextContent(
      "August 22",
    );
    await user.click(screen.getByRole("button", { name: "Open photo gallery" }));

    expect(screen.getAllByRole("button", { name: /Open (photo|video) from/ })).toHaveLength(4);
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });
});
