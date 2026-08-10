// Performance guard for product imagery.
// ProductImage historically attempted to remove image backgrounds in the browser
// by reading every pixel from a detached canvas. On mobile devices this creates
// large CPU/memory spikes when many product cards mount at once.
//
// We short-circuit only large, detached canvases (the pattern used by that
// background-removal routine). Connected canvases and small utility canvases are
// untouched, so charts and normal UI canvas usage keep working.

const GLOBAL_KEY = "__precocerto_client_image_guard__";

type GuardedWindow = Window & typeof globalThis & { [GLOBAL_KEY]?: boolean };

const guardedWindow = window as GuardedWindow;

if (!guardedWindow[GLOBAL_KEY] && typeof CanvasRenderingContext2D !== "undefined") {
  guardedWindow[GLOBAL_KEY] = true;

  const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;

  CanvasRenderingContext2D.prototype.getImageData = function (...args: Parameters<CanvasRenderingContext2D["getImageData"]>) {
    const canvas = this.canvas;
    const pixelCount = Math.max(0, canvas.width * canvas.height);

    // The product background-removal canvas is created off-DOM and usually has
    // hundreds of thousands (or millions) of pixels. Abort before the expensive
    // pixel copy and per-pixel JavaScript loop starts.
    if (!canvas.isConnected && pixelCount >= 120_000) {
      throw new DOMException(
        "Client-side product image processing disabled for performance.",
        "AbortError",
      );
    }

    return originalGetImageData.apply(this, args);
  };
}

export {};
