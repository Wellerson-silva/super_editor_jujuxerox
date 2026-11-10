// ==================================================
//                   CONSTANTES
// ==================================================

const zoomWrapper = document.getElementById('zoomWrapper');
const zoomIndicator = document.getElementById('zoomIndicator');
const canvasContainer = document.getElementById('canvasContainer');
const a4Sheet = document.querySelector('.a4-sheet');
const fileUploadInput = document.getElementById('fileUploadInput');
const uploadButtonLabel = document.getElementById('uploadButtonLabel');
const downloadButton = document.getElementById('downloadButton');
const addPageBtn = document.getElementById('addPageBtn');
const resizeBtn = document.getElementById('resizeBtn');
const cropBtn = document.getElementById('cropBtn');
const toolBtns = document.querySelectorAll('.tool-btn');
const flipBtn = document.getElementById('flipBtn');
const imageToolbar = document.getElementById('imageToolbar'); // Toolbar Flutuante

// ==================================================
//                 VARIÁVEIS GLOBAIS
// ==================================================

let currentZoom = 0.4;
let sheetX = 0;
let sheetY = 0;
let activeTool = null;
let globalZIndexCounter = 10;

// ======================================================
//            FUNÇÕES AUXILIARES DE TOOLBAR E SELEÇÃO
// ======================================================

function showImageToolbar() {
    if (imageToolbar) {
        imageToolbar.classList.remove('hidden');
    }
}

function hideImageToolbar() {
    if (imageToolbar) {
        imageToolbar.classList.add('hidden');
    }
}

function deselectAllImages() {
    document.querySelectorAll('.image-container-wrapper').forEach(c => {
        c.classList.remove('selected', 'rotate-active');
        const handles = c.querySelectorAll('.resize-handle');
        handles.forEach(h => h.classList.remove('active'));
        
        const cropBox = c.querySelector('.crop-box');
        const cropConfirmBtn = c.querySelector('.crop-confirm-btn');
        if (cropBox) cropBox.classList.remove('active');
        if (cropConfirmBtn) cropConfirmBtn.classList.remove('active');
    });
}

function selectImage(container) {
    deselectAllImages();
    container.classList.add('selected');
    
    // Traz a imagem clicada para a camada mais alta
    globalZIndexCounter++;
    container.style.zIndex = globalZIndexCounter;
    
    showImageToolbar();
}

// Clicar no fundo (fora de qualquer imagem) limpa a seleção
if (canvasContainer) {
    canvasContainer.addEventListener('click', (e) => {
        if (e.target === canvasContainer || e.target === zoomWrapper || e.target.classList.contains('a4-sheet')) {
            deselectAllImages();
            toolBtns.forEach(b => b.classList.remove('active-tool'));
            activeTool = null;
            hideImageToolbar();
        }
    });
}

// ======================================================
//        CONTROLE DOS BOTÕES (AÇÃO NA IMAGEM SELECIONADA)
// ======================================================

toolBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();

        const selectedContainer = document.querySelector('.image-container-wrapper.selected');
        
        if (!selectedContainer) {
            alert("Por favor, clique primeiro numa imagem para selecioná-la!");
            return;
        }

        if (btn.classList.contains('active-tool')) {
            btn.classList.remove('active-tool');
            activeTool = null;
            
            selectedContainer.classList.remove('rotate-active', 'tool-move', 'tool-resize', 'tool-crop', 'tool-rotate');
            const handles = selectedContainer.querySelectorAll('.resize-handle');
            handles.forEach(h => h.classList.remove('active'));
            
            const cropBox = selectedContainer.querySelector('.crop-box');
            const cropConfirmBtn = selectedContainer.querySelector('.crop-confirm-btn');
            if (cropBox) cropBox.classList.remove('active');
            if (cropConfirmBtn) cropConfirmBtn.classList.remove('active');
            return;
        }

        toolBtns.forEach(b => b.classList.remove('active-tool'));
        btn.classList.add('active-tool');

        // Reseta estados visuais anteriores
        selectedContainer.classList.remove('rotate-active', 'tool-move', 'tool-resize', 'tool-crop', 'tool-rotate');
        const handles = selectedContainer.querySelectorAll('.resize-handle');
        handles.forEach(h => h.classList.remove('active'));
        
        const cropBox = selectedContainer.querySelector('.crop-box');
        const cropConfirmBtn = selectedContainer.querySelector('.crop-confirm-btn');
        if (cropBox) cropBox.classList.remove('active');
        if (cropConfirmBtn) cropConfirmBtn.classList.remove('active');

        // Ativa a ferramenta e a classe de cursor correspondente
        if (btn.id === 'resizeBtn') {
            activeTool = 'resize';
            selectedContainer.classList.add('tool-resize');
            handles.forEach(h => h.classList.add('active'));
        } 
        else if (btn.id === 'cropBtn') {
            activeTool = 'crop';
            selectedContainer.classList.add('tool-crop');
            const img = selectedContainer.querySelector('img');

            if (img && cropBox && cropConfirmBtn) {
                const width = img.offsetWidth;
                const height = img.offsetHeight;

                cropBox.style.left = '0px';
                cropBox.style.top = '0px';
                cropBox.style.width = `${width}px`;
                cropBox.style.height = `${height}px`;
                cropBox.classList.add('active');

                cropConfirmBtn.style.left = `${width + 8}px`;
                cropConfirmBtn.style.top = '0px';
                cropConfirmBtn.classList.add('active');
            }
        } 
        else if (btn.id === 'moveToolBtn') {
            activeTool = 'move';
            selectedContainer.classList.add('tool-move');
        }  
        else if (btn.id === 'rotateBtn') {
            activeTool = 'rotate';
            selectedContainer.classList.add('rotate-active', 'tool-rotate');
        } 
        else if (btn.id === 'flipBtn') {
            const img = selectedContainer.querySelector('img');
            if (img) {
                let currentFlip = parseFloat(img.dataset.flipH || '1');
                let newFlip = currentFlip === 1 ? -1 : 1;
                img.dataset.flipH = newFlip;
                img.style.transform = `scaleX(${newFlip})`;
            }
        }
    });
});

// ======================================================
//                CONTROLES DE ZOOM NA TELA
// ======================================================

if (canvasContainer) {
    canvasContainer.addEventListener('wheel', function(e) {
        e.preventDefault();

        const zoomStep = 0.1;
        if (e.deltaY < 0) {
            currentZoom += zoomStep;
            if (currentZoom > 3.0) currentZoom = 3.0;
        } else {
            currentZoom -= zoomStep;
            if (currentZoom < 0.4) currentZoom = 0.4;
        }

        zoomWrapper.style.zoom = currentZoom;
        if (zoomIndicator) {
            zoomIndicator.innerText = `Zoom: ${Math.round(currentZoom * 100)}%`;
        }
    }, { passive: false });
}

// ==========================================
//          LÓGICA DE UPLOAD DE ARQUIVO
// ==========================================

if (fileUploadInput) {
    fileUploadInput.setAttribute('multiple', 'true');

    fileUploadInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            let firstSheet = zoomWrapper.querySelector('.a4-sheet');
            let isFirstSheetEmpty = firstSheet && firstSheet.querySelector('.sheet-label');

            Array.from(files).forEach((file, index) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();

                    reader.onload = function(event) {
                        let targetSheet;

                        if (index === 0 && isFirstSheetEmpty) {
                            targetSheet = firstSheet;
                            targetSheet.innerHTML = '';
                        } else {
                            targetSheet = document.createElement('div');
                            targetSheet.className = 'a4-sheet';
                            zoomWrapper.appendChild(targetSheet);
                        }
                        
                        addDeleteButtonToSheet(targetSheet);

                        const img = document.createElement('img');
                        img.src = event.target.result;
                        img.alt = file.name;
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'contain';
                        img.style.display = 'block';

                        targetSheet.appendChild(img);

                        makeImageInteractive(img);
                    };

                    reader.readAsDataURL(file);
                }
            });
        }
    });
}

// ==========================================
//      LÓGICA DO BOTÃO ADICIONAR PÁGINA
// ==========================================

