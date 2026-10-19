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

// ==================================================
// Variáveis para controlar o arraste da folha (Pan)
// ==================================================

let currentZoom = 0.4;
let isDragging = false;
let startX, startY;
let sheetX = 0; // Posição X atual da folha
let sheetY = 0; // Posição Y atual da folha

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
            const zoomWrapper = document.getElementById('zoomWrapper');
            
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

                        // Cria e insere a imagem na folha correspondente
                        const img = document.createElement('img');
                        img.src = event.target.result;
                        img.alt = file.name;
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'contain';
                        img.style.display = 'block';

                        targetSheet.appendChild(img);
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
const addPageBtn = document.getElementById('addPageBtn');
if (addPageBtn) {
    addPageBtn.addEventListener('click', () => {
        const zoomWrapper = document.getElementById('zoomWrapper');
        if (zoomWrapper) {
            const newSheet = document.createElement('div');
            newSheet.className = 'a4-sheet';
            
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
