import { supabase } from "./supabase.js";
import { generarResumen, extraerPalabrasClave } from "./gemini.js";

// Función para extraer texto de un archivo
async function extraerTexto(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file); // Leer archivo como texto
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

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage.from("documentos").upload(filePath, file);

    if (error) {
        alert("Error al subir archivo: " + error.message);
        return;
    }

    // Generar la URL del archivo
    const fileUrl = `https://bkdnidzlvszxokasrmol.supabase.co/storage/v1/object/public/documentos/${filePath}`;

    // Extraer texto del archivo
    let contenidoTexto = await extraerTexto(file);

    // Generar resumen y palabras clave con IA
    const resumen = await generarResumen(contenidoTexto);
    const palabrasClave = await extraerPalabrasClave(contenidoTexto) || ["Sin palabras clave"];


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
