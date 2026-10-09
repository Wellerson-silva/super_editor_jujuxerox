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

let currentZoom = 1;
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
    zoomWrapper.style.transform = `scale(${currentZoom})`;
    
    // Atualiza o texto indicador
    zoomIndicator.innerText = `Zoom: ${Math.round(currentZoom * 100)}%`;
}, { passive: false });

console.log("Zoom ativado com sucesso!");

// ===========================================
//   LÓGICA DE ARRASTAR A FOLHA (PAN/DRAG)
// ===========================================


// Quando aperta o botão do mouse em cima da folha (ou do container)
canvasContainer.addEventListener('mousedown', (e) => {
    // Evita arrastar se clicar em elementos de texto internos da folha por engano
    isDragging = true;
    startX = e.clientX - sheetX;
    startY = e.clientY - sheetY;
    canvasContainer.style.cursor = 'grabbing';
});

// Quando move o mouse pela tela
window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    // Calcula a nova posição baseada no movimento do mouse
    sheetX = e.clientX - startX;
    sheetY = e.clientY - startY;

    // Aplica a movimentação na folha A4
    updateSheetPosition();
});

// Quando solta o botão do mouse
window.addEventListener('mouseup', () => {
    isDragging = false;
    canvasContainer.style.cursor = 'default';
});

// Função para atualizar a posição visual da folha
function updateSheetPosition() {
    if (a4Sheet) {
        a4Sheet.style.transform = `translate(${sheetX}px, ${sheetY}px)`;
    }
}

// ==========================================
//       LÓGICA DE UPLOAD DE ARQUIVO
// ==========================================
if (fileUploadInput) {
    fileUploadInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            // Altera o texto para o sinal de mais (+)
            uploadButtonLabel.innerText = '+';
            
            // Adiciona a classe que transforma o botão em um círculo perfeito
            uploadButtonLabel.classList.add('is-circular');
            
            const fileName = e.target.files[0].name;
            uploadButtonLabel.title = `Arquivo carregado: ${fileName}`;
            
            console.log("Arquivo carregado com sucesso:", fileName);
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
