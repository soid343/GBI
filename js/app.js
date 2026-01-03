// ==// =========================================
// GRAMÁTICA BÁSICA INGLÉS - APP PRINCIPAL
// =========================================

// Estado global de la aplicación
let estadoApp = {
    modoPrincipal: "menu", // "menu" | "lecciones" | "reto" | "records"
    modoJuego: null,       // null = pantalla inicial --> "explicacion" | "practica" | "reto"
    modo: "explicacion",   // explicacion | practica
    tipoPractica: "ordenar", // ordenar | hueco (futuros tipos)
    mostrarAyuda: true,
    ejercicioActual: null,
    categoriaActual: null, // saber qué lección está activa
    oracionesCategoriaActual: [],
    respuestaUsuario: [],
    palabrasPractica: [],
    resultado: null,       // "correcto" | "incorrecto" | "finalizado" | null
    intentos: 0,
    maxIntentos: 3,

    // Propiedades para gestionar múltiples oraciones
    todasLasOraciones: [],
    oracionesSeleccionadas: [],
    indiceOracionActual: 0,
    cantidadOraciones: 0,
    oracionesCompletadas: 0,
    oracionesCorrectas: 0,
    indiceExplicacion: 0,
    tipoExplicacionSeleccionado: null,

    // Datos para el modo Reto
    retoActivo: false,
    retoCantidad: 0, // 3 | 5 | 10
    retoPuntuacion: 0,
    retoAciertos: 0,
    retoFallos: 0,

     // Estado específico para ejercicios especiales
    emparejarSeleccionActual: null,   // {lado: "izq"|"der", id: ...}
    emparejarParejasCorrectas: 0
};

// Inicializar la aplicación al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    estadoApp.modoPrincipal = "menu";
    renderizarMenuPrincipal();
    //cargarDatos();
    //configurarEventosUI();

    const toggleTraduccion = document.getElementById("toggleTraduccion");
    if (toggleTraduccion) {
        toggleTraduccion.addEventListener("change", e => {
            estadoApp.mostrarAyuda = e.target.checked;
            renderizar();
        });
    }

    document.querySelectorAll("input[name='modo']").forEach(radio => {
        radio.addEventListener("change", e => {
            estadoApp.modo = e.target.value;
            estadoApp.respuestaUsuario = [];
            estadoApp.resultado = null;
            estadoApp.palabrasPractica = [];
            estadoApp.intentos = 0;
            estadoApp.indiceExplicacion = 0; // Reseteamos índice de explicación al cambiar de modo
            estadoApp.tipoExplicacionSeleccionado = null;

            // Si cambia a práctica, mostrar selector de cantidad
            if (e.target.value === "practica") {
                mostrarSelectorCantidad();
            } else {
                mostrarSelectorTipoExplicacion();
            }
        });
    });
});

// Iniciar el modo de juego seleccionado
function iniciarModoJuego(modoJuego) {
    estadoApp.modoJuego = modoJuego;
    estadoApp.modo = "explicacion";
    estadoApp.respuestaUsuario = [];
    estadoApp.palabrasPractica = [];
    estadoApp.resultado = null;
    estadoApp.intentos = 0;
    estadoApp.indiceOracionActual = 0;
    estadoApp.oracionesCompletadas = 0;
    estadoApp.oracionesCorrectas = 0;

    const controles = document.getElementById("controlesInternos");
    if (controles) controles.style.display = "block";

    cargarEjercicio();
    renderizar();
}

// Renderizar la interfaz según el estado actual
function renderizar() {
    const toggle = document.querySelector(".toggle");
    if (toggle) {
        if (
            (estadoApp.modo === "explicacion" && estadoApp.tipoExplicacionSeleccionado !== null) ||
            (estadoApp.modo === "practica" && estadoApp.cantidadOraciones > 0)
        ) {
            toggle.style.display = "block";
        } else {
            toggle.style.display = "none";
        }
    }

    // Si no hay modo de juego activo, mostrar menú o lecciones
    if (!estadoApp.modoJuego && estadoApp.modo !== "practica") {
        if (estadoApp.modoPrincipal === "menu") {
            renderizarMenuPrincipal();
            return;
        } else if (estadoApp.modoPrincipal === "lecciones") {
            renderizarInicio();
            return;
        }
        // "reto" y "records" de momento solo muestran alerts en los handlers
    }

    const contenedor = document.getElementById("contenedor");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (estadoApp.modo === "explicacion") {
        // Solo renderizar si se ha seleccionado un tipo
        if (estadoApp.tipoExplicacionSeleccionado !== null) {
            renderizarExplicacion(contenedor);
        } else {
            mostrarSelectorTipoExplicacion();
        }
    } else {
        // modo === "practica"
        renderizarPractica(contenedor);
    }
}

// =======================
// Navegación desde el menú principal
// =======================
function irALecciones() {
    estadoApp.modoPrincipal = "lecciones";
    renderizarInicio(); // reutilizamos pantalla de tarjetas de lecciones
}

function irAReto() {
    estadoApp.modoPrincipal = "reto";
    alert("Próximamente: modo Reto");
}

function irARecords() {
    estadoApp.modoPrincipal = "records";
    alert("Próximamente: récords");
}

// ================================
// Navegación superior (Home/Volver)
// ================================

// Ir al menú principal (botón Home)
function irAlMenuPrincipal() {
    estadoApp.modoPrincipal = "menu";
    estadoApp.modoJuego = null;
    estadoApp.categoriaActual = null;
    estadoApp.tipoExplicacionSeleccionado = null;
    estadoApp.cantidadOraciones = 0;
    estadoApp.oracionesSeleccionadas = [];
    estadoApp.indiceOracionActual = 0;

    const controles = document.getElementById("controlesInternos");
    if (controles) controles.style.display = "none";

    renderizarMenuPrincipal();
}

// Volver a las lecciones de la categoría actual
function volverALecciones() {
    // Mantenemos la categoría actual para que se muestre el listado de oraciones
    estadoApp.modo = "explicacion"; // o practica, según "renderizarInicio"
    estadoApp.modoJuego = null;
    estadoApp.tipoExplicacionSeleccionado = null;
    estadoApp.cantidadOraciones = 0;
    estadoApp.oracionesSeleccionadas = [];
    estadoApp.indiceOracionActual = 0;
    estadoApp.modoPrincipal = "lecciones";

    renderizarInicio();
}

// Función para lanzar el ejercicio de práctica seleccionado
function seleccionarModoPractica(tipo) {
    estadoApp.tipoPractica = tipo; // "ordenar" o "hueco"
    iniciarPracticaLeccion();
}

// IMPORTAR FUNCIONES DE UI Y EXERCISES
// (Se cargan automáticamente por orden de scripts en index.html)




