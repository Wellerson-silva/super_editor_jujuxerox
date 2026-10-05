import os
from flask import Flask, render_template, request, redirect, url_for
from PIL import Image, ImageOps

app = Flask(__name__)

# Pasta onde vamos salvar as imagens enviadas e editadas
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # Verifica se o arquivo foi enviado
        if 'file' not in request.files:
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            return redirect(request.url)
        
        if file:
            # Salva a imagem original
            input_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(input_path)
            
            # Pega a ação escolhida pelo usuário
            acao = request.form.get('acao')
            
            # Abre e edita a imagem com Pillow
            img = Image.open(input_path)
            if acao == 'pb':
                img = ImageOps.grayscale(img)
            elif acao == 'espelhar':
                img = ImageOps.mirror(img)
                
            # Salva a imagem editada
            output_filename = 'editado_' + file.filename
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            img.save(output_path)
            
            return render_template('index.html', original=file.filename, editado=output_filename)
            
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)