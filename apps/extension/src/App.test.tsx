import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("shows extension build readiness", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Extension build is working" }),
    ).toBeInTheDocument();
    expect(screen.getByText("The Manifest V3 popup loaded successfully.")).toBeInTheDocument();
  });
});
