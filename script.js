class PixelTailor {
    constructor() {
        this.images = [];
        this.splitLines = [];
        this.selectedParts = new Set();
        this.splitDirection = 'vertical';
        this.splitMode = 'auto';
        this.zoomLevel = 1;
        this.currentLanguage = 'zh';
        this.isDragging = false;
        this.draggedLine = null;
        this.dragStartPos = { x: 0, y: 0 };
        this.currentTool = 'add-split'; // 当前工具模式：move, add-split, remove-split, select
        
        this.translations = {
            zh: {
                'select-images': '选择图片',
                'split-direction': '分割方向：',
                'horizontal': '横向',
                'vertical': '竖向',
                'split-mode': '分割模式：',
                'auto': '自动',
                'manual': '手动',
                'equal-split': '等分数量：',
                'apply': '应用',
                'per-image-settings': '每张图片设置：',
                'zoom-out': '缩小',
                'zoom-in': '放大',
                'fit-screen': '适应屏幕',
                'select-parts': '选择要导出的部分：',
                'select-all': '全选',
                'deselect-all': '取消全选',
                'invert': '反选',
                'selected': '已选择：',
                'parts': '部分',
                'export-mode': '导出模式：',
                'merged': '合并为一张图片',
                'separate': '导出为独立图片',
                'format': '格式：',
                'export': '导出',
                'no-images': '请先选择图片',
                'split-success': '分割完成',
                'export-success': '导出成功',
                'invalid-count': '请输入有效的分割数量（2-20）',
                'min-distance': '分割线之间至少需要2像素的距离',
                'delete-line': '删除分割线',
                'right-click-to-delete': '右键点击删除分割线',
                'confirm-delete': '确认删除此分割线？',
                'cannot-delete': '无法删除：需要至少保留一个分割区域',
                'click-to-select': '挑选需要导出的部分：',
                'part': '部分',
                'toolbar-title': '工具模式',
                'move-canvas': '移动画布',
                'add-split': '添加分割线',
                'remove-split': '移除分割线',
                'select-parts': '挑选'
            },
            en: {
                'select-images': 'Select Images',
                'split-direction': 'Split Direction:',
                'horizontal': 'Horizontal',
                'vertical': 'Vertical',
                'split-mode': 'Split Mode:',
                'auto': 'Auto',
                'manual': 'Manual',
                'equal-split': 'Equal Parts:',
                'apply': 'Apply',
                'per-image-settings': 'Per Image Settings:',
                'zoom-out': 'Zoom Out',
                'zoom-in': 'Zoom In',
                'fit-screen': 'Fit Screen',
                'select-parts': 'Select Parts to Export:',
                'select-all': 'Select All',
                'deselect-all': 'Deselect All',
                'invert': 'Invert',
                'selected': 'Selected:',
                'parts': 'parts',
                'export-mode': 'Export Mode:',
                'merged': 'Merged Image',
                'separate': 'Separate Images',
                'format': 'Format:',
                'export': 'Export',
                'no-images': 'Please select images first',
                'split-success': 'Split completed',
                'export-success': 'Export successful',
                'invalid-count': 'Please enter a valid split count (2-20)',
                'min-distance': 'Minimum 2 pixels distance required between split lines',
                'delete-line': 'Delete Line',
                'right-click-to-delete': 'Right-click to delete split line',
                'confirm-delete': 'Confirm delete this split line?',
                'cannot-delete': 'Cannot delete: at least one split area must remain',
                'click-to-select': 'Select parts to export:',
                'part': 'Part',
                'toolbar-title': 'Tool Mode',
                'move-canvas': 'Move Canvas',
                'add-split': 'Add Split Line',
                'remove-split': 'Remove Split Line',
                'select-parts': 'Select'
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateLanguage();
    }
    
    setupEventListeners() {
        // 文件输入
        document.getElementById('image-input').addEventListener('change', (e) => this.handleImageUpload(e));
        
        // 分割设置
        document.querySelectorAll('input[name="direction"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleDirectionChange(e));
        });
        
        document.querySelectorAll('input[name="mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleModeChange(e));
        });
        
        // 手动分割控制
        document.getElementById('apply-split').addEventListener('click', () => this.applyManualSplit());
        
        // 缩放控制
        document.getElementById('zoom-out').addEventListener('click', () => this.zoom(-0.1));
        document.getElementById('zoom-in').addEventListener('click', () => this.zoom(0.1));
        document.getElementById('zoom-fit').addEventListener('click', () => this.fitToScreen());
        
        // 选择控制
        document.getElementById('select-all').addEventListener('click', () => this.selectAll());
        document.getElementById('deselect-all').addEventListener('click', () => this.deselectAll());
        document.getElementById('invert-selection').addEventListener('click', () => this.invertSelection());
        
        // 导出控制
        document.getElementById('export-btn').addEventListener('click', () => this.exportImages());
        
        // 语言切换
        document.getElementById('lang-zh').addEventListener('click', () => this.setLanguage('zh'));
        document.getElementById('lang-en').addEventListener('click', () => this.setLanguage('en'));
        
        // 工具栏事件
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleToolChange(e));
        });
        
        // Canvas 事件
        const canvas = document.getElementById('main-canvas');
        canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // 拖拽事件
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());
        
        // Canvas拖拽状态
        this.isCanvasDragging = false;
        this.canvasDragStart = { x: 0, y: 0 };
        this.canvasScrollStart = { x: 0, y: 0 };
        
        // 右键菜单事件
        document.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        
        // 初始化工具栏状态
        this.initializeToolbar();
    }
    
    initializeToolbar() {
        // 设置默认工具模式
        const defaultTool = document.querySelector('.toolbar-btn[data-mode="add-split"]');
        if (defaultTool) {
            defaultTool.click();
        }
    }
    
    handleImageUpload(event) {
        const files = Array.from(event.target.files);
        this.images = [];
        
        Promise.all(files.map(file => this.loadImage(file)))
            .then(() => {
                this.updatePerImageControls();
                this.processImages();
            })
            .catch(error => this.showToast(this.t('no-images')));
    }
    
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.images.push({
                        file: file,
                        element: img,
                        splitCount: 2
                    });
                    resolve();
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    updatePerImageControls() {
        const container = document.getElementById('per-image-controls');
        const list = document.getElementById('image-split-list');
        
        if (this.images.length > 1) {
            container.style.display = 'block';
            list.innerHTML = '';
            
            this.images.forEach((image, index) => {
                const item = document.createElement('div');
                item.className = 'image-split-item';
                item.innerHTML = `
                    <span>${this.t('image')} ${index + 1}:</span>
                    <input type="number" min="2" max="20" value="${image.splitCount}" 
                           data-index="${index}" class="split-count-input">
                    <span>${this.t('parts')}</span>
                `;
                list.appendChild(item);
            });
            
            list.querySelectorAll('.split-count-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    this.images[index].splitCount = parseInt(e.target.value);
                });
            });
        } else {
            container.style.display = 'none';
        }
    }
    
    processImages() {
        if (this.images.length === 0) return;
        
        this.renderImages();
        
        if (this.splitMode === 'auto') {
            this.autoSplit();
        } else {
            this.updateManualSplitInput();
        }
    }
    
    renderImages() {
        const canvas = document.getElementById('main-canvas');
        const ctx = canvas.getContext('2d');
        
        if (this.images.length === 0) return;
        
        if (this.splitDirection === 'horizontal') {
            // 横向拼接
            const totalWidth = this.images.reduce((sum, img) => sum + img.element.width, 0);
            const maxHeight = Math.max(...this.images.map(img => img.element.height));
            
            canvas.width = totalWidth;
            canvas.height = maxHeight;
            
            let currentX = 0;
            this.images.forEach(img => {
                ctx.drawImage(img.element, currentX, 0);
                currentX += img.element.width;
            });
        } else {
            // 竖向拼接
            const maxWidth = Math.max(...this.images.map(img => img.element.width));
            const totalHeight = this.images.reduce((sum, img) => sum + img.element.height, 0);
            
            canvas.width = maxWidth;
            canvas.height = totalHeight;
            
            let currentY = 0;
            this.images.forEach(img => {
                ctx.drawImage(img.element, 0, currentY);
                currentY += img.element.height;
            });
        }
        
        this.fitToWidth();
    }
    
    autoSplit() {
        this.splitLines = [];
        
        if (this.splitDirection === 'horizontal') {
            // 自动检测横向分割线
            let currentX = 0;
            this.images.forEach((image, imageIndex) => {
                const segmentWidth = image.element.width / image.splitCount;
                
                for (let i = 1; i < image.splitCount; i++) {
                    this.splitLines.push({
                        x: currentX + segmentWidth * i,
                        y: 0,
                        direction: 'vertical',
                        imageIndex: imageIndex,
                        position: i
                    });
                }
                
                // 图片之间的分割线
                if (imageIndex < this.images.length - 1) {
                    this.splitLines.push({
                        x: currentX + image.element.width,
                        y: 0,
                        direction: 'vertical',
                        imageIndex: imageIndex,
                        position: image.splitCount,
                        isImageBoundary: true
                    });
                }
                
                currentX += image.element.width;
            });
        } else {
            // 自动检测竖向分割线
            let currentY = 0;
            this.images.forEach((image, imageIndex) => {
                const segmentHeight = image.element.height / image.splitCount;
                
                for (let i = 1; i < image.splitCount; i++) {
                    this.splitLines.push({
                        x: 0,
                        y: currentY + segmentHeight * i,
                        direction: 'horizontal',
                        imageIndex: imageIndex,
                        position: i
                    });
                }
                
                // 图片之间的分割线
                if (imageIndex < this.images.length - 1) {
                    this.splitLines.push({
                        x: 0,
                        y: currentY + image.element.height,
                        direction: 'horizontal',
                        imageIndex: imageIndex,
                        position: image.splitCount,
                        isImageBoundary: true
                    });
                }
                
                currentY += image.element.height;
            });
        }
        
        this.renderSplitLines();
        this.updatePartSelectors();
    }
    
    applyManualSplit() {
        const countInput = document.getElementById('split-count');
        const count = parseInt(countInput.value);
        
        if (count < 2 || count > 20) {
            this.showToast(this.t('invalid-count'));
            return;
        }
        
        this.splitLines = [];
        
        if (this.images.length === 0) return;
        
        if (this.images.length === 1) {
            // 单张图片等分
            const image = this.images[0];
            this.createEqualSplits(image, 0, count);
        } else {
            // 多张图片，每张图片单独等分
            let currentPosition = 0;
            this.images.forEach((image, index) => {
                if (this.splitDirection === 'horizontal') {
                    this.createEqualSplits(image, currentPosition, image.splitCount);
                    currentPosition += image.element.width;
                } else {
                    this.createEqualSplits(image, currentPosition, image.splitCount);
                    currentPosition += image.element.height;
                }
            });
        }
        
        this.renderSplitLines();
        this.updatePartSelectors();
        this.showToast(this.t('split-success'));
    }
    
    createEqualSplits(image, offset, count) {
        if (this.splitDirection === 'horizontal') {
            const segmentWidth = image.element.width / count;
            for (let i = 1; i < count; i++) {
                this.splitLines.push({
                    x: offset + segmentWidth * i,
                    y: 0,
                    direction: 'vertical',
                    imageIndex: this.images.indexOf(image),
                    position: i
                });
            }
        } else {
            const segmentHeight = image.element.height / count;
            for (let i = 1; i < count; i++) {
                this.splitLines.push({
                    x: 0,
                    y: offset + segmentHeight * i,
                    direction: 'horizontal',
                    imageIndex: this.images.indexOf(image),
                    position: i
                });
            }
        }
    }
    
    renderSplitLines() {
        const container = document.getElementById('split-lines');
        container.innerHTML = '';
        
        const canvas = document.getElementById('main-canvas');
        const canvasContainer = document.querySelector('.canvas-container');
        
        // 计算canvas在容器中的实际位置
        const canvasDisplayWidth = canvas.width * this.zoomLevel;
        const canvasDisplayHeight = canvas.height * this.zoomLevel;
        const containerWidth = canvasContainer.clientWidth;
        const containerHeight = canvasContainer.clientHeight;
        
        // 计算canvas的实际偏移（考虑居中）
        let canvasOffsetX = 0;
        let canvasOffsetY = 0;
        if (canvasDisplayWidth < containerWidth) {
            canvasOffsetX = (containerWidth - canvasDisplayWidth) / 2;
        }
        if (canvasDisplayHeight < containerHeight) {
            canvasOffsetY = (containerHeight - canvasDisplayHeight) / 2;
        }
        
        // 设置容器位置与canvas完全对齐
        container.style.left = `${canvasOffsetX}px`;
        container.style.top = `${canvasOffsetY}px`;
        container.style.width = `${canvasDisplayWidth}px`;
        container.style.height = `${canvasDisplayHeight}px`;
        container.style.transform = 'none';
        
        this.splitLines.forEach((line, index) => {
            const lineElement = document.createElement('div');
            lineElement.className = `split-line ${line.direction}`;
            lineElement.dataset.index = index;
            lineElement.title = this.t('right-click-to-delete');
            
            const handle = document.createElement('div');
            handle.className = 'split-line-handle';
            lineElement.appendChild(handle);
            
            // 添加删除按钮
            const deleteBtn = document.createElement('div');
            deleteBtn.className = 'delete-line-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.title = this.t('delete-line');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSplitLine(index);
            });
            lineElement.appendChild(deleteBtn);
            
            if (line.direction === 'vertical') {
                const x = line.x * this.zoomLevel;
                lineElement.style.left = `${x}px`;
                lineElement.style.top = '0';
                lineElement.style.height = `${canvas.height * this.zoomLevel}px`;
                
                // 删除按钮位置（垂直线右侧）
                deleteBtn.style.left = '10px';
                deleteBtn.style.top = '50%';
                deleteBtn.style.transform = 'translateY(-50%)';
            } else {
                const y = line.y * this.zoomLevel;
                lineElement.style.left = '0';
                lineElement.style.top = `${y}px`;
                lineElement.style.width = `${canvas.width * this.zoomLevel}px`;
                
                // 删除按钮位置（水平线下方）
                deleteBtn.style.left = '50%';
                deleteBtn.style.top = '10px';
                deleteBtn.style.transform = 'translateX(-50%)';
            }
            
            container.appendChild(lineElement);
        });
    }
    
    updatePartSelectors() {
        const partCount = this.splitLines.length + 1;
        const selectorContainer = document.getElementById('part-selector-container');
        
        // 只有当有分割线时才显示选择器
        if (this.splitLines.length === 0) {
            selectorContainer.style.display = 'none';
            document.getElementById('part-overlays').innerHTML = '';
            this.updateSelectedCount();
            return;
        }
        
        selectorContainer.style.display = 'block';
        
        // 初始化选择状态（如果为空则全选）
        if (this.selectedParts.size === 0) {
            for (let i = 0; i < partCount; i++) {
                this.selectedParts.add(i);
            }
        }
        
        // 创建部分选择器
        this.createPartSelectors();
        
        // 创建部分覆盖层
        this.createPartOverlays();
        
        // 更新计数
        this.updateSelectedCount();
    }
    
    createPartSelectors() {
        const container = document.getElementById('part-selectors');
        container.innerHTML = '';
        
        const partCount = this.splitLines.length + 1;
        
        for (let i = 0; i < partCount; i++) {
            const selector = document.createElement('div');
            selector.className = 'part-selector';
            selector.dataset.partIndex = i;
            
            if (this.selectedParts.has(i)) {
                selector.classList.add('selected');
            }
            
            selector.innerHTML = `${this.t('part')} ${i + 1}`;
            selector.addEventListener('click', () => this.togglePartSelection(i));
            
            container.appendChild(selector);
        }
    }
    
    createPartOverlays() {
        const container = document.getElementById('part-overlays');
        container.innerHTML = '';
        
        const canvas = document.getElementById('main-canvas');
        const canvasContainer = document.querySelector('.canvas-container');
        const sortedLines = this.getSortedSplitLines();
        
        // 计算canvas在容器中的实际位置
        const canvasDisplayWidth = canvas.width * this.zoomLevel;
        const canvasDisplayHeight = canvas.height * this.zoomLevel;
        const containerWidth = canvasContainer.clientWidth;
        const containerHeight = canvasContainer.clientHeight;
        
        // 计算canvas的实际偏移（考虑居中）
        let canvasOffsetX = 0;
        let canvasOffsetY = 0;
        if (canvasDisplayWidth < containerWidth) {
            canvasOffsetX = (containerWidth - canvasDisplayWidth) / 2;
        }
        if (canvasDisplayHeight < containerHeight) {
            canvasOffsetY = (containerHeight - canvasDisplayHeight) / 2;
        }
        
        // 设置容器位置与canvas完全对齐
        container.style.left = `${canvasOffsetX}px`;
        container.style.top = `${canvasOffsetY}px`;
        container.style.width = `${canvasDisplayWidth}px`;
        container.style.height = `${canvasDisplayHeight}px`;
        container.style.transform = 'none';
        
        // 创建每个部分的覆盖层
        for (let i = 0; i < sortedLines.length + 1; i++) {
            const overlay = document.createElement('div');
            overlay.className = 'part-overlay';
            overlay.dataset.partIndex = i;
            
            // 根据当前工具模式设置pointer-events
            overlay.style.pointerEvents = this.currentTool === 'select' ? 'all' : 'none';
            
            if (!this.selectedParts.has(i)) {
                overlay.classList.add('dimmed');
            }
            
            // 计算覆盖层位置和尺寸
            const position = this.calculatePartBounds(i, sortedLines);
            
            if (this.splitDirection === 'horizontal') {
                overlay.style.left = `${position.x * this.zoomLevel}px`;
                overlay.style.top = '0';
                overlay.style.width = `${position.width * this.zoomLevel}px`;
                overlay.style.height = `${canvas.height * this.zoomLevel}px`;
            } else {
                overlay.style.left = '0';
                overlay.style.top = `${position.y * this.zoomLevel}px`;
                overlay.style.width = `${canvas.width * this.zoomLevel}px`;
                overlay.style.height = `${position.height * this.zoomLevel}px`;
            }
            
            overlay.addEventListener('click', () => this.togglePartSelection(i));
            
            container.appendChild(overlay);
        }
    }
    
    getSortedSplitLines() {
        return [...this.splitLines].sort((a, b) => {
            if (this.splitDirection === 'horizontal') {
                return a.x - b.x;
            } else {
                return a.y - b.y;
            }
        });
    }
    
    calculatePartBounds(partIndex, sortedLines) {
        const canvas = document.getElementById('main-canvas');
        
        if (this.splitDirection === 'horizontal') {
            const startX = partIndex === 0 ? 0 : sortedLines[partIndex - 1].x;
            const endX = partIndex === sortedLines.length ? canvas.width : sortedLines[partIndex].x;
            
            return {
                x: startX,
                y: 0,
                width: endX - startX,
                height: canvas.height
            };
        } else {
            const startY = partIndex === 0 ? 0 : sortedLines[partIndex - 1].y;
            const endY = partIndex === sortedLines.length ? canvas.height : sortedLines[partIndex].y;
            
            return {
                x: 0,
                y: startY,
                width: canvas.width,
                height: endY - startY
            };
        }
    }
    
    togglePartSelection(partIndex) {
        if (this.selectedParts.has(partIndex)) {
            this.selectedParts.delete(partIndex);
        } else {
            this.selectedParts.add(partIndex);
        }
        
        this.updatePartSelectors();
    }
    
    updateSelectedCount() {
        document.getElementById('selected-count').textContent = this.selectedParts.size;
    }
    
    handleToolChange(event) {
        const newTool = event.target.dataset.mode;
        this.currentTool = newTool;
        
        // 更新工具栏按钮状态
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // 如果切换到添加分割线或移除分割线模式，确保应用在手动模式
        if (newTool === 'add-split' || newTool === 'remove-split') {
            if (this.splitMode !== 'manual') {
                this.splitMode = 'manual';
                // 更新UI显示
                document.querySelector('input[name="mode"][value="manual"]').checked = true;
                this.handleModeChange({ target: { value: 'manual' } });
            }
        }
        
        // 根据工具模式更新光标样式
        const canvas = document.getElementById('main-canvas');
        switch (this.currentTool) {
            case 'move':
                canvas.style.cursor = 'grab';
                break;
            case 'add-split':
                canvas.style.cursor = 'crosshair';
                break;
            case 'remove-split':
                canvas.style.cursor = 'not-allowed';
                break;
            case 'select':
                canvas.style.cursor = 'pointer';
                break;
        }
        
        // 更新分割线的光标样式
        document.querySelectorAll('.split-line').forEach(line => {
            switch (this.currentTool) {
                case 'move':
                    line.style.cursor = 'move';
                    break;
                case 'remove-split':
                    line.style.cursor = 'pointer';
                    break;
                default:
                    line.style.cursor = 'default';
            }
        });
        
        // 根据工具模式更新覆盖层的pointer-events
        const overlays = document.querySelectorAll('.part-overlay');
        overlays.forEach(overlay => {
            if (this.currentTool === 'select') {
                overlay.style.pointerEvents = 'all';
            } else {
                overlay.style.pointerEvents = 'none';
            }
        });
    }
    
    handleCanvasClick(event) {
        if (this.isDragging) return;
        
        // 在挑选模式下，检查是否点击在覆盖层上
        if (this.currentTool === 'select' && event.target.classList.contains('part-overlay')) {
            return;
        }
        
        // 根据当前工具模式执行不同操作
        switch (this.currentTool) {
            case 'add-split':
                this.handleAddSplitClick(event);
                break;
            case 'remove-split':
                // 在remove-split模式下，canvas点击不执行操作
                break;
            case 'select':
                // 在挑选模式下，点击canvas选择对应的图片部分
                this.handlePartSelection(event);
                break;
            case 'move':
                // 移动画布模式下不执行特殊操作
                break;
        }
    }
    
    handlePartSelection(event) {
        if (this.splitLines.length === 0) return;
        
        const canvas = document.getElementById('main-canvas');
        const container = document.querySelector('.canvas-container');
        const containerRect = container.getBoundingClientRect();
        
        // 获取canvas的实际显示位置和尺寸
        const canvasDisplayWidth = canvas.width * this.zoomLevel;
        const canvasDisplayHeight = canvas.height * this.zoomLevel;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // 计算canvas的实际偏移（考虑居中）
        let canvasOffsetX = 0;
        let canvasOffsetY = 0;
        if (canvasDisplayWidth < containerWidth) {
            canvasOffsetX = (containerWidth - canvasDisplayWidth) / 2;
        }
        if (canvasDisplayHeight < containerHeight) {
            canvasOffsetY = (containerHeight - canvasDisplayHeight) / 2;
        }
        
        // 计算相对于canvas实际像素的位置
        const x = (event.clientX - containerRect.left - canvasOffsetX) / this.zoomLevel;
        const y = (event.clientY - containerRect.top - canvasOffsetY) / this.zoomLevel;
        
        // 确保点击位置在canvas范围内
        if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
            // 计算点击位置对应的图片部分索引
            const partIndex = this.getPartIndexForPosition(x, y);
            if (partIndex !== -1) {
                this.togglePartSelection(partIndex);
            }
        }
    }
    
    getPartIndexForPosition(x, y) {
        // 如果没有分割线，只有一个部分
        if (this.splitLines.length === 0) {
            return 0;
        }
        
        const canvas = document.getElementById('main-canvas');
        
        // 按分割位置排序
        const sortedLines = [...this.splitLines].sort((a, b) => {
            if (this.splitDirection === 'vertical') {
                return a.x - b.x;
            } else {
                return a.y - b.y;
            }
        });
        
        // 计算点击位置对应的分割部分
        if (this.splitDirection === 'vertical') {
            for (let i = 0; i <= sortedLines.length; i++) {
                const left = i === 0 ? 0 : sortedLines[i - 1].x;
                const right = i === sortedLines.length ? canvas.width : sortedLines[i].x;
                if (x >= left && x < right) {
                    return i;
                }
            }
        } else {
            for (let i = 0; i <= sortedLines.length; i++) {
                const top = i === 0 ? 0 : sortedLines[i - 1].y;
                const bottom = i === sortedLines.length ? canvas.height : sortedLines[i].y;
                if (y >= top && y < bottom) {
                    return i;
                }
            }
        }
        
        return -1;
    }
    
    togglePartSelection(partIndex) {
        if (this.selectedParts.has(partIndex)) {
            this.selectedParts.delete(partIndex);
        } else {
            this.selectedParts.add(partIndex);
        }
        this.updatePartSelectors();
        this.updateSelectedCount();
    }
    
    handleAddSplitClick(event) {
        const canvas = document.getElementById('main-canvas');
        const container = document.querySelector('.canvas-container');
        const containerRect = container.getBoundingClientRect();
        
        // 获取canvas的实际显示位置和尺寸
        const canvasDisplayWidth = canvas.width * this.zoomLevel;
        const canvasDisplayHeight = canvas.height * this.zoomLevel;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // 计算canvas的实际偏移（考虑居中）
        let canvasOffsetX = 0;
        let canvasOffsetY = 0;
        if (canvasDisplayWidth < containerWidth) {
            canvasOffsetX = (containerWidth - canvasDisplayWidth) / 2;
        }
        if (canvasDisplayHeight < containerHeight) {
            canvasOffsetY = (containerHeight - canvasDisplayHeight) / 2;
        }
        
        // 计算相对于canvas实际像素的位置
        const x = (event.clientX - containerRect.left - canvasOffsetX) / this.zoomLevel;
        const y = (event.clientY - containerRect.top - canvasOffsetY) / this.zoomLevel;
        
        // 确保点击位置在canvas范围内
        if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
            if (this.splitDirection === 'horizontal') {
                // 横向分割：添加垂直分割线
                this.addSplitLine(x, 0, 'vertical');
            } else {
                // 竖向分割：添加水平分割线
                this.addSplitLine(0, y, 'horizontal');
            }
        }
    }
    
    addSplitLine(x, y, direction) {
        // 检查与现有分割线的最小距离
        const minDistance = 2;
        const position = direction === 'vertical' ? x : y;
        
        const isValidPosition = this.splitLines.every(line => {
            const linePosition = direction === 'vertical' ? line.x : line.y;
            return Math.abs(linePosition - position) >= minDistance;
        });
        
        if (!isValidPosition) {
            this.showToast(this.t('min-distance'));
            return;
        }
        
        // 在添加分割线之前，保存被分割区域的选择状态
        const affectedPartIndex = this.getPartIndexForPosition(x, y);
        const wasSelected = this.selectedParts.has(affectedPartIndex);
        
        this.splitLines.push({
            x: x,
            y: y,
            direction: direction,
            imageIndex: this.getImageIndexForPosition(x, y),
            position: this.splitLines.length + 1
        });
        
        this.splitLines.sort((a, b) => {
            if (direction === 'vertical') {
                return a.x - b.x;
            } else {
                return a.y - b.y;
            }
        });
        
        // 重新计算部分选择状态
        this.updateSelectedPartsAfterSplit(affectedPartIndex, wasSelected);
        
        this.renderSplitLines();
        this.updatePartSelectors();
    }
    
    updateSelectedPartsAfterSplit(oldPartIndex, wasSelected) {
        if (!wasSelected) return;
        
        // 创建新的选择状态集合
        const newSelectedParts = new Set();
        
        // 获取所有旧的选择部分
        this.selectedParts.forEach(index => {
            if (index < oldPartIndex) {
                // 在被分割区域之前的部分，索引不变
                newSelectedParts.add(index);
            } else if (index > oldPartIndex) {
                // 在被分割区域之后的部分，索引向后移动1
                newSelectedParts.add(index + 1);
            }
            // 如果 index === oldPartIndex，这里不处理，因为它被分割了
        });
        
        // 如果被分割的区域原本被选择，则新分割出来的两个区域都被选择
        if (wasSelected) {
            newSelectedParts.add(oldPartIndex);
            newSelectedParts.add(oldPartIndex + 1);
        }
        
        // 更新选择状态
        this.selectedParts = newSelectedParts;
    }
    
    getImageIndexForPosition(x, y) {
        if (this.images.length === 0) return 0;
        
        if (this.splitDirection === 'horizontal') {
            let currentX = 0;
            for (let i = 0; i < this.images.length; i++) {
                if (x >= currentX && x < currentX + this.images[i].element.width) {
                    return i;
                }
                currentX += this.images[i].element.width;
            }
        } else {
            let currentY = 0;
            for (let i = 0; i < this.images.length; i++) {
                if (y >= currentY && y < currentY + this.images[i].element.height) {
                    return i;
                }
                currentY += this.images[i].element.height;
            }
        }
        
        return this.images.length - 1;
    }
    
    handleMouseDown(event) {
        // 处理删除分割线模式
        if (this.currentTool === 'remove-split' && event.target.classList.contains('split-line')) {
            const lineElement = event.target.closest('.split-line');
            const index = parseInt(lineElement.dataset.index);
            this.deleteSplitLine(index);
            event.preventDefault();
            return;
        }
        
        // 处理分割线拖拽（在移动画布模式下）
        if ((this.currentTool === 'move' || this.currentTool === 'add-split') && 
            (event.target.classList.contains('split-line') || event.target.classList.contains('split-line-handle'))) {
            this.isDragging = true;
            this.draggedLine = event.target.closest('.split-line');
            this.dragStartPos = {
                x: event.clientX,
                y: event.clientY
            };
            event.preventDefault();
            return;
        }
        
        // 处理画布拖拽（在移动画布模式下）
        if (this.currentTool === 'move' && event.target.id === 'main-canvas') {
            const container = document.querySelector('.canvas-container');
            this.isCanvasDragging = true;
            this.canvasDragStart = {
                x: event.clientX,
                y: event.clientY
            };
            this.canvasScrollStart = {
                x: container.scrollLeft,
                y: container.scrollTop
            };
            event.target.style.cursor = 'grabbing';
            event.preventDefault();
        }
    }
    
    handleMouseMove(event) {
        // 处理画布拖拽
        if (this.isCanvasDragging) {
            const container = document.querySelector('.canvas-container');
            const deltaX = event.clientX - this.canvasDragStart.x;
            const deltaY = event.clientY - this.canvasDragStart.y;
            
            container.scrollLeft = this.canvasScrollStart.x - deltaX;
            container.scrollTop = this.canvasScrollStart.y - deltaY;
            return;
        }
        
        // 处理分割线拖拽
        if (!this.isDragging || !this.draggedLine) return;
        
        const canvas = document.getElementById('main-canvas');
        const container = document.querySelector('.canvas-container');
        const containerRect = container.getBoundingClientRect();
        
        // 获取canvas的实际显示位置和尺寸
        const canvasDisplayWidth = canvas.width * this.zoomLevel;
        const canvasDisplayHeight = canvas.height * this.zoomLevel;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // 计算canvas的实际偏移（考虑居中）
        let canvasOffsetX = 0;
        let canvasOffsetY = 0;
        if (canvasDisplayWidth < containerWidth) {
            canvasOffsetX = (containerWidth - canvasDisplayWidth) / 2;
        }
        if (canvasDisplayHeight < containerHeight) {
            canvasOffsetY = (containerHeight - canvasDisplayHeight) / 2;
        }
        
        const index = parseInt(this.draggedLine.dataset.index);
        const line = this.splitLines[index];
        
        if (line.direction === 'vertical') {
            const newX = (event.clientX - containerRect.left - canvasOffsetX) / this.zoomLevel;
            
            // 确保在canvas范围内
            if (newX >= 2 && newX <= canvas.width - 2) {
                // 检查最小距离
                const isValidPosition = this.splitLines.every((otherLine, otherIndex) => {
                    if (otherIndex === index) return true;
                    return Math.abs(otherLine.x - newX) >= 2;
                });
                
                if (isValidPosition) {
                    line.x = newX;
                    this.draggedLine.style.left = `${newX * this.zoomLevel}px`;
                }
            }
        } else {
            const newY = (event.clientY - containerRect.top - canvasOffsetY) / this.zoomLevel;
            
            // 确保在canvas范围内
            if (newY >= 2 && newY <= canvas.height - 2) {
                // 检查最小距离
                const isValidPosition = this.splitLines.every((otherLine, otherIndex) => {
                    if (otherIndex === index) return true;
                    return Math.abs(otherLine.y - newY) >= 2;
                });
                
                if (isValidPosition) {
                    line.y = newY;
                    this.draggedLine.style.top = `${newY * this.zoomLevel}px`;
                }
            }
        }
    }
    
    handleMouseUp() {
        const wasDragging = this.isDragging || this.isCanvasDragging;
        
        this.isDragging = false;
        this.draggedLine = null;
        
        if (this.isCanvasDragging) {
            this.isCanvasDragging = false;
            const canvas = document.getElementById('main-canvas');
            canvas.style.cursor = 'grab';
        }
        
        // 如果刚刚在拖拽分割线，需要更新覆盖层
        if (wasDragging && this.splitLines.length > 0) {
            this.updatePartSelectors();
        }
    }
    
    handleContextMenu(event) {
        event.preventDefault();
        
        // 只在移动画布或添加分割线模式下才允许右键删除
        if (this.currentTool === 'move' || this.currentTool === 'add-split') {
            // 检查是否点击在分割线上
            const target = event.target;
            if (target.classList.contains('split-line') || target.classList.contains('split-line-handle')) {
                const lineElement = target.closest('.split-line');
                const index = parseInt(lineElement.dataset.index);
                this.deleteSplitLine(index);
            }
        }
    }
    
    deleteSplitLine(index) {
        // 检查是否可以删除（至少需要一个分割区域）
        if (this.splitLines.length <= 1) {
            this.showToast(this.t('cannot-delete'));
            return;
        }
        
        // 确认删除
        if (confirm(this.t('confirm-delete'))) {
            // 删除分割线
            this.splitLines.splice(index, 1);
            
            // 重新渲染分割线
            this.renderSplitLines();
            
            // 更新选择器
            this.updatePartSelectors();
            
            // 显示成功消息
            this.showToast(this.t('split-success'));
        }
    }
    
    handleDirectionChange(event) {
        this.splitDirection = event.target.value;
        this.processImages();
    }
    
    handleModeChange(event) {
        this.splitMode = event.target.value;
        const manualControls = document.getElementById('manual-controls');
        
        if (this.splitMode === 'manual') {
            manualControls.style.display = 'block';
            this.updateManualSplitInput();
        } else {
            manualControls.style.display = 'none';
            this.processImages();
        }
    }
    
    updateManualSplitInput() {
        const countInput = document.getElementById('split-count');
        countInput.value = this.images.length > 0 ? this.images[0].splitCount : 2;
    }
    
    zoom(delta) {
        this.zoomLevel = Math.max(0.1, Math.min(3, this.zoomLevel + delta));
        this.updateZoom();
    }
    
    updateZoom() {
        const canvas = document.getElementById('main-canvas');
        const container = document.querySelector('.canvas-container');
        
        // 设置canvas的显示尺寸，而不是使用transform缩放
        canvas.style.width = `${canvas.width * this.zoomLevel}px`;
        canvas.style.height = `${canvas.height * this.zoomLevel}px`;
        canvas.style.transform = 'none';
        
        // 居中画布
        this.centerCanvas();
        
        document.getElementById('zoom-level').textContent = `${Math.round(this.zoomLevel * 100)}%`;
        
        this.renderSplitLines();
        this.updatePartSelectors(); // 同时更新覆盖层
    }
    
    centerCanvas() {
        const canvas = document.getElementById('main-canvas');
        const container = document.querySelector('.canvas-container');
        
        const canvasDisplayWidth = canvas.width * this.zoomLevel;
        const canvasDisplayHeight = canvas.height * this.zoomLevel;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // 如果画布比容器小，则居中；否则正常显示（容器会有滚动条）
        if (canvasDisplayWidth < containerWidth) {
            canvas.style.marginLeft = `${(containerWidth - canvasDisplayWidth) / 2}px`;
        } else {
            canvas.style.marginLeft = '0px';
        }
        
        if (canvasDisplayHeight < containerHeight) {
            canvas.style.marginTop = `${(containerHeight - canvasDisplayHeight) / 2}px`;
        } else {
            canvas.style.marginTop = '0px';
        }
    }
    
    fitToScreen() {
        const container = document.querySelector('.canvas-container');
        const canvas = document.getElementById('main-canvas');
        
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;
        
        const scaleX = containerWidth / canvas.width;
        const scaleY = containerHeight / canvas.height;
        
        this.zoomLevel = Math.min(scaleX, scaleY, 1);
        this.updateZoom();
    }
    
    fitToWidth() {
        const container = document.querySelector('.canvas-container');
        const canvas = document.getElementById('main-canvas');
        
        const containerWidth = container.clientWidth - 40;
        const scaleX = containerWidth / canvas.width;
        
        this.zoomLevel = Math.min(scaleX, 1);
        this.updateZoom();
    }
    
    selectAll() {
        const partCount = this.splitLines.length + 1;
        this.selectedParts.clear();
        for (let i = 0; i < partCount; i++) {
            this.selectedParts.add(i);
        }
        this.updateSelectedCount();
    }
    
    deselectAll() {
        this.selectedParts.clear();
        this.updateSelectedCount();
    }
    
    invertSelection() {
        const partCount = this.splitLines.length + 1;
        const newSelection = new Set();
        
        for (let i = 0; i < partCount; i++) {
            if (!this.selectedParts.has(i)) {
                newSelection.add(i);
            }
        }
        
        this.selectedParts = newSelection;
        this.updateSelectedCount();
    }
    
    async exportImages() {
        if (this.images.length === 0) {
            this.showToast(this.t('no-images'));
            return;
        }
        
        if (this.selectedParts.size === 0) {
            this.showToast('请至少选择一个部分');
            return;
        }
        
        const exportMode = document.querySelector('input[name="export-mode"]:checked').value;
        const format = document.getElementById('format-select').value;
        
        const parts = this.extractParts();
        const selectedPartsData = parts.filter((_, index) => this.selectedParts.has(index));
        
        if (exportMode === 'merged') {
            await this.exportMerged(selectedPartsData, format);
        } else {
            await this.exportSeparate(selectedPartsData, format);
        }
        
        this.showToast(this.t('export-success'));
    }
    
    extractParts() {
        const canvas = document.getElementById('main-canvas');
        const parts = [];
        
        if (this.splitDirection === 'horizontal') {
            // 横向分割
            let previousX = 0;
            const sortedLines = [...this.splitLines].sort((a, b) => a.x - b.x);
            
            for (let i = 0; i <= sortedLines.length; i++) {
                const currentX = i < sortedLines.length ? sortedLines[i].x : canvas.width;
                const width = currentX - previousX;
                
                if (width > 0) {
                    const partCanvas = document.createElement('canvas');
                    partCanvas.width = width;
                    partCanvas.height = canvas.height;
                    const partCtx = partCanvas.getContext('2d');
                    
                    partCtx.drawImage(canvas, -previousX, 0);
                    parts.push(partCanvas);
                }
                
                previousX = currentX;
            }
        } else {
            // 竖向分割
            let previousY = 0;
            const sortedLines = [...this.splitLines].sort((a, b) => a.y - b.y);
            
            for (let i = 0; i <= sortedLines.length; i++) {
                const currentY = i < sortedLines.length ? sortedLines[i].y : canvas.height;
                const height = currentY - previousY;
                
                if (height > 0) {
                    const partCanvas = document.createElement('canvas');
                    partCanvas.width = canvas.width;
                    partCanvas.height = height;
                    const partCtx = partCanvas.getContext('2d');
                    
                    partCtx.drawImage(canvas, 0, -previousY);
                    parts.push(partCanvas);
                }
                
                previousY = currentY;
            }
        }
        
        return parts;
    }
    
    async exportMerged(parts, format) {
        if (parts.length === 0) return;
        
        // 计算合并后的尺寸
        let totalWidth = 0;
        let totalHeight = 0;
        
        if (this.splitDirection === 'horizontal') {
            totalWidth = parts.reduce((sum, part) => sum + part.width, 0);
            totalHeight = Math.max(...parts.map(part => part.height));
        } else {
            totalWidth = Math.max(...parts.map(part => part.width));
            totalHeight = parts.reduce((sum, part) => sum + part.height, 0);
        }
        
        // 创建合并画布
        const mergedCanvas = document.createElement('canvas');
        mergedCanvas.width = totalWidth;
        mergedCanvas.height = totalHeight;
        const mergedCtx = mergedCanvas.getContext('2d');
        
        // 绘制各个部分
        let currentPosition = 0;
        parts.forEach(part => {
            if (this.splitDirection === 'horizontal') {
                mergedCtx.drawImage(part, currentPosition, 0);
                currentPosition += part.width;
            } else {
                mergedCtx.drawImage(part, 0, currentPosition);
                currentPosition += part.height;
            }
        });
        
        // 下载合并后的图片
        const mimeType = this.getMimeType(format);
        const dataUrl = mergedCanvas.toDataURL(mimeType);
        this.downloadImage(dataUrl, `pixel-tailor-merged.${format}`);
    }
    
    async exportSeparate(parts, format) {
        const mimeType = this.getMimeType(format);
        
        parts.forEach((part, index) => {
            const dataUrl = part.toDataURL(mimeType);
            this.downloadImage(dataUrl, `pixel-tailor-part-${index + 1}.${format}`);
        });
    }
    
    getMimeType(format) {
        const mimeTypes = {
            'png': 'image/png',
            'jpeg': 'image/jpeg',
            'webp': 'image/webp'
        };
        return mimeTypes[format] || 'image/png';
    }
    
    downloadImage(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    setLanguage(lang) {
        this.currentLanguage = lang;
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`lang-${lang}`).classList.add('active');
        this.updateLanguage();
    }
    
    updateLanguage() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            element.textContent = this.t(key);
        });
    }
    
    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new PixelTailor();
});