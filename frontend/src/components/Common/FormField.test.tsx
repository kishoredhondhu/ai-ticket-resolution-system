import { describe, it, expect, vi } from "vitest";

import { render, screen } from "../../test/testUtils";

import userEvent from "@testing-library/user-event";

import FormField from "./FormField";

describe("FormField", () => {
  it("should render input field with label", () => {
    const onChange = vi.fn();

    render(<FormField label="Test Label" value="" onChange={onChange} />);

    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
  });

  it("should render input with value", () => {
    const onChange = vi.fn();

    render(<FormField label="Name" value="John Doe" onChange={onChange} />);

    const input = screen.getByLabelText("Name") as HTMLInputElement;

    expect(input.value).toBe("John Doe");
  });

  it("should call onChange when input changes", async () => {
    const user = userEvent.setup();

    const onChange = vi.fn();

    render(<FormField label="Email" value="" onChange={onChange} />);

    const input = screen.getByLabelText("Email");

    await user.type(input, "test@example.com");

    expect(onChange).toHaveBeenCalled();
  });

  it("should render textarea when type is textarea", () => {
    const onChange = vi.fn();

    render(
      <FormField
        label="Description"
        value=""
        onChange={onChange}
        type="textarea"
      />
    );

    const textarea = screen.getByLabelText("Description");

    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("should render input with placeholder", () => {
    const onChange = vi.fn();

    render(
      <FormField
        label="Username"
        value=""
        onChange={onChange}
        placeholder="Enter username"
      />
    );

    expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();
  });

  it("should render required field", () => {
    const onChange = vi.fn();

    render(
      <FormField
        label="Required Field"
        value=""
        onChange={onChange}
        required={true}
      />
    );

    const input = screen.getByLabelText("Required Field") as HTMLInputElement;

    expect(input.required).toBe(true);
  });

  it("should render different input types", () => {
    const onChange = vi.fn();

    const types = ["text", "email", "password", "number"];

    types.forEach((type) => {
      const { container } = render(
        <FormField
          label={`${type} field`}
          value=""
          onChange={onChange}
          type={type}
        />
      );

      const input = container.querySelector("input");

      expect(input).toHaveAttribute("type", type);
    });
  });

  it("should have form-field class", () => {
    const onChange = vi.fn();

    const { container } = render(
      <FormField label="Test" value="" onChange={onChange} />
    );

    expect(container.querySelector(".form-field")).toBeInTheDocument();
  });

  it("should handle textarea onChange", async () => {
    const user = userEvent.setup();

    const onChange = vi.fn();

    render(
      <FormField
        label="Comments"
        value=""
        onChange={onChange}
        type="textarea"
      />
    );

    const textarea = screen.getByLabelText("Comments");

    await user.type(textarea, "Test comment");

    expect(onChange).toHaveBeenCalled();
  });

  it("should display current value in textarea", () => {
    const onChange = vi.fn();

    render(
      <FormField
        label="Notes"
        value="Existing notes"
        onChange={onChange}
        type="textarea"
      />
    );

    const textarea = screen.getByLabelText("Notes") as HTMLTextAreaElement;

    expect(textarea.value).toBe("Existing notes");
  });

  it("should use text as default type", () => {
    const onChange = vi.fn();

    const { container } = render(
      <FormField label="Default" value="" onChange={onChange} />
    );

    const input = container.querySelector("input");

    expect(input).toHaveAttribute("type", "text");
  });

  it("should not be required by default", () => {
    const onChange = vi.fn();

    render(<FormField label="Optional" value="" onChange={onChange} />);

    const input = screen.getByLabelText("Optional") as HTMLInputElement;

    expect(input.required).toBe(false);
  });
});
