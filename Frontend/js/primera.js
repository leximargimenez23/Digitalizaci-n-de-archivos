// Importar la configuración de Supabase
import { supabase } from "./supabase.js";

// Función para subir archivos a Supabase Storage
async function subirArchivo() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        document.getElementById("mensaje").innerText = "Selecciona un archivo.";
        return;
    }

    // Subir archivo a Supabase Storage
    const fileName = encodeURIComponent(file.name); // Convierte el nombre del archivo a un formato seguro para URL

    const { data, error } = await supabase.storage.from('documentos').upload(`uploads/${fileName}`, file);

    if (error) {
        document.getElementById("mensaje").innerText = "Error al subir archivo: " + error.message;
    } else {
        document.getElementById("mensaje").innerText = "Archivo subido con éxito: " + data.path;
        listarArchivos(); // Actualizar la lista de archivos subidos
    }
}

// Función para listar archivos subidos
async function listarArchivos() {
    const { data, error } = await supabase.storage.from('documentos').list('uploads');

    if (error) {
        console.error("Error al listar archivos:", error);
        return;
    }

    const lista = document.getElementById("listaArchivos");
    lista.innerHTML = "";

    data.forEach(file => {
        const li = document.createElement("li");
        // Crear enlace a la URL pública del archivo
        li.innerHTML = `<a href="https://bkdnidzlvszxokasrmol.supabase.co/storage/v1/object/public/documentos/uploads/${file.name}" target="_blank">${file.name}</a>`;
        lista.appendChild(li);
    });
}

// Mostrar el nombre del archivo seleccionado en el input
document.getElementById("fileInput").addEventListener("change", function() {
    let fileNameElement = document.getElementById("file-name");

    if (this.files.length > 0) {
        fileNameElement.textContent = this.files[0].name;
        fileNameElement.style.display = "inline"; // Mostrar cuando hay archivo
    } else {
        fileNameElement.style.display = "none"; // Ocultar si no hay archivo
    }
});

// Asignar el evento de clic al botón de subir
document.getElementById("btnSubir").addEventListener("click", subirArchivo);
