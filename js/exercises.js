// =========================================
// EXERCISES.JS - LÓGICA Y DATOS
// =========================================

// Cargar datos del ejercicio desde archivo JSON
function cargarEjercicio() {
    return fetch("data/gramatica.json")
        .then(r => r.json())
        .then(datos => {
            estadoApp.todasLasOraciones = datos;
            estadoApp.ejercicioActual = datos[0];
            // OJO: aquí ya NO llamamos a renderizar()
        });
}

// Iniciar práctica con cantidad seleccionada
function iniciarPractica(cantidad) {
    estadoApp.cantidadOraciones = cantidad;
    estadoApp.indiceOracionActual = 0;
    estadoApp.oracionesCompletadas = 0;
    estadoApp.oracionesCorrectas = 0;

    // Seleccionar oraciones aleatorias
    const oracionesMezcladas = [...estadoApp.todasLasOraciones]
        .sort(() => Math.random() - 0.5);
    estadoApp.oracionesSeleccionadas = oracionesMezcladas.slice(0, cantidad);

    // Cargar primera oración
    cargarSiguienteOracion();
}

// NUEVA FUNCIÓN: Cargar siguiente oración
function cargarSiguienteOracion() {
    if (estadoApp.indiceOracionActual >= estadoApp.oracionesSeleccionadas.length) {
        mostrarResumenFinal();
        return;
    }

    estadoApp.ejercicioActual = estadoApp.oracionesSeleccionadas[estadoApp.indiceOracionActual];
    estadoApp.respuestaUsuario = [];
    estadoApp.palabrasPractica = [];
    estadoApp.resultado = null;
    estadoApp.intentos = 0;

    renderizar();
}

// Iniciar explicación por tipo
function iniciarExplicacionPorTipo(tipoId) {
    estadoApp.tipoExplicacionSeleccionado = tipoId;
    estadoApp.indiceExplicacion = 0;
    renderizar();
}

// Iniciar contenido según lección (explicación + práctica)
function iniciarContenido(leccionId) {
    estadoApp.categoriaActual = leccionId;
    estadoApp.indiceExplicacion = 0;

    // Si aún no se han cargado las oraciones, las cargamos primero
    if (estadoApp.todasLasOraciones.length === 0) {
        cargarEjercicio().then(() => {
            mostrarContenidoPorLeccion(leccionId);
        });
    } else {
        mostrarContenidoPorLeccion(leccionId);
    }
}

// Filtrar por lección usando el nuevo campo "leccion"
function mostrarContenidoPorLeccion(leccionId) {
    let oraciones;

    if (leccionId === 'all_mixed') {
        oraciones = estadoApp.todasLasOraciones;
    } else {
        oraciones = estadoApp.todasLasOraciones.filter(o => o.leccion === leccionId);
    }

    estadoApp.oracionesCategoriaActual = oraciones;
    renderizarContenidoLeccion();
}

// Inicia la práctica usando solo las oraciones de la lección actual,
// con máximo 5 y procurando variedad de subtipos.
function iniciarPracticaLeccion() {
    const oraciones = estadoApp.oracionesCategoriaActual; 
    
    if (!oraciones || oraciones.length === 0) return;

    // 1) Agrupar por subtipo para asegurar variedad
    const gruposPorSubtipo = {};
    oraciones.forEach(ej => {
        const clave = `${ej.tipo}__${ej.subtipo}`;
        if (!gruposPorSubtipo[clave]) {
            gruposPorSubtipo[clave] = [];
        }
        gruposPorSubtipo[clave].push(ej);
    });

    // 2) De cada subtipo cogemos 1 ejemplo aleatorio
    let candidatos = [];
    Object.values(gruposPorSubtipo).forEach(lista => {
        const copia = [...lista];
        copia.sort(() => Math.random() - 0.5);
        candidatos.push(copia[0]);
    });

    // 3) Si hay más de 5 subtipos, nos quedamos con 5
    if (candidatos.length > 5) {
        candidatos.sort(() => Math.random() - 0.5);
        candidatos = candidatos.slice(0, 5);
    }

    // 4) Si todavía son menos de 5 y hay oraciones de sobra,
    // rellenamos al azar hasta llegar a 5 sin duplicar
    if (candidatos.length < 5 && oraciones.length > candidatos.length) {
        const restantes = oraciones.filter(ej => !candidatos.includes(ej));
        const mezclados = [...restantes].sort(() => Math.random() - 0.5);
        while (candidatos.length < 5 && mezclados.length > 0) {
            candidatos.push(mezclados.shift());
        }
    }

    // 5) Mezclamos el orden final para la práctica
    const seleccionFinal = [...candidatos].sort(() => Math.random() - 0.5);

    estadoApp.modo = "practica";
    estadoApp.cantidadOraciones = seleccionFinal.length;
    estadoApp.indiceOracionActual = 0;
    estadoApp.oracionesCompletadas = 0;
    estadoApp.oracionesCorrectas = 0;

    estadoApp.oracionesSeleccionadas = seleccionFinal;
    estadoApp.ejercicioActual = seleccionFinal[0];
    estadoApp.respuestaUsuario = [];
    estadoApp.palabrasPractica = [];
    estadoApp.resultado = null;
    estadoApp.intentos = 0;

    renderizar();
}

