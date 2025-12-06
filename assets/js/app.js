/**
 * Main application controller
 */

const app = (() => {
  /**
   * Initialize the application
   */
  const init = () => {
    setupUploadHandlers();
    setupControlHandlers();
    setupThumbnailHandlers();
    setupLanguageToggle();

    // Initialize canvas UI
    canvasUI.init();

    // Subscribe to state changes for general UI updates
    appState.subscribe((state) => {
      updateThumbnailList(state);
    });
  };

  /**
   * Setup drag & drop and file input handlers
   */
  const setupUploadHandlers = () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    if (!dropZone || !fileInput) return;

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('drag-over');
      }, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        appState.addImages(files);
      }
    }, false);

    // Handle file input change
    fileInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files.length > 0) {
        appState.addImages(files);
        // Reset input
        e.target.value = '';
      }
    });

    // Make drop zone clickable
    dropZone.addEventListener('click', () => {
      fileInput.click();
    });
  };

  /**
   * Setup split direction control handlers
   */
  const setupControlHandlers = () => {
    const directionButtons = document.querySelectorAll('.direction-btn');

    directionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const direction = button.getAttribute('data-direction');
        appState.setSplitDirection(direction);

        // Update button states
        directionButtons.forEach(btn => {
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
      });
    });

    // Set initial active button
    const initialDirection = appState.getSplitDirection();
    const initialButton = document.querySelector(`[data-direction="${initialDirection}"]`);
    if (initialButton) {
      initialButton.classList.add('active');
      initialButton.setAttribute('aria-pressed', 'true');
    }
  };

  /**
   * Setup thumbnail list handler for image selection
   */
  const setupThumbnailHandlers = () => {
    // Thumbnails are created dynamically, so we use event delegation
    const thumbnailList = document.getElementById('thumbnailList');
    if (!thumbnailList) return;

    thumbnailList.addEventListener('click', (e) => {
      const thumbnailItem = e.target.closest('.thumbnail-item');
      if (!thumbnailItem) return;

      const index = parseInt(thumbnailItem.getAttribute('data-index'), 10);
      appState.selectImage(index);
    });
  };

  /**
   * Setup language toggle
   */
  const setupLanguageToggle = () => {
    const langToggle = document.getElementById('langToggle');
    if (!langToggle) return;

    langToggle.addEventListener('click', () => {
      i18n.toggleLanguage();
    });
  };

  /**
   * Update thumbnail list based on state
   */
  const updateThumbnailList = (state) => {
    const thumbnailList = document.getElementById('thumbnailList');
    if (!thumbnailList) return;

    thumbnailList.innerHTML = '';

    state.images.forEach((image, index) => {
      const thumbnailItem = createThumbnailElement(image, index, state.selectedImageIndex);
      thumbnailList.appendChild(thumbnailItem);
    });

    // Show empty state if no images
    if (state.images.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'thumbnail-empty-state';
      emptyState.textContent = i18n.t('errorNoImages');
      emptyState.style.cssText = `
        padding: 2rem 1rem;
        text-align: center;
        color: #999;
        font-size: 0.9rem;
      `;
      thumbnailList.appendChild(emptyState);
    }
  };

  /**
   * Create a thumbnail element
   */
  const createThumbnailElement = (image, index, selectedIndex) => {
    const item = document.createElement('div');
    item.className = 'thumbnail-item';
    if (index === selectedIndex) {
      item.classList.add('active');
    }
    item.setAttribute('data-index', index);

    // Thumbnail image
    const img = document.createElement('img');
    img.className = 'thumbnail-image';
    img.src = image.dataUrl;
    img.alt = image.name;

    // Thumbnail info
    const info = document.createElement('div');
    info.className = 'thumbnail-info';

    const name = document.createElement('div');
    name.className = 'thumbnail-name';
    name.textContent = truncateFilename(image.name, 20);
    name.title = image.name;

    const size = document.createElement('div');
    size.className = 'thumbnail-size';
    size.textContent = formatFileSize(image.size);

    info.appendChild(name);
    info.appendChild(size);

    item.appendChild(img);
    item.appendChild(info);

    return item;
  };

  /**
   * Prevent default drag and drop behavior
   */
  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Truncate filename for display
   */
  const truncateFilename = (filename, maxLength) => {
    if (filename.length <= maxLength) {
      return filename;
    }

    const ext = filename.substring(filename.lastIndexOf('.'));
    const name = filename.substring(0, filename.lastIndexOf('.'));
    const available = maxLength - ext.length - 3; // 3 for '...'

    return name.substring(0, available) + '...' + ext;
  };

  return {
    init,
  };
})();

/**
 * Start the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
