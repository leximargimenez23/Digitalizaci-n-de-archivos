// Importación de librerías necesarias
import { supabase } from "./supabase.js"; // Para conectar con Supabase
import { generarResumen, extraerPalabrasClave } from "./gemini.js"; // Conexión con las funciones de Gemini para IA

// Configuración de las librerías PDF.js y Tesseract.js
const pdfjsLib = window['pdfjs-dist/build/pdf']; // Librería para trabajar con archivos PDF
pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js'; // Worker para PDF.js
Tesseract.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/2.1.1/worker.min.js'; // Worker para Tesseract.js (OCR)

// Función que convierte un archivo PDF a texto, incluyendo OCR en caso necesario
async function pdfToTextoYImagen(pdfData) {
    console.log("Procesando PDF...");

    // Cargar el documento PDF
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise; // Esperar que el PDF se cargue completamente
    let texto = '';  // Variable donde se almacenará el texto extraído

    // Iterar sobre cada página del PDF
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`Leyendo página ${pageNum} de ${pdf.numPages}...`);
        const page = await pdf.getPage(pageNum); // Obtener la página del PDF
        const textContent = await page.getTextContent(); // Extraer el contenido textual de la página
        let pageText = textContent.items.map(item => item.str).join(' ').trim();  // Unir las cadenas de texto de la página

        // Si no se extrae texto, proceder a OCR (reconocimiento de texto
        if (pageText.length < 10) {
            console.log("No se encontró texto en la página, aplicando OCR...");
            const scale = 2; // Aumento de la escala para mejorar la calidad de la imagen
            const viewport = page.getViewport({ scale }); // Configuración de la vista
            const canvas = document.createElement("canvas"); // Crear un canvas para renderizar la imagen
            const context = canvas.getContext("2d");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const renderTask = page.render({ canvasContext: context, viewport }); // Renderizar la página en el canvas
            await renderTask.promise; // Esperar que se termine de renderizar

            // Convertir el canvas a una imagen en base64 y pasarla a Tesseract para hacer OCR
            const imageDataUrl = canvas.toDataURL("image/png");
            const { data: { text: ocrText } } = await Tesseract.recognize(imageDataUrl, 'spa'); // Realizar el OCR con Tesseract
            texto += ocrText + '\n'; // Concatenar el texto obtenido por OCR
        } else {
            texto += pageText + '\n'; // Si ya había texto, agregarlo directamente
        }
    }
    return texto; // Devolver todo el texto extraído del PDF
}

// 🖼️ Extraer texto desde imagen con OCR
async function imagenAOCR(dataUrl) {
    const { data: { text } } = await Tesseract.recognize(dataUrl, 'spa');
    return text;
}

// 📃 Función para procesar archivos Word con Mammoth + OCR si tiene imágenes
async function extraerTextoDocx(arrayBuffer) {
    return new Promise((resolve) => {
        mammoth.convertToHtml({ arrayBuffer }).then(async (result) => {
            const container = document.createElement("div");
            container.innerHTML = result.value;
            let texto = container.innerText;

            const imgs = container.querySelectorAll("img");
            for (let img of imgs) {
                const ocrText = await imagenAOCR(img.src);
                texto += "\n" + ocrText;
            }

            resolve(texto);
        }).catch(() => resolve("")); // En caso de error, devolver texto vacío
    });
}

// Función principal para extraer el texto de diferentes tipos de archivos (PDF, imágenes, texto)
async function extraerTexto(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader(); // Crear un lector de archivos

        reader.onload = async (event) => {
            const fileType = file.type;// Obtener el tipo de archivo
            console.log("Tipo de archivo detectado:", fileType);

            try {
                // Si el archivo es de texto, devolver el contenido directamente
                if (fileType === "text/plain") {
                    resolve(event.target.result);
                } 
                // Si el archivo es un PDF, usar la función pdfToTextoYImagen para extraer el texto
                else if (fileType === "application/pdf") {
                    const pdfData = new Uint8Array(event.target.result);// Convertir el archivo a un ArrayBuffer
                    const texto = await pdfToTextoYImagen(pdfData);// Extraer texto del PDF
                    resolve(texto);
                }
                else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                    const texto = await extraerTextoDocx(event.target.result);
                    resolve(texto);

                    // Si el archivo es una imagen, usar Tesseract para extraer texto mediante OCR
                } else if (fileType.startsWith("image/")) {
                    const texto = await imagenAOCR(event.target.result); // Realizar OCR en la imagen
                    resolve(texto);
                } 
                 // Si el archivo no es soportado, rechazar la promesa
                else {
                    reject("Formato de archivo no soportado.");
                }
            } catch (error) {
                reject("Error al leer el archivo: " + error.message);// Manejar errores de lectura
            }
        };
        // Manejo de error en la lectura del archivo
        reader.onerror = (error) => reject(error);
        // Leer el archivo dependiendo de su tipo
        if (file.type.startsWith("image/")) {
            reader.readAsDataURL(file);// Leer imágenes como DataURL
        } else if (file.type === "application/pdf" || file.name.endsWith(".docx")) {
            reader.readAsArrayBuffer(file);// Leer archivos PDF como ArrayBuffer
        } else {
            reader.readAsText(file);// Leer archivos de texto directamente
        }
    });
}

// Función para normalizar el nombre del archivo
function normalizarNombreArchivo(nombre) {
    return nombre.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_').toLowerCase();
}