// Función para lanzar el ejercicio de práctica seleccionado
function seleccionarModoPractica(tipo) {
    estadoApp.tipoPractica = tipo;  // "ordenar" o "hueco"
    iniciarPracticaLeccion();
}

function mostrarContenidoPorCategoria(categoria) {
    // Filtrar oraciones por categoría
    let oracionesCategoria;
    switch (categoria) {
        case 'verbo_to_be':
            oracionesCategoria = estadoApp.todasLasOraciones.filter(o =>
                o.subtipo === 'verbo_to_be'
            );
            break;
        case 'pregunta_simple':
            oracionesCategoria = estadoApp.todasLasOraciones.filter(o =>
                o.tipo === 'pregunta_simple'
            );
            break;
        // ... más casos
        default:
            oracionesCategoria = estadoApp.todasLasOraciones;
    }

    estadoApp.oracionesCategoriaActual = oracionesCategoria;
    renderizarContenido();
}

// Validar respuesta al ejercicio y mostrar resultado
function validarRespuesta() {
    const e = estadoApp.ejercicioActual;
    const correcta = e.partes.map(p => p.palabra).join(" ");
    const usuario = estadoApp.respuestaUsuario.join(" ");

    if (usuario === correcta) {
        estadoApp.resultado = "correcto";
        return;
    }

    // ❌ Respuesta incorrecta
    estadoApp.intentos++;
    if (estadoApp.intentos >= estadoApp.maxIntentos) {
        estadoApp.resultado = "finalizado";
    } else {
        estadoApp.resultado = "incorrecto";
    }
}

// Reiniciar ejercicio tras error
function reintentarEjercicio() {
    estadoApp.respuestaUsuario = [];
    estadoApp.resultado = null;
    estadoApp.palabrasPractica = [];
    renderizar();
}

// Función para obtener nombre legible del tipo de oración
function obtenerNombreTipo(tipo, subtipo) {
    const emojis = {
        "pregunta_simple": "❓",
        "afirmacion_simple": "✅",
        "negacion_simple": "❌",
        "pregunta_yes_no": "🤔",
        "imperativo": "👉"
    };

    const nombres = {
        "pregunta_simple": "Pregunta",
        "afirmacion_simple": "Afirmación",
        "negacion_simple": "Negación",
        "pregunta_yes_no": "Pregunta Sí/No",
        "imperativo": "Orden"
    };

    const subtipos = {
        "what": "¿Qué?",
        "where": "¿Dónde?",
        "who": "¿Quién?",
        "how": "¿Cómo?",
        "verbo_to_be": "ser/estar",
        "presente_simple": "presente",
        "ordenes_simples": "órdenes"
    };

    const emoji = emojis[tipo] || "📝";
    const nombre = nombres[tipo] || tipo;
    const sub = subtipos[subtipo] ? ` (${subtipos[subtipo]})` : "";

    return `${emoji} ${nombre}${sub}`;
}

