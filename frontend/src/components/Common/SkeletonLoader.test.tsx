import { describe, it, expect } from "vitest";
import { render } from "../../test/testUtils";
import SkeletonLoader from "./SkeletonLoader";
describe("SkeletonLoader", () => {
  it("should render default card skeleton", () => {
    const { container } = render(<SkeletonLoader />);
    expect(container.querySelector(".skeleton-card")).toBeInTheDocument();
  });
  it("should render single skeleton by default", () => {
    const { container } = render(<SkeletonLoader />);
    const items = container.querySelectorAll(".skeleton-item");
    expect(items).toHaveLength(1);
  });
  it("should render multiple skeletons when count is specified", () => {
    const { container } = render(<SkeletonLoader count={3} />);
    const items = container.querySelectorAll(".skeleton-item");
    expect(items).toHaveLength(3);
  });
  it("should render card type skeleton", () => {
    const { container } = render(<SkeletonLoader type="card" />);
    expect(container.querySelector(".skeleton-card")).toBeInTheDocument();
    expect(container.querySelector(".skeleton-header")).toBeInTheDocument();
    expect(container.querySelector(".skeleton-footer")).toBeInTheDocument();
  });
  it("should render header type skeleton", () => {
    const { container } = render(<SkeletonLoader type="header" />);
    expect(
      container.querySelector(".skeleton-page-header")
    ).toBeInTheDocument();
    expect(container.querySelector(".skeleton-title")).toBeInTheDocument();
    expect(container.querySelector(".skeleton-subtitle")).toBeInTheDocument();
  });
  it("should render text type skeleton", () => {
    const { container } = render(<SkeletonLoader type="text" />);
    expect(container.querySelector(".skeleton-line")).toBeInTheDocument();
  });
  it("should render circle type skeleton", () => {
    const { container } = render(<SkeletonLoader type="circle" />);
    expect(container.querySelector(".skeleton-circle")).toBeInTheDocument();
  });
  it("should render multiple card skeletons", () => {
    const { container } = render(<SkeletonLoader type="card" count={5} />);
    const cards = container.querySelectorAll(".skeleton-card");
    expect(cards).toHaveLength(5);
  });
  it("should render card with badges", () => {
    const { container } = render(<SkeletonLoader type="card" />);
    expect(container.querySelector(".skeleton-badge")).toBeInTheDocument();
    expect(
      container.querySelector(".skeleton-badge-small")
    ).toBeInTheDocument();
  });
  it("should render card with lines", () => {
    const { container } = render(<SkeletonLoader type="card" />);
    const lines = container.querySelectorAll(".skeleton-line");
    expect(lines.length).toBeGreaterThan(0);
  });
  it("should render card with circle in footer", () => {
    const { container } = render(<SkeletonLoader type="card" />);
    const footer = container.querySelector(".skeleton-footer");
    expect(footer).toBeInTheDocument();
    expect(footer?.querySelector(".skeleton-circle")).toBeInTheDocument();
  });
  it("should render skeleton container", () => {
    const { container } = render(<SkeletonLoader />);
    expect(container.querySelector(".skeleton-container")).toBeInTheDocument();
  });
  it("should handle zero count", () => {
    const { container } = render(<SkeletonLoader count={0} />);
    const items = container.querySelectorAll(".skeleton-item");
    expect(items).toHaveLength(0);
  });
  it("should render multiple different types", () => {
    const types: Array<"card" | "text" | "circle" | "header"> = [
      "card",
      "header",
      "text",
      "circle",
    ];
    types.forEach((type) => {
      const { container } = render(<SkeletonLoader type={type} />);
      expect(container.querySelector(".skeleton-item")).toBeInTheDocument();
    });
  });
});
