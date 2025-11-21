import { describe, it, expect } from "vitest";
import { render, screen } from "../../test/testUtils";
import LoadingSpinner from "./LoadingSpinner";
describe("LoadingSpinner", () => {
  it("should render loading spinner", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByLabelText("Loading...");
    expect(spinner).toBeInTheDocument();
  });
  it("should render SVG element", () => {
    const { container } = render(<LoadingSpinner />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "20");
    expect(svg).toHaveAttribute("height", "20");
  });
  it("should render two circles", () => {
    const { container } = render(<LoadingSpinner />);
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);
  });
  it("should have loading-spinner class", () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector(".loading-spinner");
    expect(spinner).toBeInTheDocument();
  });
  it("should have proper accessibility attributes", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByLabelText("Loading...");
    expect(spinner).toHaveAttribute("aria-label", "Loading...");
  });
});
