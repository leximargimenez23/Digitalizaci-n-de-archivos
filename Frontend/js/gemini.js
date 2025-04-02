const API_KEY = "AIzaSyBNnTuusnSI0VRYjuKcqVTkd6p9rKZigsU"; // Reemplázala con tu clave de API

// Función para generar resumen con Gemini
async function generarResumen(texto) {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-001:generateContent?key=${API_KEY}`;

    const requestBody = {
        contents: [{ parts: [{ text: `Resume este texto en un máximo de 8 líneas:\n\n${texto}` }] }]
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar el resumen.";
}

async function extraerPalabrasClave(texto) {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-001:generateContent?key=${API_KEY}`;


    const requestBody = {
        contents: [{ parts: [{ text: `Extrae palabras clave de este texto, devuélvelas como una lista separada por comas:\n\n${texto}` }] }]
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text.split(",").map(word => word.trim());
    } else {
        return ["No se pudieron extraer palabras clave"];
    }
}


// Exportamos las funciones
export { generarResumen, extraerPalabrasClave };
