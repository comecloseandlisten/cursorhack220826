import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("opens the current day's photo pile", async () => {
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
