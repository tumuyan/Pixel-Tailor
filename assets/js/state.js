/**
 * State management for the application
 * Stores images, split direction, and per-image settings
 */

const appState = (() => {
  // Internal state
  const state = {
    images: [], // Array of image objects
    splitDirection: 'horizontal', // 'horizontal' or 'vertical'
    selectedImageIndex: null,
    zoomLevel: 100,
    maxZoom: 300,
    minZoom: 50,
  };

  // List of observer callbacks
  const observers = [];

  /**
   * Image object structure:
   * {
   *   id: string (unique UUID),
   *   name: string (filename),
   *   file: File object,
   *   size: number (bytes),
   *   dataUrl: string (base64 data URL),
   *   width: number (px),
   *   height: number (px),
   *   addedAt: timestamp,
   *   settings: {
   *     brightness: 100,
   *     contrast: 100,
   *     // Future per-image settings
   *   }
   * }
   */

  /**
   * Notify all observers of state changes
   */
  const notify = () => {
    observers.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Observer callback error:', error);
      }
    });
  };

  /**
   * Subscribe to state changes
   */
  const subscribe = (callback) => {
    observers.push(callback);
    return () => {
      const index = observers.indexOf(callback);
      if (index > -1) {
        observers.splice(index, 1);
      }
    };
  };

  /**
   * Generate a unique ID for images
   */
  const generateId = () => {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Add images to the state
   * @param {File|File[]} files - File or array of files to add
   */
  const addImages = async (files) => {
    const fileArray = Array.isArray(files) ? files : [files];

    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        console.warn(`Skipping non-image file: ${file.name}`);
        continue;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        const { width, height } = await getImageDimensions(dataUrl);

        const image = {
          id: generateId(),
          name: file.name,
          file: file,
          size: file.size,
          dataUrl: dataUrl,
          width: width,
          height: height,
          addedAt: Date.now(),
          settings: {
            brightness: 100,
            contrast: 100,
          },
        };

        state.images.push(image);

        // Auto-select first image
        if (state.selectedImageIndex === null) {
          state.selectedImageIndex = 0;
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    notify();
  };

  /**
   * Remove an image by index
   */
  const removeImage = (index) => {
    if (index < 0 || index >= state.images.length) {
      console.warn(`Invalid image index: ${index}`);
      return;
    }

    state.images.splice(index, 1);

    // Adjust selected index if needed
    if (state.selectedImageIndex >= state.images.length) {
      state.selectedImageIndex = state.images.length > 0 ? state.images.length - 1 : null;
    }

    notify();
  };

  /**
   * Clear all images
   */
  const clearImages = () => {
    state.images = [];
    state.selectedImageIndex = null;
    notify();
  };

  /**
   * Select an image by index
   */
  const selectImage = (index) => {
    if (index === null || (index >= 0 && index < state.images.length)) {
      state.selectedImageIndex = index;
      notify();
    }
  };

  /**
   * Get selected image
   */
  const getSelectedImage = () => {
    if (state.selectedImageIndex === null) {
      return null;
    }
    return state.images[state.selectedImageIndex] || null;
  };

  /**
   * Get all images
   */
  const getImages = () => [...state.images];

  /**
   * Set split direction
   */
  const setSplitDirection = (direction) => {
    if (['horizontal', 'vertical'].includes(direction)) {
      state.splitDirection = direction;
      notify();
    }
  };

  /**
   * Get split direction
   */
  const getSplitDirection = () => state.splitDirection;

  /**
   * Update image settings
   */
  const updateImageSettings = (index, settings) => {
    if (index >= 0 && index < state.images.length) {
      state.images[index].settings = {
        ...state.images[index].settings,
        ...settings,
      };
      notify();
    }
  };

  /**
   * Set zoom level
   */
  const setZoomLevel = (level) => {
    const clampedLevel = Math.max(state.minZoom, Math.min(level, state.maxZoom));
    if (clampedLevel !== state.zoomLevel) {
      state.zoomLevel = clampedLevel;
      notify();
    }
  };

  /**
   * Get zoom level
   */
  const getZoomLevel = () => state.zoomLevel;

  /**
   * Zoom in (increase by 10%)
   */
  const zoomIn = () => {
    const newLevel = Math.min(state.zoomLevel + 10, state.maxZoom);
    setZoomLevel(newLevel);
  };

  /**
   * Zoom out (decrease by 10%)
   */
  const zoomOut = () => {
    const newLevel = Math.max(state.zoomLevel - 10, state.minZoom);
    setZoomLevel(newLevel);
  };

  /**
   * Reset zoom to 100%
   */
  const resetZoom = () => {
    setZoomLevel(100);
  };

  /**
   * Get full state (for debugging)
   */
  const getState = () => ({ ...state });

  return {
    subscribe,
    addImages,
    removeImage,
    clearImages,
    selectImage,
    getSelectedImage,
    getImages,
    setSplitDirection,
    getSplitDirection,
    updateImageSettings,
    setZoomLevel,
    getZoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    getState,
  };
})();

/**
 * Helper: Read file as data URL
 */
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Helper: Get image dimensions from data URL
 */
function getImageDimensions(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}
