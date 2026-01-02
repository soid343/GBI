// =========================================
// UI.JS - FUNCIONES DE INTERFAZ SOLO
// =========================================

// ==============================
// MENÚ PRINCIPAL (3 BOTONES)
// ==============================
function renderizarMenuPrincipal() {
    const contenedor = document.getElementById("contenedor");
    contenedor.innerHTML = `
        <div class="menu-principal">
            <h1>Gramática Básica de Inglés</h1>
            <p class="subtitulo">Elige cómo quieres jugar</p>
            
            <div class="menu-botones">
                <button class="boton-menu grande" onclick="irALecciones()">
                    📚 Lecciones
                    <span>Explicaciones y práctica con ayuda</span>
                </button>
                
                <button class="boton-menu grande" onclick="irAReto()">
                    🎯 Reto de actividades
                    <span>3, 5 o 10 ejercicios sin ayuda</span>
                </button>
                
                <button class="boton-menu grande" onclick="irARecords()">
                    🏆 Récords
                    <span>Mejores puntuaciones del reto</span>
                </button>
            </div>
        </div>
    `;
}
// ==============================
// PANTALLA DE LECCIONES
// ==============================
function renderizarInicio() {
    const contenedor = document.getElementById("contenedor");
    contenedor.innerHTML = `
        <div class="portada-principal">
            <h1>¡Gramática Básica Inglés! 🌟</h1>
            <p class="subtitulo">Aprende jugando con oraciones reales</p>
            
            <div class="grid-contenidos">
                <button class="contenido-card" onclick="iniciarContenido('pronouns_to_be')">
                    <div class="emoji">🧑‍🤝‍🧑</div>
                    <h3>Pronouns & To be</h3>
                    <p>I am / You are / He is</p>
                </button>

                <button class="contenido-card" onclick="iniciarContenido('pronouns_have_got')">
                    <div class="emoji">📦</div>
                    <h3>Pronouns & Have got</h3>
                    <p>I have got / She has got</p>
                </button>

                <button class="contenido-card" onclick="iniciarContenido('wh_questions')">
                    <div class="emoji">❓</div>
                    <h3>Preguntas simples (Wh-)</h3>
                    <p>What / Where / Who / How</p>
                </button>

                <button class="contenido-card" onclick="iniciarContenido('negations_simple')">
                    <div class="emoji">❌</div>
                    <h3>Negaciones</h3>
                    <p>don't / doesn't / isn't</p>
                </button>

                <button class="contenido-card" onclick="iniciarContenido('yes_no_questions')">
                    <div class="emoji">🤔</div>
                    <h3>Preguntas Sí/No</h3>
                    <p>Do you...? / Does she...?</p>
                </button>

                <button class="contenido-card" onclick="iniciarContenido('verb_to_do')">
                    <div class="emoji">👉</div>
                    <h3>Verbo "to do"</h3>
                    <p>Do / Does / Don't</p>
                </button>

                <button class="contenido-card especial" onclick="iniciarContenido('all_mixed')">
                    <div class="emoji">📚</div>
                    <h3>Clasificación / mezcla</h3>
                    <p>¡Todas las oraciones!</p>
                </button>
            </div>
        </div>
    `;
}



// Mostrar selector de cantidad de oraciones
function mostrarSelectorCantidad() {
    const toggle = document.querySelector(".toggle"); // Ocultar el toggle mientras se selecciona cantidad
    toggle.style.display = "none";

    const contenedor = document.getElementById("contenedor");
    contenedor.innerHTML = "";

    const titulo = document.createElement("h3");
    titulo.textContent = "¿Cuántas oraciones quieres practicar?";
    titulo.className = "titulo-selector";
    contenedor.appendChild(titulo);

    const selectorDiv = document.createElement("div");
    selectorDiv.className = "selector-cantidad";

    const cantidades = [3, 5, 10];
    cantidades.forEach(cant => {
        const boton = document.createElement("button");
        boton.className = "boton-cantidad";
        boton.textContent = `${cant} oraciones`;
        boton.onclick = () => iniciarPractica(cant);
        selectorDiv.appendChild(boton);
    });

    // Opción para practicar todas
    const botonTodas = document.createElement("button");
    botonTodas.className = "boton-cantidad";
    botonTodas.textContent = `Todas (${estadoApp.todasLasOraciones.length})`;
    botonTodas.onclick = () => iniciarPractica(estadoApp.todasLasOraciones.length);
    selectorDiv.appendChild(botonTodas);

    contenedor.appendChild(selectorDiv);
}

