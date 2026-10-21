// ==================================================
//                  CONSTANTES
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

// ==================================================
//                 VARIÁVEIS GLOBAIS
// ==================================================

let currentZoom = 0.4;
let isDragging = false;
let startX, startY;
let sheetX = 0; // Posição X atual da folha
let sheetY = 0; // Posição Y atual da folha
let activeTool = null;   // Estado da ferramenta ativa atual


// Seleciona todos os botões da barra lateral esquerda
// Captura direta do botão de redimensionar pelo ID

// Todos os botões com a classe .tool-btn
const toolBtns = document.querySelectorAll('.tool-btn');

toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Se clicar no botão que já estava ativo, desativa ele
        if (btn.classList.contains('active-tool')) {
            btn.classList.remove('active-tool');
            activeTool = null;
            return;
        }

        // Remove o destaque de todos os botões e destaca apenas o clicado
        toolBtns.forEach(b => b.classList.remove('active-tool'));
        btn.classList.add('active-tool');

        // Define a ferramenta ativa baseada no ID do botão
        if (btn.id === 'resizeBtn') {
            activeTool = 'resize';
        } else {
            activeTool = null;
        }
    });
});

// ======================================================
//                  CONTROLE DOS BOTÕES
// ======================================================



// ======================================================
//              CONTROLES DE ZOOM NA TELA
// ======================================================


// Controla o zoom com a roda do rato
canvasContainer.addEventListener('wheel', function(e) {
    // Verifica se o utilizador está a usar o zoom (Ctrl + Scroll ou apenas scroll dependendo da preferência)
    // Aqui vamos permitir o zoom direto com o scroll do rato para ficar bem fluido:
    e.preventDefault();

    const zoomStep = 0.1;
    if (e.deltaY < 0) {
        // Zoom In (Aproximar)
        currentZoom += zoomStep;
        if (currentZoom > 3.0) currentZoom = 3.0; // Limite máximo de 300%
    } else {
        // Zoom Out (Afastar)
        currentZoom -= zoomStep;
        if (currentZoom < 0.4) currentZoom = 0.4; // Limite mínimo de 40%
    }

    // Aplica a transformação de escala
    zoomWrapper.style.zoom = currentZoom;
    
    // Atualiza o texto indicador
    zoomIndicator.innerText = `Zoom: ${Math.round(currentZoom * 100)}%`;
}, { passive: false });

console.log("Zoom ativado com sucesso!");


// ==========================================
//          LÓGICA DE UPLOAD DE ARQUIVO
// ==========================================
if (fileUploadInput) {
    // Permitir selecionar múltiplos arquivos de uma vez
    fileUploadInput.setAttribute('multiple', 'true');

    fileUploadInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            
            // Verifica se a primeira página ainda está vazia (com o texto padrão)
            let firstSheet = zoomWrapper.querySelector('.a4-sheet');
            let isFirstSheetEmpty = firstSheet && firstSheet.querySelector('.sheet-label');

            Array.from(files).forEach((file, index) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();

                    reader.onload = function(event) {
                        let targetSheet;

                        // Se for o primeiro arquivo e a primeira folha estiver vazia, usa ela. Senão, cria uma nova folha!
                        if (index === 0 && isFirstSheetEmpty) {
                            targetSheet = firstSheet;
                            targetSheet.innerHTML = ''; // Limpa o rótulo
                        } else {
                            targetSheet = document.createElement('div');
                            targetSheet.className = 'a4-sheet';
                            zoomWrapper.appendChild(targetSheet);
                        }
                        // Botão de excluir página
                        addDeleteButtonToSheet(targetSheet);

                        // Cria e insere a imagem na folha correspondente
                        const img = document.createElement('img');
                        img.src = event.target.result;
                        img.alt = file.name;
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'contain';
                        img.style.display = 'block';

                        targetSheet.appendChild(img);

                        // Ativa a interatividade de mover e redimensionar livremente
                        makeImageInteractive(img);
                    };

                    reader.readAsDataURL(file);
                }
            });

            console.log(`${files.length} arquivo(s) processado(s) com sucesso.`);
        }
    });
}

// ==========================================
//      LÓGICA DO BOTÃO ADICIONAR PÁGINA
// ==========================================

if (addPageBtn) {
    addPageBtn.addEventListener('click', () => {
        const zoomWrapper = document.getElementById('zoomWrapper');
        if (zoomWrapper) {
            const newSheet = document.createElement('div');
            newSheet.className = 'a4-sheet';

            // botão de excluir página
            addDeleteButtonToSheet(newSheet);
            
            const label = document.createElement('span');
            label.className = 'sheet-label';
            label.innerText = `Jujuxerox | A4 (${zoomWrapper.children.length + 1})`;
            newSheet.appendChild(label);

            zoomWrapper.appendChild(newSheet);
            
            // Rola a tela suavemente para a nova página
            newSheet.scrollIntoView({ behavior: 'smooth' });
        }
        
    });

    
}

// ==========================================
//       LÓGICA DE DOWNLOAD / EXPORTAÇÃO
// ==========================================
if (downloadButton) {
    downloadButton.addEventListener('click', () => {
        console.log("Botão de download acionado!");
        // Aqui colocaremos futuramente a lógica para gerar a imagem ou PDF da folha A4
        alert("Funcionalidade de download em desenvolvimento!");
    });
}

// ==========================================
//     LÓGICA DO BOTÃO DE EXCLUIR PÁGINA
// ==========================================

// Função para adicionar o botão de excluir a qualquer folha A4
function addDeleteButtonToSheet(sheet) {
    // Evita criar múltiplos botões de excluir na mesma folha
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
        e.stopPropagation(); // Evita interferir em outros cliques na folha
        const totalSheets = zoomWrapper.querySelectorAll('.a4-sheet').length;
        
        if (totalSheets > 1) {
            sheet.remove();
        } else {
            alert("Você não pode excluir a única página restante!");
        }
    });

    sheet.appendChild(deleteBtn);
}

// ===========================================
//  LÓGICA DO BOTÃO DE EXCLUIR PÁGINA INICIAL 
// ===========================================

// Adiciona o botão de excluir na folha inicial já existente na tela
const initialSheet = document.querySelector('.a4-sheet');
if (initialSheet) {
    addDeleteButtonToSheet(initialSheet);
}

// ===========================================
//      LÓGICA DO BOTÃO REDIMENSIONAR
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

    let isDragging = false;
    let isResizing = false;
    let currentHandle = null;
    let startX, startY, startLeft, startTop, startWidth;

    container.addEventListener('mousedown', (e) => {
        // Só permite mexer se a ferramenta de redimensionar estiver ativa
        if (activeTool !== 'resize') return;

        e.stopPropagation();
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
    });

    document.addEventListener('mousedown', (e) => {
        if (!container.contains(e.target)) {
            container.classList.remove('selected');
            toggleHandles(false);
        }
    });

    // Movimento global na janela
    window.addEventListener('mousemove', (e) => {
        if (!isDragging && !isResizing) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (isDragging) {
            container.style.left = `${startLeft + dx}px`;
            container.style.top = `${startTop + dy}px`;
        } else if (isResizing) {
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
    });

    // Garante que soltar o mouse em qualquer lugar do navegador encerra o movimento
    window.addEventListener('mouseup', () => {
        isDragging = false;
        isResizing = false;
        currentHandle = null;
    });
}