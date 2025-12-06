# Image Splitter

A responsive web application for viewing and splitting images with a split-view effect. Built with vanilla HTML5, CSS3, and JavaScript using the Canvas API.

## Features

- **Bilingual UI**: English and Chinese (中文) language support with automatic browser language detection
- **Responsive Design**: Mobile-first layout that adapts to all screen sizes using flexbox, grid, and CSS clamp()
- **Image Upload**: 
  - Drag & drop support for single or multiple images
  - File input for browsing and selecting images
  - Support for all standard image formats (PNG, JPEG, GIF, WebP, etc.)
- **Image Management**:
  - Thumbnail preview list with file metadata
  - Click to select images for detailed view
  - Display file name and size for each image
- **Canvas Preview**:
  - Zoomable canvas preview with 50% to 300% zoom range
  - Split-view effect (horizontal and vertical)
  - Interactive split direction toggle
- **State Management**: 
  - Centralized state model storing images, split direction, and per-image settings
  - Observable state with callback subscriptions
- **Zoom Controls**:
  - Zoom in/out buttons
  - Zoom level percentage display
  - Keyboard-friendly controls

## Project Structure

```
├── index.html              # Main HTML file with semantic structure
├── assets/
│   ├── css/
│   │   └── styles.css      # Responsive styling with mobile-first approach
│   └── js/
│       ├── i18n.js         # Bilingual i18n system with localStorage
│       ├── state.js        # State management and data model
│       ├── canvas.js       # Canvas rendering and zoom logic
│       └── app.js          # Main application controller
├── .gitignore              # Git ignore patterns
└── README.md               # This file
```

## Technical Stack

- **HTML5**: Semantic markup with ARIA labels for accessibility
- **CSS3**: 
  - Responsive design with flexbox and CSS Grid
  - CSS variables for theming
  - Mobile-first approach with clamp-based typography
- **JavaScript (Vanilla)**:
  - Module pattern for encapsulation
  - Event-driven architecture
  - Canvas API for image rendering

## Getting Started

1. Clone the repository
2. Open `index.html` in a web browser
3. Start uploading images using drag & drop or the file input
4. Select images to preview and adjust split direction

## Browser Support

- Modern browsers with HTML5 Canvas support
- CSS Grid and Flexbox support
- FileReader API support
- Tested on Chrome, Firefox, Safari, and Edge

## Mobile Support

The application is fully responsive and works on:
- Tablets (iPad, Android tablets)
- Mobile phones (iOS, Android)
- Desktop browsers
- Landscape and portrait orientations

## State Model

The application maintains a centralized state object with:

- **images**: Array of image objects with:
  - id: Unique identifier
  - name: Filename
  - file: File object
  - size: File size in bytes
  - dataUrl: Base64-encoded image data
  - width, height: Image dimensions
  - addedAt: Timestamp
  - settings: Per-image configuration
- **splitDirection**: Current split view direction (horizontal/vertical)
- **selectedImageIndex**: Index of currently selected image
- **zoomLevel**: Current zoom percentage (50-300%)

## i18n System

The i18n system provides:
- EN/中文 language switching
- Automatic browser language detection
- localStorage persistence
- Simple translation dictionary
- DOM element update on language change

## Future Enhancements

- Per-image brightness/contrast adjustment
- Save/export split images
- Undo/redo functionality
- Image cropping and rotation
- Compare mode for multiple images
- History of recent files