// 📤 Subir archivo, generar resumen, guardar en Supabase
async function subirArchivo() {
    const fileInput = document.getElementById("fileInput");// Obtener el input de archivo
    const fileNameInput = document.getElementById("file-name").value;// Obtener el nombre del archivo
    const fileFormat = document.getElementById("file-format").value;// Obtener el formato del archivo
    const file = fileInput.files[0];// Obtener el archivo seleccionado
    const btnSubir = document.getElementById("btnSubir");// Obtener el botón de subida

    // Validar que se haya seleccionado un archivo
    if (!file) {
        alert("Selecciona un archivo para subir.");
        return;
    }
     // Validar que se haya ingresado un nombre para el archivo
    if (!fileNameInput.trim()) {
        alert("Ingresa un nombre para el archivo.");
        return;
    }

    // Deshabilitar el botón mientras se realiza la subida
    btnSubir.disabled = true;


        // Normalizar el nombre del archivo
        const nombreArchivoNormalizado = normalizarNombreArchivo(fileNameInput);

        const filePath = `uploads/${nombreArchivoNormalizado}`; // Usamos el nombre normalizado para la ruta
        console.log("Iniciando subida del archivo:", file.name);
    
    // Subir el archivo a Supabase
    const { data, error } = await supabase.storage.from("documentos").upload(filePath, file);
    if (error) {
        console.error("Error al subir archivo a Supabase:", error);
        alert("Error al subir archivo: " + error.message);
        btnSubir.disabled = false;
        return;
    }

    console.log("Archivo subido correctamente:", data);
    const fileUrl = `https://bkdnidzlvszxokasrmol.supabase.co/storage/v1/object/public/documentos/${filePath}`;
    console.log("URL del archivo:", fileUrl);

    // Extraer el texto del archivo subido
    let contenidoTexto;
    try {
        contenidoTexto = await extraerTexto(file);// Extraer el texto del archivo
        console.log("Texto extraído:", contenidoTexto);
    } catch (err) {
        console.error("Error al extraer texto:", err);
        alert("No se pudo extraer texto del archivo.");
        btnSubir.disabled = false;
        return;
    }

    // Generar resumen y extraer palabras clave utilizando Gemini
    const resumen = await generarResumen(contenidoTexto);// Generar resumen
    const palabrasClave = await extraerPalabrasClave(contenidoTexto) || ["Sin palabras clave"]; // Extraer palabras clave
    console.log("Resumen generado:", resumen);
    console.log("Palabras clave:", palabrasClave);

    // 👉 Obtener el ID del usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("No se pudo obtener el usuario.");
        btnSubir.disabled = false;
        return;
    }

    // 👇 Guardar en la base de datos con el ID del usuario
    const { error: dbError } = await supabase.from("documentos_meta").insert([{
        nombre: fileNameInput,
        tipo: document.getElementById("file-format").value,
        url: fileUrl,
        resumen: resumen,
        palabras_clave: palabrasClave,
        user_id: user.id  // 👈 clave aquí
    }]);

    if (dbError) {
        console.error("Error al guardar en la base de datos:", dbError);
        alert("Error al guardar en la base de datos: " + dbError.message);
    } else {
        alert("Documento subido exitosamente!");
        document.getElementById("summary-text").innerText = resumen;
    }

    btnSubir.disabled = false;
}

// Función para listar los archivos almacenados en Supabase
async function listarArchivos() {
    const lista = document.getElementById("listaArchivos");
    lista.innerHTML = "";

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        console.error("No se pudo obtener el usuario actual:", userError?.message);
        return;
    }

    // 🔒 Obtener solo documentos del usuario actual
    const { data, error } = await supabase
        .from("documentos_meta")
        .select("*")
        .eq("user_id", user.id);

    if (error) {
        console.error("Error al listar archivos:", error);
        return;
    }

    data.forEach((doc) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="${doc.url}" target="_blank">${doc.nombre}</a> - <em>${doc.tipo}</em>`;
        lista.appendChild(li);
    });
}

// Listar archivos al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    listarArchivos();
});

// Event listener para el botón de subida de archivo
document.getElementById("btnSubir").addEventListener("click", subirArchivo);

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const previewImage = document.getElementById('preview-image');
    const previewFrame = document.getElementById('preview-frame');
    const previewDocx = document.getElementById('preview-docx');
    const fileFormat = document.getElementById('file-format');

    // Escuchar el cambio en el input de archivo
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        const fileURL = URL.createObjectURL(file);
        const extension = file.name.split('.').pop().toLowerCase();

        if (!file) return;

        // Ocultar todos los previsualizadores al principio
        previewImage.style.display = 'none';
        previewFrame.style.display = 'none';
        previewDocx.style.display = 'none';

        // Mostrar vista previa según el tipo de archivo
        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
            previewImage.src = fileURL;
            previewImage.style.display = 'block';
        } else if (extension === 'pdf') {
            previewFrame.src = fileURL;
            previewFrame.style.display = 'block';
        } else if (extension === 'docx') {
            const reader = new FileReader();
            reader.onload = function(event) {
                mammoth.convertToHtml({ arrayBuffer: event.target.result })
                    .then(function(result) {
                        previewDocx.style.display = 'block';
                        previewDocx.innerHTML = result.value;
                    })
                    .catch(function(err) {
                        console.error("Error mostrando .docx", err);
                    });
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert("Formato no compatible para vista previa.");
        }
    });

    // Evitar que cambiar el tipo de documento (select) afecte la vista previa
    fileFormat.addEventListener('change', function() {
        const selectedValue = fileFormat.value;
        console.log("Clasificación seleccionada:", selectedValue);
        // Aquí puedes procesar la clasificación si lo deseas
        // La vista previa no debe cambiar al seleccionar el tipo
    });
});


