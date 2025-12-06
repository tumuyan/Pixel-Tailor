/**
 * Canvas handling for image preview and split display
 */

const canvasRenderer = (() => {
  let canvas = null;
  let ctx = null;
  let currentImage = null;

  /**
   * Initialize canvas
   */
  const init = (canvasElement) => {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  };

  /**
   * Resize canvas to fit container while maintaining aspect ratio
   */
  const resizeCanvas = () => {
    if (!canvas) return;

    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    if (currentImage) {
      render(currentImage);
    }
  };

  /**
   * Render image on canvas with split effect
   */
  const render = (image, splitDirection = null, zoomLevel = 100) => {
    if (!ctx) return;

    currentImage = image;
    const direction = splitDirection || appState.getSplitDirection();
    const zoom = zoomLevel / 100;

    // Clear canvas
    ctx.fillStyle = '#f5f7fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!image) return;

    try {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f5f7fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate scaled dimensions
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgAspect > canvasAspect) {
          drawWidth = canvas.width * zoom;
          drawHeight = drawWidth / imgAspect;
        } else {
          drawHeight = canvas.height * zoom;
          drawWidth = drawHeight * imgAspect;
        }

        // Center the image
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = (canvas.height - drawHeight) / 2;

        // Draw split effect based on direction
        if (direction === 'horizontal') {
          drawHorizontalSplit(img, drawWidth, drawHeight, offsetX, offsetY);
        } else {
          drawVerticalSplit(img, drawWidth, drawHeight, offsetX, offsetY);
        }

        // Draw border
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX, offsetY, drawWidth, drawHeight);
      };
      img.src = image.dataUrl;
    } catch (error) {
      console.error('Error rendering image:', error);
    }
  };

  /**
   * Draw horizontal split effect
   */
  const drawHorizontalSplit = (img, width, height, offsetX, offsetY) => {
    const splitPoint = height / 2;

    // Top half
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.drawImage(img, offsetX, offsetY, width, height);
    ctx.restore();

    // Bottom half with different opacity
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.drawImage(img, offsetX, offsetY + splitPoint, width, splitPoint, offsetX, offsetY + splitPoint, width, splitPoint);
    ctx.restore();

    // Draw divider line
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + splitPoint);
    ctx.lineTo(offsetX + width, offsetY + splitPoint);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  /**
   * Draw vertical split effect
   */
  const drawVerticalSplit = (img, width, height, offsetX, offsetY) => {
    const splitPoint = width / 2;

    // Left half
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.drawImage(img, offsetX, offsetY, width, height);
    ctx.restore();

    // Right half with different opacity
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.drawImage(img, offsetX + splitPoint, offsetY, splitPoint, height, offsetX + splitPoint, offsetY, splitPoint, height);
    ctx.restore();

    // Draw divider line
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(offsetX + splitPoint, offsetY);
    ctx.lineTo(offsetX + splitPoint, offsetY + height);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  /**
   * Clear canvas
   */
  const clear = () => {
    if (!ctx) return;
    ctx.fillStyle = '#f5f7fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    currentImage = null;
  };

  return {
    init,
    render,
    clear,
    resizeCanvas,
  };
})();

/**
 * UI Controller for canvas and zoom
 */
const canvasUI = (() => {
  let placeholderElement = null;
  let zoomLevelElement = null;

  const init = () => {
    const canvas = document.getElementById('previewCanvas');
    placeholderElement = document.getElementById('canvasPlaceholder');
    zoomLevelElement = document.getElementById('zoomLevel');

    if (!canvas) return;

    canvasRenderer.init(canvas);

    // Handle zoom buttons
    document.getElementById('zoomIn')?.addEventListener('click', () => {
      appState.zoomIn();
    });

    document.getElementById('zoomOut')?.addEventListener('click', () => {
      appState.zoomOut();
    });

    // Subscribe to state changes
    appState.subscribe((state) => {
      updatePreview(state);
      updateZoomLevel(state.zoomLevel);
    });

    // Initial render
    updatePreview(appState.getState());
  };

  /**
   * Update preview based on state
   */
  const updatePreview = (state) => {
    const selectedImage = state.images[state.selectedImageIndex] || null;

    if (!selectedImage) {
      canvasRenderer.clear();
      if (placeholderElement) {
        placeholderElement.style.display = 'flex';
      }
    } else {
      if (placeholderElement) {
        placeholderElement.style.display = 'none';
      }
      canvasRenderer.render(selectedImage, state.splitDirection, state.zoomLevel);
    }
  };

  /**
   * Update zoom level display
   */
  const updateZoomLevel = (level) => {
    if (zoomLevelElement) {
      zoomLevelElement.textContent = `${level}%`;
    }
  };

  return {
    init,
  };
})();