if (addPageBtn) {
    addPageBtn.addEventListener('click', () => {
        if (zoomWrapper) {
            const newSheet = document.createElement('div');
            newSheet.className = 'a4-sheet';

            addDeleteButtonToSheet(newSheet);
            
            const label = document.createElement('span');
            label.className = 'sheet-label';
            label.innerText = `Jujuxerox | A4 (${zoomWrapper.children.length + 1})`;
            newSheet.appendChild(label);

            zoomWrapper.appendChild(newSheet);
            newSheet.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// ==========================================
//       LÓGICA DE DOWNLOAD / EXPORTAÇÃO
// ==========================================

if (downloadButton) {
    downloadButton.addEventListener('click', () => {
        alert("Funcionalidade de download em desenvolvimento!");
    });
}

// ==========================================
//     LÓGICA DO BOTÃO DE EXCLUIR PÁGINA
// ==========================================

function addDeleteButtonToSheet(sheet) {
    if (sheet.querySelector('.delete-page-btn')) return;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-page-btn';
    deleteBtn.title = 'Excluir página';
    deleteBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
    `;

    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const totalSheets = zoomWrapper.querySelectorAll('.a4-sheet').length;
        
        if (totalSheets > 1) {
            sheet.remove();
            hideImageToolbar();
        } else {
            alert("Você não pode excluir a única página restante!");
        }
    });

    sheet.appendChild(deleteBtn);
}

const initialSheet = document.querySelector('.a4-sheet');
if (initialSheet) {
    addDeleteButtonToSheet(initialSheet);
}

// ===========================================
//      GERENCIADOR INTERATIVO DA IMAGEM
// ===========================================

function makeImageInteractive(img) {
    const container = document.createElement('div');
    container.className = 'image-container-wrapper';
    container.style.position = 'absolute';
    container.style.left = '20px';
    container.style.top = '20px';
    container.style.display = 'inline-block';
    
    img.parentNode.insertBefore(container, img);
    container.appendChild(img);

    img.style.width = '200px';
    img.style.height = 'auto';
    img.style.display = 'block';
    //img.style.cursor = 'move';
    img.draggable = false;

    // Alças de redimensionamento da imagem
    const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    const handleElements = {};

    handles.forEach(pos => {
        let handle = document.createElement('div');
        handle.className = `resize-handle ${pos}`;
        container.appendChild(handle);
        handleElements[pos] = handle;
    });

    // Alça visual de rotação
    const rotContainer = document.createElement('div');
    rotContainer.className = 'rotation-handle-container';
    
    const rotLine = document.createElement('div');
    rotLine.className = 'rotation-line';
    
    const rotHandle = document.createElement('div');
    rotHandle.className = 'rotation-handle';
    rotHandle.title = 'Arraste para rotacionar';

    const rotTooltip = document.createElement('div');
    rotTooltip.className = 'rotation-tooltip';
    rotTooltip.innerText = '0°';

    rotContainer.appendChild(rotTooltip);
    rotContainer.appendChild(rotLine);
    rotContainer.appendChild(rotHandle);
    container.appendChild(rotContainer);

    let isRotating = false;

    rotHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isRotating = true;
        startX = e.clientX;
        activeTool = 'rotate';
        selectImage(container);
    });

    // Caixa de Corte e Botão de Confirmação
    const cropBox = document.createElement('div');
    cropBox.className = 'crop-box';
    container.appendChild(cropBox);

    ['top', 'bottom', 'left', 'right'].forEach(pos => {
        const cropHandle = document.createElement('div');
        cropHandle.className = `crop-handle ${pos}`;
        cropBox.appendChild(cropHandle);
    });

    const cropConfirmBtn = document.createElement('button');
    cropConfirmBtn.className = 'crop-confirm-btn';
    cropConfirmBtn.innerHTML = '✔';
    cropConfirmBtn.title = 'Confirmar Corte';
    container.appendChild(cropConfirmBtn);

    let isDragging = false;
    let isResizing = false;
    let isCropping = false;
    let isAdjustingCrop = false;
    let currentCropHandle = null;
    let currentHandle = null;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0, startWidth = 0;
    let cropStartX = 0, cropStartY = 0;
    let initialCropBox = {};

    // Clicar na imagem ativa a seleção e abre a toolbar
    container.addEventListener('click', (e) => {
        e.stopPropagation();
        selectImage(container);
    });

    container.addEventListener('mousedown', (e) => {
        selectImage(container);

        if (e.target === cropConfirmBtn || cropConfirmBtn.contains(e.target)) return;

        e.stopPropagation();

        if (activeTool === 'resize' || e.target.classList.contains('resize-handle')) {
            if (e.target.classList.contains('resize-handle')) {
                isResizing = true;
                currentHandle = e.target;
            } else {
                isDragging = true;
            }

            startX = e.clientX;
            startY = e.clientY;
            startLeft = container.offsetLeft;
            startTop = container.offsetTop;
            startWidth = img.offsetWidth;
        } 
        else if (activeTool === 'crop') {
            startX = e.clientX;
            startY = e.clientY;

            if (e.target.classList.contains('crop-handle')) {
                isAdjustingCrop = true;
                currentCropHandle = e.target;
                initialCropBox = {
                    left: parseInt(cropBox.style.left) || 0,
                    top: parseInt(cropBox.style.top) || 0,
                    width: parseInt(cropBox.style.width) || 0,
                    height: parseInt(cropBox.style.height) || 0
                };
            } else {
                isCropping = true;
                cropConfirmBtn.classList.remove('active');

                const rect = container.getBoundingClientRect();
                cropStartX = e.clientX - rect.left;
                cropStartY = e.clientY - rect.top;

                cropBox.style.left = `${cropStartX}px`;
                cropBox.style.top = `${cropStartY}px`;
                cropBox.style.width = '0px';
                cropBox.style.height = '0px';
                cropBox.classList.add('active');
            }
        } 
        else if (activeTool === 'rotate') {
            isRotating = true;
            startX = e.clientX;
        }
        else {
            // Ferramenta padrao: mover
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = container.offsetLeft;
            startTop = container.offsetTop;
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging && !isResizing && !isCropping && !isAdjustingCrop && !isRotating) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (isDragging) {
            container.style.left = `${startLeft + dx}px`;
            container.style.top = `${startTop + dy}px`;
        }
        else if (isResizing && activeTool === 'resize') {
            let newWidth = startWidth;
            if (currentHandle.classList.contains('bottom-right') || currentHandle.classList.contains('top-right')) {
                newWidth = Math.max(50, startWidth + dx);
            } else {
                newWidth = Math.max(50, startWidth - dx);
                container.style.left = `${startLeft + (startWidth - newWidth)}px`;
            }

            if (currentHandle.classList.contains('top-left') || currentHandle.classList.contains('top-right')) {
                container.style.top = `${startTop + (img.offsetHeight - (img.naturalHeight * (newWidth / img.naturalHeight)))}px`;
            }

            img.style.width = `${newWidth}px`;
            img.style.height = 'auto';
        }
        else if (isCropping && activeTool === 'crop') {
            const rect = container.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;

            let width = currentX - cropStartX;
            let height = currentY - cropStartY;
            let left = cropStartX;
            let top = cropStartY;

            if (width < 0) { left = currentX; width = Math.abs(width); }
            if (height < 0) { top = currentY; height = Math.abs(height); }

            cropBox.style.left = `${left}px`;
            cropBox.style.top = `${top}px`;
            cropBox.style.width = `${width}px`;
            cropBox.style.height = `${height}px`;
        }
        else if (isAdjustingCrop && activeTool === 'crop') {
            let { left, top, width, height } = initialCropBox;

            if (currentCropHandle.classList.contains('right')) {
                cropBox.style.width = `${Math.max(20, width + dx)}px`;
            } else if (currentCropHandle.classList.contains('left')) {
                const newWidth = width - dx;
                if (newWidth > 20) {
                    cropBox.style.left = `${left + dx}px`;
                    cropBox.style.width = `${newWidth}px`;
                }
            } else if (currentCropHandle.classList.contains('bottom')) {
                cropBox.style.height = `${Math.max(20, height + dy)}px`;
            } else if (currentCropHandle.classList.contains('top')) {
                const newHeight = height - dy;
                if (newHeight > 20) {
                    cropBox.style.top = `${top + dy}px`;
                    cropBox.style.height = `${newHeight}px`;
                }
            }
        }
        else if (isRotating && activeTool === 'rotate') {
            const dx = e.clientX - startX;
            let currentRotation = parseFloat(container.dataset.rotation || '0');
            let newRotation = (currentRotation + dx * 0.5) % 360;
            if (newRotation < 0) newRotation += 360;
            
            container.dataset.rotation = newRotation;
            container.style.transform = `rotate(${newRotation}deg)`;
            
            // Restaura o tooltip de rotação visível com o ângulo exato
            rotTooltip.innerText = `${Math.round(newRotation)}°`;
            rotTooltip.classList.add('active');

            startX = e.clientX;
        }
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            const containerRect = container.getBoundingClientRect();
            const containerCenterX = containerRect.left + containerRect.width / 2;
            const containerCenterY = containerRect.top + containerRect.height / 2;

            const oldSheet = container.parentNode;
            const sheets = zoomWrapper.querySelectorAll('.a4-sheet');
            
            let droppedInsideSheet = false;

            sheets.forEach(sheet => {
                const sheetRect = sheet.getBoundingClientRect();
                
                if (
                    containerCenterX >= sheetRect.left &&
                    containerCenterX <= sheetRect.right &&
                    containerCenterY >= sheetRect.top &&
                    containerCenterY <= sheetRect.bottom
                ) {
                    droppedInsideSheet = true;
                    const currentLeft = container.offsetLeft;
                    const currentTop = container.offsetTop;
                    
                    if (oldSheet !== sheet) {
                        sheet.appendChild(container);
                        
                        container.style.left = `${Math.max(10, currentLeft)}px`;
                        container.style.top = `${Math.max(10, currentTop)}px`;

                        const remainingImages = oldSheet.querySelectorAll('.image-container-wrapper');
                        const totalSheets = zoomWrapper.querySelectorAll('.a4-sheet').length;

                        if (remainingImages.length === 0 && totalSheets > 1) {
                            oldSheet.remove();
                            hideImageToolbar();
                        }
                    }
                }
            });

            if (!droppedInsideSheet) {
                if (oldSheet && document.body.contains(oldSheet)) {
                    oldSheet.appendChild(container);
                } else {
                    const firstSheet = zoomWrapper.querySelector('.a4-sheet');
                    if (firstSheet) firstSheet.appendChild(container);
                }
                
                container.style.left = '20px';
                container.style.top = '20px';
            }
        }

        if (isCropping || isAdjustingCrop) {
            isCropping = false;
            isAdjustingCrop = false;
            currentCropHandle = null;

            const boxWidth = parseInt(cropBox.style.width) || 0;
            const boxHeight = parseInt(cropBox.style.height) || 0;
            
            if (boxWidth > 15 && boxHeight > 15) {
                const boxLeft = parseInt(cropBox.style.left) || 0;
                const boxTop = parseInt(cropBox.style.top) || 0;
                
                cropConfirmBtn.style.left = `${boxLeft + boxWidth + 8}px`;
                cropConfirmBtn.style.top = `${boxTop}px`;
                cropConfirmBtn.classList.add('active');
            }
        }

        if (rotTooltip) {
            rotTooltip.classList.remove('active');
        }

        isDragging = false;
        isResizing = false;
        isRotating = false;
        currentHandle = null;
    });

    // Efetivar o corte ao clicar no botão ✔
    cropConfirmBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();

        const cropX = parseInt(cropBox.style.left) || 0;
        const cropY = parseInt(cropBox.style.top) || 0;
        const cropW = parseInt(cropBox.style.width) || 0;
        const cropH = parseInt(cropBox.style.height) || 0;

        if (cropW <= 0 || cropH <= 0) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = cropW;
        canvas.height = cropH;

        const scaleX = img.naturalWidth / img.offsetWidth;
        const scaleY = img.naturalHeight / img.offsetHeight;

        ctx.drawImage(
            img,
            cropX * scaleX, cropY * scaleY, cropW * scaleX, cropH * scaleY,
            0, 0, cropW, cropH
        );

        img.src = canvas.toDataURL('image/png');
        img.style.width = `${cropW}px`;
        img.style.height = `${cropH}px`;

        cropBox.classList.remove('active');
        cropConfirmBtn.classList.remove('active');
        
        activeTool = null;
        toolBtns.forEach(b => b.classList.remove('active-tool'));
    });
}