// Función para generar explicaciones gramaticales simples para niños
// Función para generar explicaciones gramaticales simples para niños
function obtenerExplicacionGramatical(ejercicio) {
    const explicaciones = {
        "pregunta_simple": {
            "what": `
                <p class="explicacion-titulo-linea">
                    <span class="explicacion-icono">❓</span>
                    <strong>¿Cuándo usamos "What"?</strong>
                </p>
                <p>Usamos <strong>"What"</strong> (¿qué?) cuando queremos saber información sobre algo.</p>
                <p class="ejemplo">👉 Ejemplo: What is this? = ¿Qué es esto?</p>
                <p> 👇 Otro ejemplo:</p>
            `,
            "where": `
                <p class="explicacion-titulo-linea">
                    <span class="explicacion-icono">📍</span>
                    <strong>¿Cuándo usamos "Where"?</strong>
                </p>
                <p>Usamos <strong>"Where"</strong> (¿dónde?) cuando queremos saber el lugar de algo.</p>
                <p class="ejemplo">👉 Ejemplo: Where is the book? = ¿Dónde está el libro?</p>
                <p> 👇 Otro ejemplo:</p>
            `,
            "who": `
                <p class="explicacion-titulo-linea">
                    <span class="explicacion-icono">👤</span>
                    <strong>¿Cuándo usamos "Who"?</strong>
                </p>
                <p>Usamos <strong>"Who"</strong> (¿quién?) cuando preguntamos por una persona.</p>
                <p class="ejemplo">👉 Ejemplo: Who is she? = ¿Quién es ella?</p>
                <p> 👇 Otro ejemplo:</p>
            `,
            "how": `
                <p class="explicacion-titulo-linea">
                    <span class="explicacion-icono">🤷</span>
                    <strong>¿Cuándo usamos "How"?</strong>
                </p>
                <p>Usamos <strong>"How"</strong> (¿cómo?) cuando queremos saber cómo está algo o alguien.</p>
                <p class="ejemplo">👉 Ejemplo: How are you? = ¿Cómo estás?</p>
                <p> 👇 Otro ejemplo:</p>
            `,
            "when": `
                <p class="explicacion-titulo-linea">
                <span class="explicacion-icono">🕒</span>
                <strong>¿Cuándo usamos "When"?</strong>
                </p>
                <p>Usamos <strong>"When"</strong> (¿cuándo?) cuando preguntamos por un momento o una fecha.</p>
                <p class="ejemplo">👉 Ejemplo: When is your birthday? = ¿Cuándo es tu cumpleaños?</p>
                <p> 👇 Otro ejemplo:</p>
            `
        },
        "afirmacion_simple": {
            "verbo_to_be": `
                <p class="explicacion-titulo-linea">
                    <span class="explicacion-icono">✅</span>
                    <strong>El verbo "to be" (ser/estar)</strong> <strong>am / is / are</strong>
                </p>
                <p>Este verbo cambia según quién hable:</p>
                <ul>
                    <li>🙋 I <strong>am</strong>... (Yo <strong>soy/estoy</strong>)</li>
                    <li>👤 He/She/It <strong>is</strong>... (Él/Ella/Eso <strong>es/está</strong>)</li>
                    <li>👥 We/They/You <strong>are</strong>... (Nosotros/Ellos <strong>son/están</strong>)</li>
                </ul>
                <p> 👇 Ejemplo:</p>
            `,
            "presente_simple": `
                <p class="explicacion-titulo-linea">
                    <span class="explicacion-icono">🔄</span>
                    <strong>El presente simple</strong>
                </p>
                <p>Lo usamos para hablar de cosas que hacemos habitualmente.</p>
                <p class="ejemplo">👉 Ejemplo: I <strong>like</strong> apples = Me gustan las manzanas.</p>
                <p class="ejemplo">👉 Ejemplo: She <strong>likes</strong> apples = A ella le gustan las manzanas.</p>
                <p></p>
                <p><strong>¡Ojo!</strong> Con <strong>He/She/It</strong> añadimos <strong>-s</strong> al final del verbo.</p>
                <p> 👇 Ejemplo:</p>
            `
        },
        "negacion_simple": {
            "verbo_to_be": `
                <p class="explicacion-titulo-linea">
                    <span class="explicacion-icono">❌</span>
                    <strong>Cómo decir que NO con "to be" (ser/estar)</strong>  <strong>am / is / are</strong>
                </p>
                <p>Añadimos <strong>not</strong> después del verbo:</p>
                <ul>
                    <li>I <strong>am not</strong>... (No soy/estoy)</li>
                    <li>She <strong>is not</strong>... (Ella no es/está)</li>
                    <li>They <strong>are not</strong>... (Ellos no son/están)</li>
                </ul>
                <p> 👇 Ejemplo:</p>
            `,
            "presente_simple": `
                <p class="explicacion-titulo-linea">
                    <span class="explicacion-icono">🚫</span>
                    <strong>Cómo decir que NO en presente</strong>
                </p>
                <p>Usamos las palabras mágicas <strong>do not</strong> ("don't") o <strong>does not</strong> ("doesn't"):</p>
                <ul>
                    <li>I do not like / I don't like = No me gusta</li>
                    <li>He does not play / He doesn't like = Él no juega</li>
                </ul>
                <p>Como ves, <strong>"do not"</strong> y <strong>"don't"</strong> son lo mismo. <strong>"Do"</strong> se une con <strong>"not"</strong> para crear la contracción <strong>"don't"</strong>. Sucede igual con <strong>"does not"</strong> y <strong>"doesn't"</strong>.</p>
                <p> 👇 Otro ejemplo:</p>
            `
        },
        "pregunta_yes_no": {
            "verbo_to_be": `
                <p class="explicacion-titulo-linea">
                    <span class="explicacion-icono">🤔</span>
                    <strong>Preguntas con respuesta Sí/No (verbo "to be")</strong> <strong>am / is / are</strong>
                </p>
                <p>Con el verbo "to be" (ser/estar), ponemos el verbo <strong>antes</strong> del sujeto:</p>
                <p class="ejemplo">👉 You <strong>are</strong>... → <strong>Are</strong> you...?</p>
                <p class="ejemplo">👉 She <strong>is</strong>... → <strong>Is</strong> she...?</p>
                <p></p>
                <p> 👇 Otro ejemplo:</p>
            `,
            "presente_simple": `
                <p class="explicacion-titulo-linea">
                    <span class="explicacion-icono">❓</span>
                    <strong>Preguntas con respuesta Sí/No (presente simple)</strong>
                </p>
                <p>Empezamos con <strong>"Do"</strong> o <strong>"Does"</strong> y luego va el sujeto con el verbo sin <strong>-S</strong> (incluso con He/She/It)</p>
                <p>Recuerda que usamos <strong>"Do"</strong> con los pronombres <strong>I/You/We/They</strong> y <strong>"Does"</strong> para <strong>He/She/It</strong>.</p>
                <p class="ejemplo">👉 Do you like...? = ¿Te gusta...?</p>
                <p class="ejemplo">👉 Does she play...? = ¿Ella juega...?</p>
                <p></p>
                <p> 👇 Otro ejemplo:</p>
            `
        },
        "imperativo": {
            "ordenes_simples": `
                <p class="explicacion-titulo-linea">
                    <span class="explicacion-icono">👉</span>
                    <strong>Dar órdenes o instrucciones</strong>
                </p>
                <p>¡Es muy fácil! Solo usamos el verbo tal cual:</p>
                <p class="ejemplo">👉 Open = Abrir</p>
                <p class="ejemplo">👉 Close = Cerrar</p>
                <p>No necesitamos decir "tú" ni nada más.</p>
                <p> 👇 Ejemplo:</p>
            `
        }
    };

    const explicacion = explicaciones[ejercicio.tipo]?.[ejercicio.subtipo] ||
        "<p>Esta es una estructura gramatical básica del inglés.</p>";

    return explicacion;

}
// Renderizar explicación y práctica (se llaman desde app.js)
function renderizarExplicacion(contenedor) {
// Filtrar oraciones según el tipo seleccionado
let oracionesFiltradas;
if (estadoApp.tipoExplicacionSeleccionado === null) {
    oracionesFiltradas = estadoApp.todasLasOraciones;
} else {
    oracionesFiltradas = estadoApp.todasLasOraciones.filter(
        o => o.tipo === estadoApp.tipoExplicacionSeleccionado
    );
}

// Si no hay oraciones de ese tipo, mostrar mensaje
if (oracionesFiltradas.length === 0) {
    contenedor.innerHTML = "<p>No hay oraciones de este tipo disponibles.</p>";
    return;
}

const e = oracionesFiltradas[estadoApp.indiceExplicacion];

// Mostrar navegador de ejemplos
const navegador = document.createElement("div");
navegador.className = "navegador-explicacion";
navegador.innerHTML = `
        <p class="contador-ejemplos">📚 Ejemplo ${estadoApp.indiceExplicacion + 1} de ${oracionesFiltradas.length}</p>
        <p class="info-tipo">${obtenerNombreTipo(e.tipo, e.subtipo)}</p>
    `;
contenedor.appendChild(navegador);

// Mostrar la frase en inglés destacada
const fraseDiv = document.createElement("div");
fraseDiv.className = "frase-explicacion";
fraseDiv.textContent = e.frase;
contenedor.appendChild(fraseDiv);

// Mostrar traducción completa
if (estadoApp.mostrarAyuda) {
    const traduccionDiv = document.createElement("div");
    traduccionDiv.className = "traduccion-completa";
    traduccionDiv.innerHTML = `<strong>En español:</strong> ${e.traduccion}`;
    contenedor.appendChild(traduccionDiv);
}

// Mostrar explicación gramatical
const explicacionDiv = document.createElement("div");
explicacionDiv.className = "caja-explicacion";
explicacionDiv.innerHTML = obtenerExplicacionGramatical(e);
contenedor.appendChild(explicacionDiv);

// Mostrar partes de la oración
const partesDiv = document.createElement("div");
partesDiv.className = "partes-explicacion";

const tituloPartes = document.createElement("h4");
tituloPartes.textContent = "🔤 Palabras y significados:";
partesDiv.appendChild(tituloPartes);

const partesContainer = document.createElement("div");
partesContainer.className = "partes";

e.partes.forEach(p => {
    const bloque = document.createElement("div");
    bloque.className = "parte";
    bloque.innerHTML = `
            <span class="palabra-ingles">${p.palabra}</span>
            ${estadoApp.mostrarAyuda ? `<div class="significado">${p.significado}</div>` : ""}
        `;
    partesContainer.appendChild(bloque);
});

partesDiv.appendChild(partesContainer);
contenedor.appendChild(partesDiv);

// ⬅️➡️ Botones de navegación (NUEVO ESTILO)
const botonesNav = document.createElement("div");
botonesNav.className = "botones-navegacion-explicacion";

// Botón para volver al selector
const btnVolver = document.createElement("button");
btnVolver.className = "boton-volver";
btnVolver.textContent = "🏠 Volver al menú";
btnVolver.onclick = () => {
    estadoApp.tipoExplicacionSeleccionado = null;
    estadoApp.indiceExplicacion = 0;
    mostrarSelectorTipoExplicacion();
};
botonesNav.appendChild(btnVolver);

const botonesNavPrevNext = document.createElement("div");
botonesNavPrevNext.className = "botones-prev-next";

if (estadoApp.indiceExplicacion > 0) {
    const btnAnterior = document.createElement("button");
    btnAnterior.className = "boton-nav-explicacion";
    btnAnterior.textContent = "⬅️ Anterior";
    btnAnterior.onclick = () => {
        estadoApp.indiceExplicacion--;
        renderizar();
    };
    botonesNavPrevNext.appendChild(btnAnterior);
}

if (estadoApp.indiceExplicacion < oracionesFiltradas.length - 1) {
    const btnSiguiente = document.createElement("button");
    btnSiguiente.className = "boton-nav-explicacion";
    btnSiguiente.textContent = "Siguiente ➡️";
    btnSiguiente.onclick = () => {
        estadoApp.indiceExplicacion++;
        renderizar();
    };
    botonesNavPrevNext.appendChild(btnSiguiente);
}

botonesNav.appendChild(botonesNavPrevNext);
contenedor.appendChild(botonesNav);
}
//Renderizar contenido de explicación por categoría
function renderizarContenido() {
    estadoApp.modo = 'contenido';
    const contenedor = document.getElementById("contenedor");

    const categoriaActual = estadoApp.categoriaActual;
    const oraciones = estadoApp.oracionesCategoriaActual;
    const e = oraciones[estadoApp.indiceExplicacion];

    contenedor.innerHTML = `
        <div class="navegador-contenido">
            <p>${obtenerNombreCategoria(categoriaActual)}</p>
            <p>Ejemplo ${estadoApp.indiceExplicacion + 1} de ${oraciones.length}</p>
        </div>
        
        <div class="frase-explicacion">${e.frase}</div>
        
        ${estadoApp.mostrarAyuda ? `<div class="traduccion-completa">En español: ${e.traduccion}</div>` : ''}
        
        <div class="caja-explicacion">${obtenerExplicacionGramatical(e)}</div>
        
        <!-- 🎮 BOTÓN ESTRELLA: PRÁCTICA -->
        <button class="boton-practica-estrella" onclick="iniciarPracticaPorCategoria()">
            🎮 ¡PRACTICAR ${oraciones.length} ORACIONES DE ESTA CATEGORÍA!
        </button>
        
        <!-- Navegación -->
        <div class="botones-navegacion">
            <button onclick="volverPortada()">🏠 Inicio</button>
            ${estadoApp.indiceExplicacion > 0 ? '<button onclick="anteriorEjemplo()">⬅️ Anterior</button>' : ''}
            ${estadoApp.indiceExplicacion < oraciones.length - 1 ? '<button onclick="siguienteEjemplo()">Siguiente ➡️</button>' : ''}
        </div>
    `;
}
//Renderizar la práctica del ejercicio (selección de palabras)
function renderizarPractica(contenedor) {
    const e = estadoApp.ejercicioActual;

    // Normalizar definición de ejercicios para esta oración
    let listaEjercicios = [];
    if (Array.isArray(e.ejercicios)) {
        listaEjercicios = e.ejercicios;
    } else if (e.ejercicio) {
        listaEjercicios = [e.ejercicio];
    } else {
        listaEjercicios = [{ tipo: "ordenar" }];
    }

    // Elegir ejercicio según el modo de práctica actual
    const tipoObjetivo = estadoApp.tipoPractica || "ordenar";
    const ejercicioSeleccionado =
        listaEjercicios.find(ex => ex.tipo === tipoObjetivo) || listaEjercicios[0];

    const tipoEjercicio = ejercicioSeleccionado.tipo;

    // Si es un ejercicio de hueco, derivamos a su render específico
    if (tipoEjercicio === "hueco") {
        renderizarPracticaHueco(contenedor, e, ejercicioSeleccionado);
        return;
    }

 
    // Mostrar progreso
    const progreso = document.createElement("div");
    progreso.className = "progreso";
    progreso.textContent = `Oración ${estadoApp.indiceOracionActual + 1} de ${estadoApp.cantidadOraciones}`;
    contenedor.appendChild(progreso);

    const contador = document.createElement("p");
    contador.textContent = `Intento ${estadoApp.intentos + 1} de ${estadoApp.maxIntentos}`;
    contador.className = "contador-intentos";
    contenedor.appendChild(contador);

    // Validación automática al completar (SOLO si no se ha validado antes)
    if (estadoApp.respuestaUsuario.length === e.partes.length && estadoApp.resultado === null) {
        validarRespuesta();
    }

    // Si agota intentos, mostrar solución y botón continuar
    if (estadoApp.resultado === "finalizado") {
        const solucion = document.createElement("div");
        solucion.className = "mensaje-error";
        solucion.innerHTML = `
            ❌ Has agotado los ${estadoApp.maxIntentos} intentos.<br>
            La respuesta correcta era:<br>
            <strong>${e.frase}</strong>
        `;
        contenedor.appendChild(solucion);

        const botonContinuar = document.createElement("button");
        botonContinuar.className = "boton-continuar";
        botonContinuar.textContent = "Continuar →";
        botonContinuar.onclick = () => {
            estadoApp.oracionesCompletadas++;
            estadoApp.indiceOracionActual++;
            cargarSiguienteOracion();
        };
        contenedor.appendChild(botonContinuar);
        return; // ⬅️ IMPORTANTE: Salir aquí
    }

    // Mostrar resultado correcto y botón continuar
    if (estadoApp.resultado === "correcto") {
        const respuesta = document.createElement("div");
        respuesta.className = "respuesta";
        respuesta.textContent = estadoApp.respuestaUsuario.join(" ");
        contenedor.appendChild(respuesta);

        const resultado = document.createElement("div");
        resultado.className = "mensaje-exito";
        resultado.textContent = "✓ ¡Muy bien! ¡Correcto!";
        contenedor.appendChild(resultado);

        const botonContinuar = document.createElement("button");
        botonContinuar.className = "boton-continuar";
        botonContinuar.textContent = "Continuar →";
        botonContinuar.onclick = () => {
            estadoApp.oracionesCompletadas++;
            estadoApp.oracionesCorrectas++;
            estadoApp.indiceOracionActual++;
            cargarSiguienteOracion();
        };
        contenedor.appendChild(botonContinuar);
        return; // ⬅️ IMPORTANTE: Salir aquí
    }

    // Si es incorrecto, mostrar mensaje y botón reintentar
    if (estadoApp.resultado === "incorrecto") {
        const respuesta = document.createElement("div");
        respuesta.className = "respuesta";
        respuesta.textContent = estadoApp.respuestaUsuario.join(" ");
        contenedor.appendChild(respuesta);

        const resultado = document.createElement("div");
        resultado.className = "mensaje-advertencia";
        resultado.textContent = "❌ No es correcto. Inténtalo de nuevo.";
        contenedor.appendChild(resultado);

        const boton = document.createElement("button");
        boton.className = "boton-reintentar";
        boton.textContent = "🔄 Reintentar";
        boton.onclick = reintentarEjercicio;
        contenedor.appendChild(boton);
        return; // ⬅️ IMPORTANTE: Salir aquí
    }

    // Si llegamos aquí, es porque aún no se ha respondido o está en progreso
    // Inicializar palabras mezcladas una sola vez
    if (estadoApp.palabrasPractica.length === 0) {
        estadoApp.palabrasPractica = [...e.partes.map(p => p.palabra)]
            .sort(() => Math.random() - 0.5);
    }

    const respuesta = document.createElement("div");
    respuesta.className = "respuesta";
    respuesta.textContent = estadoApp.respuestaUsuario.join(" ") || "Selecciona las palabras en orden...";
    contenedor.appendChild(respuesta);

    const zonaPalabras = document.createElement("div");
    zonaPalabras.className = "palabras";

    estadoApp.palabrasPractica.forEach(p => {
        const contenedorPalabra = document.createElement("div");
        contenedorPalabra.className = "contenedor-palabra";

        const btn = document.createElement("button");
        btn.className = "boton-palabra";
        btn.textContent = p;
        btn.disabled = estadoApp.respuestaUsuario.includes(p);

        btn.onclick = () => {
            estadoApp.respuestaUsuario.push(p);
            renderizar();
        };

        contenedorPalabra.appendChild(btn);

        // Mostrar ayuda en español si está activada
        if (estadoApp.mostrarAyuda) {
            const significado = e.partes.find(parte => parte.palabra === p)?.significado;
            if (significado) {
                const ayudaDiv = document.createElement("div");
                ayudaDiv.className = "ayuda-palabra";
                ayudaDiv.textContent = significado;
                contenedorPalabra.appendChild(ayudaDiv);
            }
        }

        zonaPalabras.appendChild(contenedorPalabra);
    });

    contenedor.appendChild(zonaPalabras);
}

