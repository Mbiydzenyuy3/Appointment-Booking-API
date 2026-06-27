import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Provider, useAuth } from "./AuthContext";

vi.mock("../services/api.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

vi.mock("../services/socket.js", () => ({
  connectSocket: vi.fn(),
  disconnectSocket: vi.fn()
}));

vi.mock("../services/analytics.js", () => ({
  trackLogin: vi.fn(),
  trackRegistrationCompleted: vi.fn()
}));

function wrapper({ children }) {
  return <Provider>{children}</Provider>;
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it("resolves isLoading to false within 8 seconds when the API never responds", async () => {
    const { default: api } = await import("../services/api.js");
    // Simulate a cold-starting server: the request hangs indefinitely
    api.get.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    // Advance past the 8-second profile-check timeout
    await act(async () => {
      vi.advanceTimersByTime(8001);
      // Flush promise microtasks so state updates propagate
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("sets user and resolves isLoading when API responds quickly", async () => {
    const { default: api } = await import("../services/api.js");
    const fakeUser = { id: 1, name: "Alice", user_type: "client" };
    api.get.mockResolvedValue({ data: { data: fakeUser } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toEqual(fakeUser);
  });
});
