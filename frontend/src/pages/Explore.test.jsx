import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ExplorePage from "./Explore";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn() }
}));

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({ user: null })
}));

vi.mock("../context/CurrencyContext.jsx", () => ({
  useCurrency: () => ({ formatPrice: (p) => `$${p}` })
}));

vi.mock("../services/analytics.js", () => ({
  trackExploreView: vi.fn(),
  trackServiceViewed: vi.fn(),
  trackBookingStarted: vi.fn()
}));

vi.mock("react-toastify", () => ({
  toast: { error: vi.fn() }
}));

// The booking form is a heavy component — stub it out so tests stay fast
vi.mock("../components/BookAppointments/BookAppointment.jsx", () => ({
  default: () => null
}));

function Wrapper({ children }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe("ExplorePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows a retry button when the services fetch fails", async () => {
    const { default: api } = await import("../services/api.js");
    api.get.mockRejectedValue(new Error("Network error"));

    render(<ExplorePage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    });
  });

  it("does not block the entire page with a spinner while loading", async () => {
    const { default: api } = await import("../services/api.js");
    // Never resolves — simulates cold-start hang
    api.get.mockReturnValue(new Promise(() => {}));

    render(<ExplorePage />, { wrapper: Wrapper });

    // The hero heading should already be visible while services are loading
    expect(
      screen.getByText(/join our circle/i)
    ).toBeInTheDocument();
  });

  it("renders service cards when fetch succeeds", async () => {
    const { default: api } = await import("../services/api.js");
    api.get.mockResolvedValue({
      data: {
        data: [
          {
            service_id: 1,
            name: "Haircut",
            description: "A great haircut",
            price: 50,
            duration: 30,
            provider_name: "Bob",
            provider_id: 42,
            average_rating: 5,
            review_count: 10
          }
        ]
      }
    });

    render(<ExplorePage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Haircut")).toBeInTheDocument();
    });
  });

  it("clicking Retry re-fetches services", async () => {
    const { default: api } = await import("../services/api.js");
    api.get.mockRejectedValue(new Error("Network error"));

    render(<ExplorePage />, { wrapper: Wrapper });

    const retryBtn = await screen.findByRole("button", { name: /retry/i });

    // Second attempt succeeds
    api.get.mockResolvedValue({
      data: {
        data: [
          {
            service_id: 2,
            name: "Massage",
            description: "Relaxing massage",
            price: 80,
            duration: 60,
            provider_name: "Alice",
            provider_id: 7,
            average_rating: 4,
            review_count: 5
          }
        ]
      }
    });

    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText("Massage")).toBeInTheDocument();
    });
  });
});