// Mostrar selector de tipos de oración para explicación
function mostrarSelectorTipoExplicacion() {
    // Ocultar el toggle mientras se selecciona tipo
    const toggle = document.querySelector(".toggle");
    toggle.style.display = "none";

    const contenedor = document.getElementById("contenedor");
    contenedor.innerHTML = "";

    const titulo = document.createElement("h3");
    titulo.textContent = "¿Qué tipo de oraciones quieres aprender?";
    titulo.className = "titulo-selector";
    contenedor.appendChild(titulo);

    const selectorDiv = document.createElement("div");
    selectorDiv.className = "selector-cantidad";

    // Definir los tipos de oraciones con emojis
    const tipos = [
        { id: "pregunta_simple", nombre: "❓ Preguntas (What, Where, Who, How)", emoji: "❓" },
        { id: "afirmacion_simple", nombre: "✅ Afirmaciones (ser/estar, acciones)", emoji: "✅" },
        { id: "negacion_simple", nombre: "❌ Negaciones (no ser, no hacer)", emoji: "❌" },
        { id: "pregunta_yes_no", nombre: "🤔 Preguntas Sí/No", emoji: "🤔" },
        { id: "imperativo", nombre: "👉 Órdenes e instrucciones", emoji: "👉" }
    ];

    tipos.forEach(tipo => {
        const boton = document.createElement("button");
        boton.className = "boton-cantidad";
        boton.innerHTML = tipo.nombre;
        boton.onclick = () => iniciarExplicacionPorTipo(tipo.id);
        selectorDiv.appendChild(boton);
    });

    // Opción para ver todas
    const botonTodas = document.createElement("button");
    botonTodas.className = "boton-cantidad";
    botonTodas.textContent = `📚 Todas las oraciones (${estadoApp.todasLasOraciones.length})`;
    botonTodas.onclick = () => iniciarExplicacionPorTipo(null);
    selectorDiv.appendChild(botonTodas);

    contenedor.appendChild(selectorDiv);
}

// Barra superior reutilizable para lección y práctica
function crearBarraNavegacion() {
    const barra = document.createElement("div");
    barra.className = "barra-navegacion";
    barra.innerHTML = `
    <button class="btn-icono btn-home" title="Menú principal">
      <span class="icono">🏠</span>
      <span class="etiqueta-icono">Home</span>
    </button>
    <div class="barra-titulo">
      <h2 id="titulo-leccion">${obtenerNombreLeccion(estadoApp.categoriaActual)}</h2>
    </div>
    <button class="btn-icono btn-volver" title="Volver">
      <span class="icono">←</span>
      <span class="etiqueta-icono">Volver</span>
    </button>
  `;

    const btnHome = barra.querySelector(".btn-home");
    const btnVolver = barra.querySelector(".btn-volver");
    if (btnHome) btnHome.addEventListener("click", irAlMenuPrincipal);
    if (btnVolver) btnVolver.addEventListener("click", volverALecciones);

    return barra;
}

