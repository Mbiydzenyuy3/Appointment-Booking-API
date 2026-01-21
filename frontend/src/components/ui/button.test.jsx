import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders with default props", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it("applies default variant classes", () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole("button", { name: /default/i });
    expect(button).toHaveClass("bg-green-800", "text-white");
  });

  it("applies outline variant classes", () => {
    render(<Button variant='outline'>Outline</Button>);
    const button = screen.getByRole("button", { name: /outline/i });
    expect(button).toHaveClass("border", "border-input");
  });

  it("applies size classes", () => {
    render(<Button size='sm'>Small</Button>);
    const button = screen.getByRole("button", { name: /small/i });
    expect(button).toHaveClass("h-9", "px-3");
  });

  it("passes through additional props", () => {
    render(
      <Button type='submit' disabled>
        Submit
      </Button>
    );
    const button = screen.getByRole("button", { name: /submit/i });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toBeDisabled();
  });
});