// Práctica de completar hueco (gap-fill)
function renderizarPracticaHueco(contenedor, e, configEjercicio) {
    // Progreso
    const progreso = document.createElement("div");
    progreso.className = "progreso";
    progreso.textContent = `Oración ${estadoApp.indiceOracionActual + 1} de ${estadoApp.cantidadOraciones}`;
    contenedor.appendChild(progreso);

    const contador = document.createElement("p");
    contador.textContent = `Intento ${estadoApp.intentos + 1} de ${estadoApp.maxIntentos}`;
    contador.className = "contador-intentos";
    contenedor.appendChild(contador);

    const tipoHueco = configEjercicio?.campoHueco || "verbo";

    // Parte marcada como hueco
    const parteHueco = e.partes.find(p => p.esHueco);
    const solucion = parteHueco ? parteHueco.palabra : "";

    // Si ya hay respuesta escrita y aún no se ha evaluado, validamos
    if (estadoApp.respuestaUsuario.length > 0 && estadoApp.resultado === null) {
        const respuestaTexto = estadoApp.respuestaUsuario[0];
        if (respuestaTexto === solucion) {
            estadoApp.resultado = "correcto";
        } else {
            estadoApp.intentos++;
            if (estadoApp.intentos >= estadoApp.maxIntentos) {
                estadoApp.resultado = "finalizado";
            } else {
                estadoApp.resultado = "incorrecto";
            }
        }
    }

    // Estados finales
    if (estadoApp.resultado === "finalizado") {
        const solucionDiv = document.createElement("div");
        solucionDiv.className = "mensaje-error";
        solucionDiv.innerHTML = `
            ❌ Has agotado los ${estadoApp.maxIntentos} intentos.<br>
            La respuesta correcta era:<br>
            <strong>${e.frase}</strong>
        `;
        contenedor.appendChild(solucionDiv);

        const botonContinuar = document.createElement("button");
        botonContinuar.className = "boton-continuar";
        botonContinuar.textContent = "Continuar →";
        botonContinuar.onclick = () => {
            estadoApp.oracionesCompletadas++;
            estadoApp.indiceOracionActual++;
            cargarSiguienteOracion();
        };
        contenedor.appendChild(botonContinuar);
        return;
    }

    if (estadoApp.resultado === "correcto") {
        const resultado = document.createElement("div");
        resultado.className = "mensaje-exito";
        resultado.textContent = "✓ ¡Muy bien! ¡Correcto!";
        contenedor.appendChild(resultado);

        const botonContinuar = document.createElement("button");
        botonContinuar.className = "boton-continuar";
        botonContinuar.textContent = "Continuar →";
        botonContinuar.onclick = () => {
            estadoApp.oracionesCompletadas++;
            estadoApp.oracionesCorrectas++;
            estadoApp.indiceOracionActual++;
            cargarSiguienteOracion();
        };
        contenedor.appendChild(botonContinuar);
        return;
    }

    if (estadoApp.resultado === "incorrecto") {
        const resultado = document.createElement("div");
        resultado.className = "mensaje-advertencia";
        resultado.textContent = "❌ No es correcto. Inténtalo de nuevo.";
        contenedor.appendChild(resultado);

        const boton = document.createElement("button");
        boton.className = "boton-reintentar";
        boton.textContent = "🔄 Reintentar";
        boton.onclick = () => {
            estadoApp.respuestaUsuario = [];
            estadoApp.resultado = null;
            renderizar();
        };
        contenedor.appendChild(boton);
        return;
    }

    // Frase con hueco
    const fraseDiv = document.createElement("div");
    fraseDiv.className = "frase-explicacion";

    const textoConHueco = e.partes.map(p => {
        if (p.esHueco) return "____";
        return p.palabra;
    }).join(" ");

    fraseDiv.textContent = textoConHueco;
    contenedor.appendChild(fraseDiv);

    // Traducción como ayuda
    if (estadoApp.mostrarAyuda) {
        const traduccionDiv = document.createElement("div");
        traduccionDiv.className = "traduccion-completa";
        traduccionDiv.innerHTML = `<strong>En español:</strong> ${e.traduccion}`;
        contenedor.appendChild(traduccionDiv);
    }

    // Input de respuesta
    const input = document.createElement("input");
    input.type = "text";
    input.className = "input-hueco";
    input.placeholder = tipoHueco === "verbo" ? "Escribe el verbo..." : "Escribe la palabra...";
    input.value = estadoApp.respuestaUsuario[0] || "";
    input.oninput = ev => {
        estadoApp.respuestaUsuario = [ev.target.value.trim()];
    };
    contenedor.appendChild(input);

    const botonComprobar = document.createElement("button");
    botonComprobar.className = "boton-continuar";
    botonComprobar.textContent = "Comprobar";
    botonComprobar.onclick = () => renderizar();
    contenedor.appendChild(botonComprobar);
}