// Renderizar contenido de una lección concreta
function renderizarContenidoLeccion() {
    const contenedor = document.getElementById("contenedor");
    const todas = estadoApp.oracionesCategoriaActual;

    if (!todas || todas.length === 0) {
        contenedor.innerHTML = "<p>No hay oraciones para esta lección todavía.</p>";
        return;
    }

    // 👉 Agrupar por subtipo y quedarnos solo con un ejemplo por subtipo
    const ejemplosPorSubtipo = [];
    const vistos = new Set();

    todas.forEach(ej => {
        const clave = `${ej.tipo}__${ej.subtipo}`;
        if (!vistos.has(clave)) {
            vistos.add(clave);
            ejemplosPorSubtipo.push(ej);
        }
    });

    // Índice dentro de la lista de subtipos únicos
    const indice = Math.min(
        estadoApp.indiceExplicacion || 0,
        ejemplosPorSubtipo.length - 1
    );
    const e = ejemplosPorSubtipo[indice];

    contenedor.innerHTML = "";

    // Barra de navegación (Home + título + Volver)
    const barra = document.createElement("div");
    barra.className = "barra-navegacion";
    barra.innerHTML = `
    <button class="btn-icono btn-home" title="Menú principal">🏠</button>
    <div class="barra-titulo">
      <h2 id="titulo-leccion">${obtenerNombreLeccion(estadoApp.categoriaActual)}</h2>
    </div>
    <button class="btn-icono btn-volver" title="Volver">←</button>
  `;
    contenedor.appendChild(barra);

    const btnHome = barra.querySelector(".btn-home");
    const btnVolver = barra.querySelector(".btn-volver");
    if (btnHome) btnHome.addEventListener("click", irAlMenuPrincipal);
    if (btnVolver) btnVolver.addEventListener("click", volverALecciones);

    // Info de progreso por subtipo (no por oración)
    const info = document.createElement("p");
    info.textContent = `Parte ${indice + 1} de ${ejemplosPorSubtipo.length}`;
    contenedor.appendChild(info);

    // 👉 Explicación gramatical (protagonista, arriba)
    const explicacionDiv = document.createElement("div");
    explicacionDiv.className = "caja-explicacion";
    explicacionDiv.innerHTML = obtenerExplicacionGramatical(e);
    contenedor.appendChild(explicacionDiv);

    // 👉 Bloque sombreado con frase + traducción debajo
    const bloqueFrase = document.createElement("div");
    bloqueFrase.className = "frase-bloque";

    const fraseDiv = document.createElement("div");
    fraseDiv.className = "frase-explicacion";
    fraseDiv.textContent = e.frase;
    bloqueFrase.appendChild(fraseDiv);

    if (estadoApp.mostrarAyuda) {
        const traduccionDiv = document.createElement("div");
        traduccionDiv.className = "traduccion-frase";
        traduccionDiv.innerHTML = `<strong>En español:</strong> ${e.traduccion}`;
        bloqueFrase.appendChild(traduccionDiv);
    }

    contenedor.appendChild(bloqueFrase);

    // Botón único: ir al menú de modos de práctica de esta lección
    const botonPractica = document.createElement("button");
    botonPractica.className = "boton-practica-estrella";
    botonPractica.textContent = "🎮 Practicar esta lección";
    botonPractica.onclick = () => mostrarMenuPracticaLeccion();
    contenedor.appendChild(botonPractica);


    // Navegación entre tipos/subtipos
    const nav = document.createElement("div");
    nav.className = "botones-navegacion-explicacion";

    const btnInicio = document.createElement("button");
    btnInicio.className = "boton-volver";
    btnInicio.textContent = "🏠 Volver a las lecciones";
    btnInicio.onclick = () => renderizarInicio();
    nav.appendChild(btnInicio);

    const navPrevNext = document.createElement("div");
    navPrevNext.className = "botones-prev-next";

    if (indice > 0) {
        const btnPrev = document.createElement("button");
        btnPrev.className = "boton-nav-explicacion";
        btnPrev.textContent = "⬅️ Anterior";
        btnPrev.onclick = () => {
            estadoApp.indiceExplicacion--;
            renderizarContenidoLeccion();
        };
        navPrevNext.appendChild(btnPrev);
    }

    if (indice < ejemplosPorSubtipo.length - 1) {
        const btnNext = document.createElement("button");
        btnNext.className = "boton-nav-explicacion";
        btnNext.textContent = "Siguiente ➡️";
        btnNext.onclick = () => {
            estadoApp.indiceExplicacion++;
            renderizarContenidoLeccion();
        };
        navPrevNext.appendChild(btnNext);
    }

    nav.appendChild(navPrevNext);
    contenedor.appendChild(nav);
}

