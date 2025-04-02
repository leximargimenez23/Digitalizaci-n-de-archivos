import { supabase } from "./supabase.js";
import { generarResumen, extraerPalabrasClave } from "./gemini.js";




async function extraerTexto(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            const fileType = file.type;
            console.log("Tipo de archivo detectado:", fileType);

            try {
                if (fileType === "text/plain") {
                    console.log("Leyendo archivo de texto...");
                    resolve(event.target.result);
                } else if (fileType === "application/pdf") {
                    console.log("Leyendo archivo PDF...");
                    
                    // Usar pdf.js para extraer texto
                    const pdfData = new Uint8Array(event.target.result);
                    const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
                    let texto = '';

                    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                        const page = await pdfDoc.getPage(pageNum);
                        const content = await page.getTextContent();
                        texto += content.items.map(item => item.str).join(' ') + '\n';
                    }
                    console.log("Texto extraído del PDF:", texto);
                    resolve(texto);
                } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                    console.log("Leyendo archivo Word...");
                    const { value } = await mammoth.extractRawText({ arrayBuffer: event.target.result });
                    console.log("Texto extraído del Word:", value);
                    resolve(value);
                } else {
                    reject("Formato de archivo no soportado.");
                }
            } catch (error) {
                reject("Error al leer el archivo: " + error.message);
            }
        };

        reader.onerror = (error) => reject(error);

        if (file.type === "application/pdf" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    });
}




// Función para subir el archivo
async function subirArchivo() {
    const fileInput = document.getElementById("fileInput");
    const fileNameInput = document.getElementById("file-name").value;
    const fileFormat = document.getElementById("file-format").value;

    const file = fileInput.files[0];

    if (!file) {
        alert("Selecciona un archivo para subir.");
        return;
    }

    if (!fileNameInput.trim()) {
        alert("Ingresa un nombre para el archivo.");
        return;
    }

    const filePath = `uploads/${file.name}`;
    console.log("Iniciando subida del archivo:", file.name); // 🔹 Verificar archivo seleccionado

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage.from("documentos").upload(filePath, file);

    if (error) {
        console.error("Error al subir archivo a Supabase:", error); // 🔹 Imprimir error en la consola
        alert("Error al subir archivo: " + error.message);
        return;
    }
    console.log("Archivo subido correctamente:", data);

    // Generar la URL del archivo
    const fileUrl = `https://bkdnidzlvszxokasrmol.supabase.co/storage/v1/object/public/documentos/${filePath}`;
    console.log("URL del archivo:", fileUrl); // 🔹 Verificar la URL

    // Extraer texto del archivo
    let contenidoTexto;
    try {
        contenidoTexto = await extraerTexto(file);
        console.log("Texto extraído del archivo:", contenidoTexto); // 🔹 Imprimir el texto extraído
    } catch (err) {
        console.error("Error al extraer texto:", err);
        alert("No se pudo extraer texto del archivo.");
        return;
    }

    // Generar resumen y palabras clave con IA
    const resumen = await generarResumen(contenidoTexto);
    const palabrasClave = await extraerPalabrasClave(contenidoTexto) || ["Sin palabras clave"];

    console.log("Resumen generado:", resumen); // 🔹 Verificar el resumen generado
    console.log("Palabras clave:", palabrasClave); // 🔹 Verificar palabras clave

    // Guardar en la base de datos
    const { error: dbError } = await supabase.from("documentos_meta").insert([
        {
            nombre: fileNameInput,
            tipo: fileFormat,
            url: fileUrl,
            resumen: resumen,
            palabras_clave: palabrasClave // Directamente como array de strings

        }
    ]);

    if (dbError) {
        console.error("Error al guardar en la base de datos:", dbError);
        alert("Error al guardar en la base de datos: " + dbError.message);
    } else {
        alert("Documento subido exitosamente!");
        document.getElementById("summary-text").innerText = resumen; // Mostrar resumen en la interfaz
    }
}

// Función para listar archivos subidos
async function listarArchivos() {
    const { data, error } = await supabase.storage.from("documentos").list("uploads");

    if (error) {
        console.error("Error al listar archivos:", error);
        return;
    }

    const lista = document.getElementById("listaArchivos");
    lista.innerHTML = "";

    data.forEach((file) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="https://bkdnidzlvszxokasrmol.supabase.co/storage/v1/object/public/documentos/uploads/${file.name}" target="_blank">${file.name}</a>`;
        lista.appendChild(li);
    });
}

document.getElementById("btnSubir").addEventListener("click", subirArchivo);
