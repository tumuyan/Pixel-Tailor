/**
 * Simple i18n system for managing bilingual content (EN/中文)
 */

const i18n = (() => {
  const LANGUAGES = {
    EN: 'en',
    ZH: 'zh'
  };

  const STORAGE_KEY = 'app_language';

  const translations = {
    en: {
      // Header
      appTitle: 'Image Splitter',

      // Upload section
      uploadTitle: 'Upload Images',
      dropText: 'Drag images here or click',
      placeholderText: 'Select an image to preview',

      // Controls
      splitLabel: 'Split Direction:',
      horizontalText: 'Horizontal',
      verticalText: 'Vertical',

      // Images section
      imagesTitle: 'Images',

      // Language toggle
      langLabel: '中文',

      // Errors & Messages
      errorNoImages: 'No images selected',
      errorInvalidFile: 'Invalid file type. Please select images only.',
      imageSizeMB: 'MB',
      imageCount: '{count} image(s)',
    },
    zh: {
      // Header
      appTitle: '图像分割器',

      // Upload section
      uploadTitle: '上传图像',
      dropText: '将图像拖到此处或点击',
      placeholderText: '选择图像以预览',

      // Controls
      splitLabel: '分割方向：',
      horizontalText: '水平',
      verticalText: '垂直',

      // Images section
      imagesTitle: '图像',

      // Language toggle
      langLabel: 'English',

      // Errors & Messages
      errorNoImages: '未选择任何图像',
      errorInvalidFile: '无效的文件类型。请仅选择图像。',
      imageSizeMB: 'MB',
      imageCount: '{count} 张图像',
    }
  };

  let currentLanguage = LANGUAGES.EN;

  /**
   * Initialize i18n system
   */
  const init = () => {
    // Try to load saved language from localStorage
    const savedLang = localStorage.getItem(STORAGE_KEY);
    if (savedLang && Object.values(LANGUAGES).includes(savedLang)) {
      currentLanguage = savedLang;
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0].toLowerCase();
      if (browserLang === LANGUAGES.ZH) {
        currentLanguage = LANGUAGES.ZH;
      }
    }
  };

  /**
   * Get current language
   */
  const getCurrentLanguage = () => currentLanguage;

  /**
   * Set language and update UI
   */
  const setLanguage = (lang) => {
    if (!Object.values(LANGUAGES).includes(lang)) {
      console.warn(`Language ${lang} not supported`);
      return;
    }

    currentLanguage = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    updateUI();
  };

  /**
   * Toggle between EN and ZH
   */
  const toggleLanguage = () => {
    const newLang = currentLanguage === LANGUAGES.EN ? LANGUAGES.ZH : LANGUAGES.EN;
    setLanguage(newLang);
  };

  /**
   * Translate a key with optional interpolation
   * @param {string} key - Translation key
   * @param {object} params - Optional parameters for interpolation
   */
  const t = (key, params = {}) => {
    let text = translations[currentLanguage]?.[key] || translations[LANGUAGES.EN][key] || key;

    // Simple interpolation for parameters like {count}
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(`{${paramKey}}`, value);
    });

    return text;
  };

  /**
   * Update all i18n elements in the DOM
   */
  const updateUI = () => {
    // Update text content
    const textElements = {
      appTitle: 'app-title',
      uploadTitle: 'uploadTitle',
      dropText: 'dropText',
      splitLabel: 'splitLabel',
      horizontalText: 'horizontalText',
      verticalText: 'verticalText',
      imagesTitle: 'imagesTitle',
      langLabel: 'langLabel',
      placeholderText: 'placeholderText',
    };

    for (const [key, id] of Object.entries(textElements)) {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = t(key);
      }
    }

    // Update document language attribute
    document.documentElement.lang = currentLanguage;
  };

  return {
    init,
    getCurrentLanguage,
    setLanguage,
    toggleLanguage,
    t,
    updateUI,
    LANGUAGES,
  };
})();

// Initialize immediately when script loads
i18n.init();

// Update UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  i18n.updateUI();
});
