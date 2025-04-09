document.addEventListener("DOMContentLoaded", () => {
    const buscarInput = document.getElementById("buscar");
    const filtroTipo = document.getElementById("filtro-tipo");
    const tablaDocumentos = document.getElementById("tabla-documentos");

    // Cargar el menú dinámicamente
    const menuContainer = document.getElementById("menuContainer");

    fetch("menu.html")
        .then(response => response.text())
        .then(data => {
            menuContainer.innerHTML = data;
            inicializarMenu();
        })
        .catch(error => console.error("Error cargando el menú:", error));

    // Función para mostrar los documentos en la tabla
    function mostrarDocumentos() {
        tablaDocumentos.innerHTML = "";
        const filtro = buscarInput.value.toLowerCase();
        const tipoSeleccionado = filtroTipo.value;

        documentos
            .filter(doc => 
                (doc.nombre.toLowerCase().includes(filtro) || doc.palabrasClave.toLowerCase().includes(filtro)) &&
                (tipoSeleccionado === "todos" || doc.tipo === tipoSeleccionado)
            )
            .forEach(doc => {
                const fila = `<tr>
                    <td>${doc.nombre}</td>
                    <td>${doc.tipo}</td>
                    <td>${doc.fecha}</td>
                    <td>${doc.resumen}</td>
                    <td>${doc.palabrasClave}</td>
                    <td><a href="${doc.archivo}" target="_blank">📄 Ver</a></td>
                </tr>`;
                tablaDocumentos.innerHTML += fila;
            });
    }

    buscarInput.addEventListener("input", mostrarDocumentos);
    filtroTipo.addEventListener("change", mostrarDocumentos);

    mostrarDocumentos();

    function inicializarMenu() {
        const btnMenu = document.getElementById("btnMenu");
        const menuLateral = document.getElementById("menuLateral");

        if (btnMenu && menuLateral) {
            btnMenu.addEventListener("click", () => {
                menuLateral.classList.toggle("active");
            });

            document.addEventListener("click", (event) => {
                if (!menuLateral.contains(event.target) && !btnMenu.contains(event.target)) {
                    menuLateral.classList.remove("active");
                }
            });
        } else {
            console.error("El menú no se ha cargado correctamente.");
        }
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const fileNameInput = document.getElementById("file-name");
    const fileFormatSelect = document.getElementById("file-format");
    const previewImage = document.getElementById("preview-image");
    
    // Evento para cambiar la imagen de vista previa (Ejemplo: cuando cambia el formato de guardado)
    fileFormatSelect.addEventListener("change", function() {
        if (fileFormatSelect.value === "PDF") {
            previewImage.src = "pdf-icon.png";
        } else if (fileFormatSelect.value === "DOCX") {
            previewImage.src = "word-icon.png";
        } else {
            previewImage.src = "text-icon.png";
        }
    });
});
