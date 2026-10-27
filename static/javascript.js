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

// ==================================================
//                 VARIÁVEIS GLOBAIS
// ==================================================

let currentZoom = 0.4;
let sheetX = 0; // Posição X atual da folha
let sheetY = 0; // Posição Y atual da folha
let activeTool = null;   // Estado da ferramenta ativa atual

// ======================================================
//                  CONTROLE DOS BOTÕES
// ======================================================

toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Se clicar no botão que já estava ativo, desativa ele
        if (btn.classList.contains('active-tool')) {
            btn.classList.remove('active-tool');
            activeTool = null;
            
            // Limpa caixas de corte ativas
            document.querySelectorAll('.crop-box').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.crop-confirm-btn').forEach(b => b.classList.remove('active'));
            return;
        }

        // Remove o destaque de todos os botões e destaca apenas o clicado
        toolBtns.forEach(b => b.classList.remove('active-tool'));
        btn.classList.add('active-tool');

        // Define a ferramenta ativa baseada no ID do botão
        if (btn.id === 'resizeBtn') {
            activeTool = 'resize';
            document.querySelectorAll('.crop-box').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.crop-confirm-btn').forEach(b => b.classList.remove('active'));
        } else if (btn.id === 'cropBtn') {
            activeTool = 'crop';
            // Seleção automática: Abre a caixa de corte cobrindo a imagem inteira
            document.querySelectorAll('.image-container-wrapper').forEach(container => {
                const img = container.querySelector('img');
                const cropBox = container.querySelector('.crop-box');
                const cropConfirmBtn = container.querySelector('.crop-confirm-btn');

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
            });
        } else if (btn.id === 'moveToolBtn') {
            activeTool = 'move';
            document.querySelectorAll('.crop-box').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.crop-confirm-btn').forEach(b => b.classList.remove('active'));
        } else {
            activeTool = null;
            document.querySelectorAll('.crop-box').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.crop-confirm-btn').forEach(b => b.classList.remove('active'));
        }
    });
});

// ======================================================
//               CONTROLES DE ZOOM NA TELA
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
//       GERENCIADOR INTERATIVO DA IMAGEM
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
    img.style.cursor = 'move';
    img.draggable = false; // Desativa o arraste nativo do navegador

    // Alças de redimensionamento da imagem
    const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    const handleElements = {};

    handles.forEach(pos => {
        let handle = document.createElement('div');
        handle.className = `resize-handle ${pos}`;
        container.appendChild(handle);
        handleElements[pos] = handle;
    });

    function toggleHandles(show) {
        handles.forEach(pos => {
            if (show) {
                handleElements[pos].classList.add('active');
            } else {
                handleElements[pos].classList.remove('active');
            }
        });
    }

    // Caixa de Corte, Alças laterais e Botão de Confirmação
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

    container.addEventListener('mousedown', (e) => {
        // CORRIGIDO: Agora aceita 'resize', 'crop' e 'move'
        if (activeTool !== 'resize' && activeTool !== 'crop' && activeTool !== 'move') return;
        if (e.target === cropConfirmBtn || cropConfirmBtn.contains(e.target)) return;

        e.stopPropagation();

        if (activeTool === 'resize') {
            container.classList.add('selected');
            toggleHandles(true);

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
        else if (activeTool === 'move') {
            isDragging = true;
            container.classList.add('selected');
            toggleHandles(false); // Oculta alças ao apenas mover

            startX = e.clientX;
            startY = e.clientY;
            startLeft = container.offsetLeft;
            startTop = container.offsetTop;
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
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging && !isResizing && !isCropping && !isAdjustingCrop) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (isDragging && (activeTool === 'resize' || activeTool === 'move')) {
            container.style.left = `${startLeft + dx}px`;
            container.style.top = `${startTop + dy}px`;
        }
        else if (isResizing && activeTool === 'resize') {
            if (currentHandle.classList.contains('bottom-right')) {
                img.style.width = `${Math.max(50, startWidth + dx)}px`;
            } else if (currentHandle.classList.contains('bottom-left')) {
                img.style.width = `${Math.max(50, startWidth - dx)}px`;
                container.style.left = `${startLeft + dx}px`;
            } else if (currentHandle.classList.contains('top-right')) {
                img.style.width = `${Math.max(50, startWidth + dx)}px`;
                container.style.top = `${startTop + dy}px`;
            } else if (currentHandle.classList.contains('top-left')) {
                img.style.width = `${Math.max(50, startWidth - dx)}px`;
                container.style.left = `${startLeft + dx}px`;
                container.style.top = `${startTop + dy}px`;
            }
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
    });

    window.addEventListener('mouseup', () => {
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

        isDragging = false;
        isResizing = false;
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