// Menú con los tipos de ejercicios para practicar una lección
function mostrarMenuPracticaLeccion() {
    const contenedor = document.getElementById("contenedor");
    contenedor.innerHTML = "";

    // 🔹 Barra de navegación (Home + título + Volver)
    const barra = document.createElement("div");
    barra.className = "barra-navegacion";
    barra.innerHTML = `
    <button class="btn-icono btn-home" title="Menú principal">
      <span class="icono">🏠</span>
      <span class="etiqueta-icono">Home</span>
    </button>
    <div class="barra-titulo">
      <h2 id="titulo-leccion">${obtenerNombreLeccion(estadoApp.categoriaActual)}</h2>
    </div>
    <button class="btn-icono btn-volver" title="Volver">
      <span class="icono">←</span>
      <span class="etiqueta-icono">Volver</span>
    </button>
  `;
    contenedor.appendChild(barra);

    const btnHome = barra.querySelector(".btn-home");
    const btnVolver = barra.querySelector(".btn-volver");
    if (btnHome) btnHome.addEventListener("click", irAlMenuPrincipal);
    if (btnVolver) btnVolver.addEventListener("click", volverALecciones);

    // 🔹 Tus tarjetas de selección de modo de práctica
    const portada = document.createElement("div");
    portada.className = "portada-principal";
    portada.innerHTML = `
    <h1>Elige cómo practicar 🌟</h1>
    <p class="subtitulo">Escoge el tipo de ejercicio para esta lección</p>
    
    <div class="grid-contenidos">
        <button class="contenido-card" onclick="seleccionarModoPractica('ordenar')">
            <div class="emoji">🔤</div>
            <h3>Ordenar palabras</h3>
            <p>Coloca las palabras en el orden correcto</p>
        </button>

        <button class="contenido-card" onclick="seleccionarModoPractica('hueco')">
            <div class="emoji">✏️</div>
            <h3>Completar huecos</h3>
            <p>Escribe la palabra que falta</p>
        </button>

        <button class="contenido-card especial" onclick="renderizarContenidoLeccion()">
            <div class="emoji">⬅️</div>
            <h3>Volver a la lección</h3>
            <p>Ver de nuevo las explicaciones</p>
        </button>
    </div>
  `;
    contenedor.appendChild(portada);
}

// Nombre para cada lección
function obtenerNombreLeccion(leccionId) {
    const nombres = {
        "pronouns_to_be": "Pronouns & To be",
        "pronouns_have_got": "Pronouns & Have got",
        "wh_questions": "Preguntas simples (Wh-)",
        "negations_simple": "Negaciones",
        "yes_no_questions": "Preguntas Sí/No",
        "verb_to_do": "Verbo \"to do\" (presente simple)",
        "all_mixed": "Clasificación / mezcla"
    };
    return nombres[leccionId] || "Lección";
}



// Mostrar resumen final
function mostrarResumenFinal() {
    const contenedor = document.getElementById("contenedor");
    contenedor.innerHTML = "";

    const resumen = document.createElement("div");
    resumen.className = "resumen-final";
    const porcentaje = Math.round((estadoApp.oracionesCorrectas / estadoApp.oracionesCompletadas) * 100);

    resumen.innerHTML = `
        <h2>¡Práctica completada! 🎉</h2>
        <div class="estadisticas">
            <p>Oraciones practicadas: <strong>${estadoApp.oracionesCompletadas}</strong></p>
            <p>Oraciones correctas: <strong>${estadoApp.oracionesCorrectas}</strong></p>
            <p>Aciertos: <strong>${porcentaje}%</strong></p>
        </div>
    `;

    // 🔹 Botones según de dónde venimos
    const zonaBotones = document.createElement("div");
    zonaBotones.className = "zona-botones-resumen";

    if (estadoApp.categoriaActual) {
        // ➜ Venimos de una lección concreta
        const btnRepetirLeccion = document.createElement("button");
        btnRepetirLeccion.className = "boton-reiniciar";
        btnRepetirLeccion.textContent = "🔁 Practicar de nuevo esta lección";
        btnRepetirLeccion.onclick = () => iniciarPracticaLeccion();
        zonaBotones.appendChild(btnRepetirLeccion);

        const btnVolverLecciones = document.createElement("button");
        btnVolverLecciones.className = "boton-volver";
        btnVolverLecciones.textContent = "📚 Volver a las lecciones";
        btnVolverLecciones.onclick = () => {
            estadoApp.modo = "explicacion";
            renderizarInicio();
        };
        zonaBotones.appendChild(btnVolverLecciones);

        const btnMenuPrincipal = document.createElement("button");
        btnMenuPrincipal.className = "boton-volver";
        btnMenuPrincipal.textContent = "🏠 Menú principal";
        btnMenuPrincipal.onclick = () => {
            estadoApp.modoPrincipal = "menu";
            estadoApp.modo = "explicacion";
            estadoApp.modoJuego = null;
            renderizarMenuPrincipal();
        };
        zonaBotones.appendChild(btnMenuPrincipal);
    } else {
        // ➜ Práctica general (selector 3/5/10/todas)
        const botonReiniciar = document.createElement("button");
        botonReiniciar.className = "boton-reiniciar";
        botonReiniciar.textContent = "Practicar de nuevo";
        botonReiniciar.onclick = () => mostrarSelectorCantidad();
        zonaBotones.appendChild(botonReiniciar);
    }

    resumen.appendChild(zonaBotones);
    contenedor.appendChild(resumen);
}
