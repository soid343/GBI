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
    let oraciones = estadoApp.oracionesCategoriaActual;
    
    if (!oraciones || oraciones.length === 0) return;

    // Si el tipo de práctica es emparejar, nos quedamos solo con oraciones que tengan ese ejercicio
    if (estadoApp.tipoPractica === "emparejar") {
        oraciones = oraciones.filter(ej =>
            Array.isArray(ej.ejercicios) &&
            ej.ejercicios.some(ex => ex.tipo === "emparejar")
        );
        if (oraciones.length === 0) {
            // No hay ninguna oración con emparejar en esta lección
            // Dejamos que renderizarPractica muestre el mensaje genérico
            estadoApp.oracionesCategoriaActual = [];
            estadoApp.oracionesSeleccionadas = [];
            estadoApp.cantidadOraciones = 0;
            renderizar();
            return;
        }
    }

    // Si el tipo de práctica es opcion, nos quedamos solo con oraciones que tengan ese ejercicio
    if (estadoApp.tipoPractica === "opcion") {
        oraciones = oraciones.filter(ej =>
            Array.isArray(ej.ejercicios) &&
            ej.ejercicios.some(ex => ex.tipo === "opcion")
        );
        if (oraciones.length === 0) {
            // No hay ninguna oración con emparejar en esta lección
            // Dejamos que renderizarPractica muestre el mensaje genérico
            estadoApp.oracionesCategoriaActual = [];
            estadoApp.oracionesSeleccionadas = [];
            estadoApp.cantidadOraciones = 0;
            renderizar();
            return;
        }
    }

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
    estadoApp.tipoPractica = tipo;  //  "ordenar", "hueco", "emparejar", "opcion"
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

    // Construir la respuesta del usuario
    const usuario = estadoApp.respuestaUsuario.join(" ");

    // Normalizar ambas cadenas: quitar puntuación final y espacios extra
    const usuarioNormalizado = usuario.replace(/[.,!?;:]+$/g, '').trim();
    const correctaNormalizada = e.frase.replace(/[.,!?;:]+$/g, '').trim();

    // Comparar versiones normalizadas
    if (usuarioNormalizado === correctaNormalizada) {
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
            `,
            "have_got": `
                 <p class="explicacion-titulo-linea">
                    <span class="explicacion-icono">📦</span>
                    <strong>Usar "have got" para decir que tenemos algo</strong>
                </p>
                <p>Usamos <strong>have got</strong> para decir que tenemos algo.</p>
                <ul>
                    <li>🙋 <strong>I have got</strong> = Yo tengo</li>
                    <li>👦👧 <strong>You have got</strong> = Tú tienes / Vosotros tenéis</li>
                    <li>👦 <strong>He has got</strong> = Él tiene</li>
                    <li>👧 <strong>She has got</strong> = Ella tiene</li>
                    <li>🐶 <strong>It has got</strong> = (un animal o cosa) tiene</li>
                    <li>👨‍👩‍👧‍👦 <strong>We have got</strong> = Nosotros tenemos</li>
                    <li>👥 <strong>They have got</strong> = Ellos tienen</li>
                </ul>
                <p class="ejemplo">👉 I have got a bike. = Yo tengo una bici.</p>
                <p class="ejemplo">👉 She has got a dog. = Ella tiene un perro.</p>
                <p><strong>La clave está en saber que...</strong> Con <strong>he/she/it</strong> usamos <strong>HAS got</strong>, con los demás <strong>HAVE got</strong>.</p>
                <p>👇 Otro ejemplo:</p>
            `,
            "there_is_are": `
                <p class="explicacion-titulo-linea">
                    <span class="explicacion-icono">🏠</span>
                    <strong>Usar "There is / There are" para decir lo que hay</strong>
                </p>
                <p>Usamos <strong>there is / there are</strong> para decir lo que <strong>hay</strong> en un lugar.</p>
                <ul>
                    <li><strong>There is</strong> + una cosa (singular)</li>
                    <li><strong>There are</strong> + varias cosas (plural)</li>
                </ul>
                <p class="ejemplo">👉 There is a cat in the garden. = Hay un gato en el jardín.</p>
                <p class="ejemplo">👉 There are two chairs in the room. = Hay dos sillas en la habitación.</p>
                <p><strong>Truco:</strong> piensa en español “hay 1” → there is, “hay muchos” → there are.</p>
                <p>👇 Otro ejemplo:</p>
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
                 <p>También podemos encontrarlo contraído, como vimos anteriormente, <strong>"I am not"</strong> y <strong>"I'm not"</strong> son lo mismo, <strong>"I"</strong> se une con <strong>"am"</strong> para crear la contracción <strong>"I'm"</strong>.</p>
                 <p>Sucede igual con <strong>"She is not"</strong> y <strong>"She isn't"</strong> o con <strong>"They are not"</strong> y <strong>"The aren't"</strong></p>
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
            `,
            "have_got": `
                <p class="explicacion-titulo-linea">
                    <span class="explicacion-icono">🚫</span>
                    <strong>Decir que NO tenemos algo con "have got"</strong>
                </p>
                <p>Para decir que <strong>NO</strong> tenemos algo usamos <strong>haven't got</strong> o <strong>hasn't got</strong>:</p>
                <ul>
                    <li>I <strong>haven't got</strong>... = No tengo...</li>
                    <li>You <strong>haven't got</strong>... = No tienes...</li>
                    <li>He/She/It <strong>hasn't got</strong>... = Él/Ella (eso) no tiene...</li>
                    <li>We/They <strong>haven't got</strong>... = Nosotros/Ellos no tienen...</li>
                </ul>
                <p class="ejemplo">👉 I haven't got a pencil. = No tengo un lápiz.</p>
                <p class="ejemplo">👉 He hasn't got a sister. = Él no tiene una hermana.</p>
                <p><strong>La clave está en saber que...</strong> Con <strong>he/she/it</strong> usamos <strong>HAS NOT got</strong>, con los demás <strong>HAVE NOT got</strong>.</p>
                <p><strong>Recuerda que...</strong> <strong>haven't</strong> = have not, <strong>hasn't</strong> = has not. Simplemente son contracciones para abreviar, pero significan los mismo.</p>
                <p>👇 Otro ejemplo:</p>
            `,
            "there_is_are": `
                <p class="explicacion-titulo-linea">
                    <span class="explicacion-icono">🚫</span>
                    <strong>Decir que NO hay algo: "There isn't / There aren't"</strong>
                </p>
                <p>Para decir que <strong>no hay</strong> algo usamos:</p>
                <ul>
                    <li><strong>There isn't</strong> + una cosa</li>
                    <li><strong>There aren't</strong> + varias cosas</li>
                </ul>
                <p class="ejemplo">👉 There isn't a TV in my room. = No hay una tele en mi habitación.</p>
                <p class="ejemplo">👉 There aren't any books on the table. = No hay libros en la mesa.</p>
                <p><strong>Truco:</strong> "isn't" = is not, "aren't" = are not. Significan lo mismo pero <strong>ISN'T</strong> y <strong> AREN'T</strong> están contraídas.</p>
                <p>👇 Otro ejemplo:</p>
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
            `,
            "have_got": `
                <p class="explicacion-titulo-linea">
                    <span class="explicacion-icono">❓</span>
                    <strong>Preguntas Sí/No con "have got"</strong>
                </p>
                <p>Para preguntar si alguien tiene algo, empezamos con <strong>Have</strong> o <strong>Has</strong>:</p>
                <ul>
                    <li><strong>Have</strong> + I/you/we/they + got ...?</li>
                    <li><strong>Has</strong> + he/she/it + got ...?</li>
                </ul>
                <p class="ejemplo">👉 Have you got a pet? = ¿Tienes una mascota?</p>
                <p class="ejemplo">👉 Has she got a bike? = ¿Ella tiene una bici?</p>
                <p>Las respuestas son cortas:</p>
                <ul>
                    <li>Yes, I have. / No, I haven't.</li>
                    <li>Yes, he has. / No, he hasn't.</li>
                </ul>
                <p>👇 Otro ejemplo:</p>
            `,
            "there_is_are": `
                <p class="explicacion-titulo-linea">
                    <span class="explicacion-icono">❓</span>
                    <strong>Preguntar si hay algo: "Is there...? / Are there...?"</strong>
                </p>
                <p>Para preguntar si hay algo, cambiamos el orden:</p>
                <ul>
                    <li><strong>Is there</strong> + una cosa ...?</li>
                    <li><strong>Are there</strong> + varias cosas ...?</li>
                </ul>
                <p class="ejemplo">👉 Is there a park near your house? = ¿Hay un parque cerca de tu casa?</p>
                <p class="ejemplo">👉 Are there any posters on the wall? = ¿Hay pósters en la pared?</p>
                <p>Respuestas:</p>
                <ul>
                    <li>Yes, there is. / No, there isn't.</li>
                    <li>Yes, there are. / No, there aren't.</li>
                </ul>
                <p>👇 Otro ejemplo:</p>
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
// Renderizar la práctica del ejercicio (selección de palabras / hueco / emparejar / opción)
function renderizarPractica(contenedor) {
    const e = estadoApp.ejercicioActual;

    // Limpiar y añadir barra de navegación Home / Volver
    contenedor.innerHTML = "";
    const barra = crearBarraNavegacion();
    contenedor.appendChild(barra);

    // Normalizar definición de ejercicios para esta oración
    let listaEjercicios = [];
    if (Array.isArray(e.ejercicios)) {
        listaEjercicios = e.ejercicios;
    } else if (e.ejercicio) {
        listaEjercicios = [e.ejercicio];
    } else {
        // Compatibilidad antigua: solo ordenar
        listaEjercicios = [{ tipo: "ordenar" }];
    }

    // Elegir ejercicio según el modo de práctica actual
    const tipoObjetivo = estadoApp.tipoPractica || "ordenar";
    let ejercicioSeleccionado = listaEjercicios.find(ex => ex.tipo === tipoObjetivo);

    // Si no hay ejercicio de ese tipo, mostrar aviso y salir
    if (!ejercicioSeleccionado) {
        const aviso = document.createElement("div");
        aviso.className = "mensaje-advertencia";
        aviso.textContent = "No se encuentran oraciones adecuadas para este tipo de ejercicio.";
        contenedor.appendChild(aviso);

        const botonVolver = document.createElement("button");
        botonVolver.className = "boton-volver";
        botonVolver.textContent = "Elegir otro tipo de práctica";
        botonVolver.onclick = mostrarMenuPracticaLeccion;
        contenedor.appendChild(botonVolver);
        return;
    }

    const tipoEjercicio = ejercicioSeleccionado.tipo;

    // Ramas específicas según el tipo de ejercicio
    if (tipoEjercicio === "hueco") {
        renderizarPracticaHueco(contenedor, e, ejercicioSeleccionado);
        return;
    }

    if (tipoEjercicio === "emparejar") {
        renderizarPracticaEmparejar(contenedor, e, ejercicioSeleccionado);
        return;
    }

    if (tipoEjercicio === "opcion") {
        renderizarPracticaOpcion(contenedor, e, ejercicioSeleccionado);
        return;
    }

    // ---------- ejercicio de ORDENAR ----------

    // Progreso
    const progreso = document.createElement("div");
    progreso.className = "progreso";
    progreso.textContent = `Oración ${estadoApp.indiceOracionActual + 1} de ${estadoApp.cantidadOraciones}`;
    contenedor.appendChild(progreso);

    const contador = document.createElement("p");
    contador.textContent = `Intento ${estadoApp.intentos + 1} de ${estadoApp.maxIntentos}`;
    contador.className = "contador-intentos";
    contenedor.appendChild(contador);

    // Validación automática al completar
    if (estadoApp.respuestaUsuario.length === e.partes.length && estadoApp.resultado === null) {
        validarRespuesta();
    }

    // Estados finales (finalizado / correcto / incorrecto) -> mismo código que tenías
    if (estadoApp.resultado === "finalizado") {
        const solucion = document.createElement("div");
        solucion.className = "mensaje-error";
        solucion.innerHTML =
            `Has agotado los ${estadoApp.maxIntentos} intentos.<br>` +
            `La respuesta correcta era:<br><strong>${e.frase}</strong>`;
        contenedor.appendChild(solucion);

        const botonContinuar = document.createElement("button");
        botonContinuar.className = "boton-continuar";
        botonContinuar.textContent = "Continuar";
        botonContinuar.onclick = () => {
            estadoApp.oracionesCompletadas++;
            estadoApp.indiceOracionActual++;
            cargarSiguienteOracion();
        };
        contenedor.appendChild(botonContinuar);
        return;
    }

    if (estadoApp.resultado === "correcto") {
        const respuesta = document.createElement("div");
        respuesta.className = "respuesta";
        respuesta.textContent = e.frase;
        contenedor.appendChild(respuesta);

        const resultado = document.createElement("div");
        resultado.className = "mensaje-exito";
        resultado.textContent = "¡Muy bien! ¡Correcto!";
        contenedor.appendChild(resultado);

        const botonContinuar = document.createElement("button");
        botonContinuar.className = "boton-continuar";
        botonContinuar.textContent = "Continuar";
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
        const respuesta = document.createElement("div");
        respuesta.className = "respuesta";
        respuesta.textContent = e.frase;
        contenedor.appendChild(respuesta);

        const resultado = document.createElement("div");
        resultado.className = "mensaje-advertencia";
        resultado.textContent = "No es correcto. Inténtalo de nuevo.";
        contenedor.appendChild(resultado);

        const boton = document.createElement("button");
        boton.className = "boton-reintentar";
        boton.textContent = "Reintentar";
        boton.onclick = reintentarEjercicio;
        contenedor.appendChild(boton);
        return;
    }

    // Inicializar palabras mezcladas (ordenar) una sola vez
    if (estadoApp.palabrasPractica.length === 0) {
        estadoApp.palabrasPractica = [...e.partes.map(p => p.palabra)].sort(
            () => Math.random() - 0.5
        );
    }

    const respuesta = document.createElement("div");
    respuesta.className = "respuesta";
    respuesta.textContent =
        estadoApp.respuestaUsuario.join(" ") || "Selecciona las palabras en orden...";
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

    // Limpiar y añadir barra de navegación
    contenedor.innerHTML = "";
    const barra = crearBarraNavegacion();
    contenedor.appendChild(barra);

    // Progreso
    const progreso = document.createElement("div");
    progreso.className = "progreso";
    progreso.textContent = `Oración ${estadoApp.indiceOracionActual + 1} de ${estadoApp.cantidadOraciones}`;
    contenedor.appendChild(progreso);

    const contador = document.createElement("p");
    contador.textContent = `Intento ${estadoApp.intentos + 1} de ${estadoApp.maxIntentos}`;
    contador.className = "contador-intentos";
    contenedor.appendChild(contador);

    const tipoHueco = configEjercicio?.campoHueco || "palabra que falta...";

    // Parte marcada como hueco
    const parteHueco = e.partes.find(p => p.esHueco);
    const solucion = parteHueco ? parteHueco.palabra : "";

    // Si ya hay respuesta escrita y aún no se ha evaluado, validamos
    if (estadoApp.respuestaUsuario.length > 0 && estadoApp.resultado === null) {
        const respuestaTexto = estadoApp.respuestaUsuario[0];
        // Comparación insensible a mayúsculas/minúsculas
        if (respuestaTexto.toLowerCase() === solucion.toLowerCase()) {
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
        // Mostrar la oración completa correctamente escrita
        const fraseCompletaDiv = document.createElement("div");
        fraseCompletaDiv.className = "frase-explicacion";
        fraseCompletaDiv.textContent = e.frase;
        contenedor.appendChild(fraseCompletaDiv);

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

    // Frase con hueco - usar e.frase y reemplazar la palabra marcada como hueco
    const fraseDiv = document.createElement("div");
    fraseDiv.className = "frase-explicacion";

    let textoConHueco = e.frase;

    if (parteHueco) {  // ← Usar la variable ya declarada arriba
        // Escapar caracteres especiales en la palabra
        const palabraEscapada = parteHueco.palabra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Crear regex para encontrar la palabra completa (case-insensitive)
        const regex = new RegExp('\\b' + palabraEscapada + '\\b', 'i');
        textoConHueco = e.frase.replace(regex, '______');
    }

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
// Práctica de seleccionar opción correcta en la frase
function renderizarPracticaOpcion(contenedor, e, configEjercicio) {
    // Limpiar y añadir barra de navegación
    contenedor.innerHTML = "";
    const barra = crearBarraNavegacion();
    contenedor.appendChild(barra);

    // Progreso
    const progreso = document.createElement("div");
    progreso.className = "progreso";
    progreso.textContent = `Oración ${estadoApp.indiceOracionActual + 1} de ${estadoApp.cantidadOraciones}`;
    contenedor.appendChild(progreso);

    const contador = document.createElement("p");
    contador.textContent = `Intento ${estadoApp.intentos + 1} de ${estadoApp.maxIntentos}`;
    contador.className = "contador-intentos";
    contenedor.appendChild(contador);

    // Si ya hay resultado, mostramos estados finales
    if (estadoApp.resultado === "finalizado") {
        const solucionDiv = document.createElement("div");
        solucionDiv.className = "mensaje-error";
        solucionDiv.innerHTML =
            `Has agotado los ${estadoApp.maxIntentos} intentos.<br>` +
            `La respuesta correcta era:<br><strong>${e.frase}</strong>`;
        contenedor.appendChild(solucionDiv);

        const botonContinuar = document.createElement("button");
        botonContinuar.className = "boton-continuar";
        botonContinuar.textContent = "Continuar";
        botonContinuar.onclick = () => {
            estadoApp.oracionesCompletadas++;
            estadoApp.indiceOracionActual++;
            estadoApp.intentos = 0;
            estadoApp.respuestaUsuario = [];
            estadoApp.resultado = null;
            cargarSiguienteOracion();
        };
        contenedor.appendChild(botonContinuar);
        return;
    }

    if (estadoApp.resultado === "correcto") {
        // Mostrar la oración completada correctamente
        const fraseCompletaDiv = document.createElement("div");
        fraseCompletaDiv.className = "frase-explicacion";
        fraseCompletaDiv.textContent = e.frase;
        contenedor.appendChild(fraseCompletaDiv);

        const resultado = document.createElement("div");
        resultado.className = "mensaje-exito";
        resultado.textContent = "¡Muy bien! Has completado correctamente la oración.";
        contenedor.appendChild(resultado);

        const botonContinuar = document.createElement("button");
        botonContinuar.className = "boton-continuar";
        botonContinuar.textContent = "Continuar";
        botonContinuar.onclick = () => {
            estadoApp.oracionesCompletadas++;
            estadoApp.oracionesCorrectas++;
            estadoApp.indiceOracionActual++;
            estadoApp.intentos = 0;
            estadoApp.respuestaUsuario = [];
            estadoApp.resultado = null;
            cargarSiguienteOracion();
        };
        contenedor.appendChild(botonContinuar);
        return;
    }

    if (estadoApp.resultado === "incorrecto") {
        const resultado = document.createElement("div");
        resultado.className = "mensaje-advertencia";
        resultado.textContent = "Hay algún error. Inténtalo de nuevo.";
        contenedor.appendChild(resultado);
    }

    // ---------- Instrucción ----------
    const instruccion = document.createElement("p");
    instruccion.className = "texto-instruccion";
    instruccion.textContent = "Completa la oración eligiendo la opción correcta.";
    contenedor.appendChild(instruccion);

    // ---------- Frase con huecos ----------
    const fraseDiv = document.createElement("div");
    fraseDiv.className = "frase-explicacion contenedor-oracion-opcion";
    contenedor.appendChild(fraseDiv);

    // Inicializar array de respuestas si hace falta
    if (!Array.isArray(estadoApp.respuestaUsuario) || estadoApp.respuestaUsuario.length !== e.partes.length) {
        estadoApp.respuestaUsuario = new Array(e.partes.length).fill(null);
    }

    e.partes.forEach((p, idxParte) => {
        if (p.opciones && p.correcta) {
            // Es un hueco con opciones
            const gap = document.createElement("span");
            gap.classList.add("gap-opcion");
            gap.dataset.indiceParte = idxParte;
            gap.textContent = estadoApp.respuestaUsuario[idxParte] || "______";
            fraseDiv.appendChild(gap);
            fraseDiv.appendChild(document.createTextNode(" "));
        } else {
            // Es texto fijo
            const spanTexto = document.createElement("span");
            spanTexto.textContent = p.palabra + " ";
            fraseDiv.appendChild(spanTexto);
        }
    });

    // Traducción como ayuda
    if (estadoApp.mostrarAyuda) {
        const traduccionDiv = document.createElement("div");
        traduccionDiv.className = "traduccion-completa";
        traduccionDiv.innerHTML = `<strong>En español</strong>: ${e.traduccion}`;
        contenedor.appendChild(traduccionDiv);
    }

    // ---------- Botones de opciones para cada hueco ----------
    e.partes.forEach((p, idxParte) => {
        if (p.opciones && p.correcta) {
            const contenedorOpciones = document.createElement("div");
            contenedorOpciones.classList.add("contenedor-opciones-opcion");
            contenedorOpciones.dataset.indiceParte = idxParte;

            p.opciones.forEach((opcionTexto, idxOpcion) => {
                const boton = document.createElement("button");
                boton.type = "button";
                boton.classList.add("boton-opcion");

                // Marcar como seleccionado si ya está guardado
                if (estadoApp.respuestaUsuario[idxParte] === opcionTexto) {
                    boton.classList.add("emparejar-seleccionado");
                }

                boton.textContent = opcionTexto;
                boton.dataset.indiceParte = idxParte;
                boton.dataset.indiceOpcion = idxOpcion;

                boton.addEventListener("click", () => {
                    // Deseleccionar todos los botones de ese hueco
                    const hermanos = contenedorOpciones.querySelectorAll(".boton-opcion");
                    hermanos.forEach(b => b.classList.remove("emparejar-seleccionado"));

                    // Seleccionar éste
                    boton.classList.add("emparejar-seleccionado");

                    // Actualizar respuesta del usuario
                    estadoApp.respuestaUsuario[idxParte] = opcionTexto;

                    // Actualizar texto del hueco en la oración
                    const gap = fraseDiv.querySelector(`[data-indice-parte="${idxParte}"]`);
                    if (gap) {
                        gap.textContent = opcionTexto;
                    }
                });

                contenedorOpciones.appendChild(boton);
            });

            contenedor.appendChild(contenedorOpciones);
        }
    });

    // Botón comprobar
    const botonComprobar = document.createElement("button");
    botonComprobar.className = "boton-continuar";
    botonComprobar.textContent = "Comprobar";
    botonComprobar.onclick = () => {
        validarRespuestaOpcion(e);
        renderizar();
    };
    contenedor.appendChild(botonComprobar);
}
// Validar respuesta de opción múltiple
function validarRespuestaOpcion(e) {
    const respuestas = estadoApp.respuestaUsuario;
    let todoCorrecto = true;

    e.partes.forEach((p, idx) => {
        if (p.opciones && p.correcta) {
            const r = respuestas[idx];
            if (!r || r !== p.correcta) {
                todoCorrecto = false;
            }
        }
    });

    if (todoCorrecto) {
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

// Práctica emparejar pregunta
function renderizarPracticaEmparejar(contenedor, e, configEjercicio) {
    // Limpiar y añadir barra de navegación   
    contenedor.innerHTML = "";
    const barra = crearBarraNavegacion();
    contenedor.appendChild(barra);
    let fallos = 0;
    let huboError = false;

    // Progreso
    const progreso = document.createElement("div");
    progreso.className = "progreso";
    progreso.textContent = `Bloque ${estadoApp.indiceOracionActual + 1} de ${estadoApp.cantidadOraciones}`;
    contenedor.appendChild(progreso);

    const contador = document.createElement("p");
    contador.textContent = `Intento ${estadoApp.intentos + 1} de ${estadoApp.maxIntentos}`;
    contador.className = "contador-intentos";
    contenedor.appendChild(contador);

    // Texto de instrucción
    const instruccion = document.createElement("p");
    instruccion.className = "texto-instruccion";
    instruccion.textContent = "Toca una frase de la izquierda y luego su pareja de la derecha.";
    contenedor.appendChild(instruccion);

    const pares = configEjercicio.pares || [];
    if (pares.length === 0) {
        const aviso = document.createElement("div");
        aviso.className = "mensaje-advertencia";
        aviso.textContent = "No hay datos de emparejar para esta lección.";
        contenedor.appendChild(aviso);
        return;
    }

    // Mezclar lados
    const izquierda = [...pares];
    const derecha = [...pares];
    izquierda.sort(() => Math.random() - 0.5);
    derecha.sort(() => Math.random() - 0.5);

    if (typeof estadoApp.emparejarParejasCorrectas !== "number") {
        estadoApp.emparejarParejasCorrectas = 0;
    }

    const layout = document.createElement("div");
    layout.className = "layout-emparejar";
    contenedor.appendChild(layout);

    const colIzq = document.createElement("div");
    colIzq.className = "columna-emparejar";
    const colDer = document.createElement("div");
    colDer.className = "columna-emparejar";

    layout.appendChild(colIzq);
    layout.appendChild(colDer);

    // Estado local
    let seleccionActual = null;
    const emparejados = new Set();
    let contadorPareja = 0;

    function manejarClick(lado, item, boton) {
        if (emparejados.has(item.id)) return;

        // Primer click
        if (!seleccionActual) {
            seleccionActual = { lado, id: item.id, boton };
            boton.classList.add("seleccionado");
            return;
        }

        // Segundo click mismo lado -> reset selección
        if (seleccionActual.lado === lado) {
            seleccionActual.boton.classList.remove("seleccionado");
            seleccionActual = null;
            return;
        }

        // Segundo click lado contrario -> comprobar pareja
        if (seleccionActual.id === item.id) {
            // Correcto
            contadorPareja++;
            let claseColor = "";
            if (contadorPareja === 1) claseColor = "pareja-1";
            else if (contadorPareja === 2) claseColor = "pareja-2";
            else if (contadorPareja === 3) claseColor = "pareja-3";

            seleccionActual.boton.classList.remove("seleccionado");
            seleccionActual.boton.classList.add("correcto", claseColor);
            boton.classList.add("correcto", claseColor);

            emparejados.add(item.id);
            estadoApp.emparejarParejasCorrectas++;

            // ¿Todas las parejas hechas?
            if (emparejados.size === pares.length) {
                estadoApp.resultado = "correcto";
                // Solo sumamos como correcta global si no hubo errores
                if (!huboError) {
                    estadoApp.oracionesCorrectas++;
                }
                mostrarResultadoEmparejarFinal(contenedor, e, fallos, huboError);
                return;
            }
        } else {
            // Incorrecto con control de intentos
            seleccionActual.boton.classList.remove("seleccionado");
            boton.classList.add("incorrecto");
            estadoApp.intentos++;
            fallos++;
            huboError = true;

            if (estadoApp.intentos >= estadoApp.maxIntentos) {
                estadoApp.resultado = "finalizado";
                mostrarResultadoEmparejarFinal(contenedor, e, fallos, huboError);
                return;
            }

            setTimeout(() => {
                boton.classList.remove("incorrecto");
                renderizar();
            }, 600);
        }

        seleccionActual = null;
    }

    // Render columnas
    izquierda.forEach(item => {
        const btn = document.createElement("button");
        btn.className = "boton-emparejar izquierda";
        btn.textContent = item.izq;
        btn.onclick = () => manejarClick("izq", item, btn);
        colIzq.appendChild(btn);
    });

    derecha.forEach(item => {
        const btn = document.createElement("button");
        btn.className = "boton-emparejar derecha";
        btn.textContent = item.der;
        btn.onclick = () => manejarClick("der", item, btn);
        colDer.appendChild(btn);
    });
}


// Resultado final para emparejar (correcto o finalizado)
function mostrarResultadoEmparejarFinal(contenedor, e, fallos = 0, huboError = false) {
    const mensaje = document.createElement("div");

    const intentoUsado = estadoApp.intentos + 1; // intentos empieza en 0

    if (estadoApp.resultado === "correcto") {
        mensaje.className = "mensaje-exito";
        if (!huboError) {
            mensaje.textContent =
                `¡Genial! Has emparejado todas las frases (intento ${intentoUsado}). `;
        } else {
            mensaje.textContent =
                `¡Muy bien! Has completado todas las parejas en el intento ${intentoUsado}. ` +
                `Te has equivocado ${fallos} vez/veces, pero has seguido intentando.`;
        }
    } else {
        mensaje.className = "mensaje-error";
        mensaje.innerHTML =
            `Has agotado los ${estadoApp.maxIntentos} intentos.<br>` +
            `En el próximo ejercicio lo harás mejor, ¡sigue intentándolo!`;
    }
    contenedor.appendChild(mensaje);

    const animos = document.createElement("div");
    animos.className = "texto-instruccion";
    animos.textContent = "¡Vamos a por el siguiente bloque!";
    contenedor.appendChild(animos);

    const botonContinuar = document.createElement("button");
    botonContinuar.className = "boton-continuar";
    botonContinuar.textContent = "Continuar";
    botonContinuar.onclick = () => {
        estadoApp.oracionesCompletadas++;
        estadoApp.indiceOracionActual++;
        estadoApp.intentos = 0;
        estadoApp.emparejarParejasCorrectas = 0;
        cargarSiguienteOracion();
    };
    contenedor.appendChild(botonContinuar);
}


