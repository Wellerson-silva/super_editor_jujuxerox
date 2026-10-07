let currentZoom = 1; // 1 = 100%
const zoomWrapper = document.getElementById('zoomWrapper');
const zoomIndicator = document.getElementById('zoomIndicator');
const canvasContainer = document.getElementById('canvasContainer');

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