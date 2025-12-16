// PWA Service for handling Progressive Web App functionality

class PWAService {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isOnline = navigator.onLine;
    this.updateAvailable = false;
    this.registration = null;

    this.init();
  }

  init() {
    // Listen for the beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPromotion();
    });

    // Listen for app installation
    window.addEventListener("appinstalled", () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.hideInstallPromotion();
      console.log("PWA was installed");

      // Track installation event
      this.trackEvent("pwa_installed");
    });

    // Listen for online/offline status
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.showOnlineStatus();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.showOfflineStatus();
    });

    // Service Worker registration
    this.registerServiceWorker();
  }

  async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered successfully");

        // Check for updates
        this.registration.addEventListener("updatefound", () => {
          const newWorker = this.registration.installing;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              this.updateAvailable = true;
              this.showUpdateNotification();
            }
          });
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data && event.data.type === "CACHE_UPDATED") {
            console.log("Cache updated successfully");
          }
        });
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    }
  }

  showInstallPromotion() {
    // Create install button if it doesn't exist
    if (!document.getElementById("pwa-install-btn")) {
      const installButton = document.createElement("button");
      installButton.id = "pwa-install-btn";
      installButton.setAttribute("aria-label", "Install this app");
      installButton.setAttribute("role", "button");
      installButton.tabIndex = 0;

      const content = document.createElement("div");
      content.className = "flex items-center space-x-2";

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "w-5 h-5");
      svg.setAttribute("fill", "currentColor");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("aria-hidden", "true");

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute(
        "d",
        "M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"
      );

      const span = document.createElement("span");
      span.textContent = "Install App";

      svg.appendChild(path);
      content.appendChild(svg);
      content.appendChild(span);
      installButton.appendChild(content);

      installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #369936, #2a7d2a);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(54, 153, 54, 0.3);
        z-index: 9999;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
      `;

      // Add keyboard support
      installButton.addEventListener("click", () => this.promptInstall());
      installButton.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.promptInstall();
        }
      });

      installButton.addEventListener("mouseenter", () => {
        installButton.style.transform = "translateY(-2px)";
        installButton.style.boxShadow = "0 6px 20px rgba(54, 153, 54, 0.4)";
      });
      installButton.addEventListener("mouseleave", () => {
        installButton.style.transform = "translateY(0)";
        installButton.style.boxShadow = "0 4px 12px rgba(54, 153, 54, 0.3)";
      });

      document.body.appendChild(installButton);

      // Auto-hide after 15 seconds
      setTimeout(() => {
        this.hideInstallPromotion();
      }, 15000);
    }
  }

  hideInstallPromotion() {
    const installButton = document.getElementById("pwa-install-btn");
    if (installButton) {
      installButton.style.opacity = "0";
      installButton.style.transform = "translateY(20px)";
      setTimeout(() => {
        installButton.remove();
      }, 300);
    }
  }

  async promptInstall() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }

      this.deferredPrompt = null;
      this.hideInstallPromotion();
    }
  }

  showUpdateNotification() {
    const updateButton = document.createElement("button");
    updateButton.setAttribute("aria-label", "Update app to latest version");
    updateButton.setAttribute("role", "button");
    updateButton.tabIndex = 0;
    updateButton.textContent = "🔄 Update Available";

    updateButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f59e0b;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
      z-index: 9999;
      transition: all 0.3s ease;
    `;

    // Add keyboard support
    const handleUpdate = () => {
      if (this.registration && this.registration.waiting) {
        this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
        window.location.reload();
      }
    };

    updateButton.addEventListener("click", handleUpdate);
    updateButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleUpdate();
      }
    });

    document.body.appendChild(updateButton);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      updateButton.remove();
    }, 10000);
  }

  showOnlineStatus() {
    this.showStatusMessage("🟢 Back online", "success");
  }

  showOfflineStatus() {
    this.showStatusMessage("⚠️ You are offline", "warning");
  }

  showStatusMessage(message, type = "info") {
    const statusDiv = document.createElement("div");
    statusDiv.textContent = message;

    // Set background color based on type
    const backgroundColor =
      type === "success"
        ? "#22c55e"
        : type === "warning"
        ? "#f59e0b"
        : "#369936";

    statusDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 9999;
      transition: all 0.3s ease;
      background: ${backgroundColor};
    `;

    document.body.appendChild(statusDiv);

    setTimeout(() => {
      statusDiv.style.opacity = "0";
      statusDiv.style.transform = "translateX(-50%) translateY(-20px)";
      setTimeout(() => statusDiv.remove(), 300);
    }, 3000);
  }

  trackEvent(eventName, properties = {}) {
    // Analytics tracking for PWA events
    if (typeof window.gtag !== "undefined") {
      window.gtag("event", eventName, properties);
    }

    // Console log for development
    console.log(`PWA Event: ${eventName}`, properties);
  }

  // Check if app is running as PWA
  isPWA() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  // Get install prompt availability
  canInstall() {
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  // Get offline status
  isOffline() {
    return !this.isOnline;
  }

  // Check for updates
  async checkForUpdates() {
    if (this.registration) {
      await this.registration.update();
    }
  }
}

// Export singleton instance
export const pwaService = new PWAService();
export default PWAService;
