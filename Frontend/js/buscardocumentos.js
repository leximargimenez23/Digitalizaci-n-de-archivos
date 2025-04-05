// Importamos la configuración de Supabase desde un archivo externo
import { supabase } from "./supabase.js";

// Función principal que se encarga de buscar documentos según filtros aplicados
export async function buscarDocumentos() {
  // Obtenemos el valor ingresado en el campo de búsqueda
  const palabraClave = document.getElementById("input-busqueda").value.trim().toLowerCase();

  // Obtenemos el tipo de documento seleccionado
  const tipoSeleccionado = document.getElementById("select-tipo").value;

  // Obtenemos el orden de fecha (ascendente o descendente)
  const orden = document.getElementById("orden-fecha").value;

  // Inicializamos una consulta a la tabla "documentos_meta"
  let query = supabase.from("documentos_meta").select("*");

  // Si se seleccionó un tipo de documento, agregamos el filtro
  if (tipoSeleccionado) {
    query = query.eq("tipo", tipoSeleccionado);
  }

  // Ordenamos los resultados por fecha de creación
  if (orden === "asc") {
    query = query.order("created_at", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // Ejecutamos la consulta
  const { data, error } = await query;

  // Si hay un error, lo mostramos por consola y detenemos la ejecución
  if (error) {
    console.error("Error al consultar Supabase:", error);
    return;
  }

  // Si se ingresó una palabra clave, filtramos los documentos localmente
  const resultados = palabraClave
    ? data.filter(doc =>
        (doc.palabras_clave || []).some(p =>
          p.toLowerCase().includes(palabraClave)
        )
      )
    : data;

  // Mostramos los resultados filtrados
  mostrarResultados(resultados);
}

// Función que se encarga de mostrar los resultados en el HTML
function mostrarResultados(documentos) {
  // Obtenemos la lista y el contador de resultados
  const lista = document.getElementById("lista-documentos");
  const cantidad = document.getElementById("cantidad-resultados");

  // Limpiamos el contenido anterior
  lista.innerHTML = "";
  cantidad.textContent = `Se encontraron ${documentos.length} documento(s).`;

  // Recorremos cada documento y lo insertamos en la lista
  documentos.forEach(doc => {
    const li = document.createElement("li");

    // Creamos el contenido del documento con resumen y botón para mostrarlo
    li.innerHTML = `
      <strong>${doc.nombre}</strong> - <em>${doc.tipo}</em><br>
      <a href="${doc.url}" target="_blank">Ver documento</a><br>

      <button class="btn-toggle-resumen">Ver resumen</button>
      <div class="resumen" style="display: none; margin-top: 5px;">
        <p><strong>Resumen:</strong> ${doc.resumen || "No disponible"}</p>
      </div>

      <small><strong>Palabras clave:</strong> ${doc.palabras_clave?.join(", ") || "Ninguna"}</small>
    `;

    // Agregamos funcionalidad al botón para mostrar/ocultar el resumen
    const btnResumen = li.querySelector(".btn-toggle-resumen");
    const resumenDiv = li.querySelector(".resumen");

    btnResumen.addEventListener("click", () => {
      const visible = resumenDiv.style.display === "block";
      resumenDiv.style.display = visible ? "none" : "block";
      btnResumen.textContent = visible ? "Ver resumen" : "Ocultar resumen";
    });

    // Agregamos el elemento a la lista
    lista.appendChild(li);
  });
}

// Función para limpiar los filtros y recargar todos los documentos
export function limpiarFiltros() {
  document.getElementById("input-busqueda").value = "";
  document.getElementById("select-tipo").value = "";
  document.getElementById("orden-fecha").value = "desc";
  buscarDocumentos();
}

// Al cargar la página, ejecutamos la búsqueda y asignamos eventos a los botones
window.addEventListener("DOMContentLoaded", () => {
  buscarDocumentos(); // Búsqueda inicial

  // Botón de búsqueda
  document.getElementById("btn-buscar").addEventListener("click", buscarDocumentos);

  // Botón de limpiar filtros
  document.getElementById("btn-limpiar").addEventListener("click", limpiarFiltros);
});
