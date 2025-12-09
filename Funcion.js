// ================= CONFIGURACIÓN API (EN MEMORIA) ======================
let API_URL = "http://localhost:8080"; // URL por defecto

function guardarApi() {
    const url = document.getElementById("apiUrlInput").value.trim();
    const msg = document.getElementById("serverMsg");

    if (!url.startsWith("http")) {
        msg.textContent = "URL inválida";
        msg.style.color = "red";
        return;
    }

    API_URL = url;
    msg.textContent = "Servidor configurado correctamente ✓";
    msg.style.color = "green";
}

// Cuando cargue la página, poner el valor actual en el input si existe
window.onload = () => {
    const input = document.getElementById("apiUrlInput");
    if (input && API_URL) {
        input.value = API_URL;
    }
};


//================= PANTALLAS =====================

// Mostrar Registrar
document.getElementById("btnToRegister")?.addEventListener("click", function () {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("registerScreen").classList.remove("hidden");
});

// Volver al Login
document.getElementById("btnBackLogin")?.addEventListener("click", function () {
  document.getElementById("registerScreen").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
});



//================= REGISTRAR USUARIO =====================
document.getElementById("btnRegister")?.addEventListener("click", async function () {

  if (!API_URL) {
    alert("⚠ Primero debes configurar el servidor.");
    return;
  }

  const nombre = document.getElementById("regUser").value.trim();
  const pass1 = document.getElementById("regPass").value.trim();
  const pass2 = document.getElementById("regPass2").value.trim();
  const msg = document.getElementById("regMsg");

  msg.textContent = "";

  if (!nombre || !pass1 || !pass2) {
    msg.textContent = "Todos los campos son obligatorios.";
    msg.style.color = "red";
    return;
  }

  if (pass1 !== pass2) {
    msg.textContent = "Las contraseñas no coinciden.";
    msg.style.color = "red";
    return;
  }

  const usuario = { nombre: nombre, contrasena: pass1 };

  try {
    const response = await fetch(API_URL + "/api/usuarios/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario)
    });

    const data = await response.json();

    msg.textContent = data.mensaje || "Registrado correctamente";
    msg.style.color = "green";

    setTimeout(() => {
      document.getElementById("registerScreen").classList.add("hidden");
      document.getElementById("loginScreen").classList.remove("hidden");
    }, 1200);

  } catch (error) {
    msg.textContent = "Ocurrió un error al registrar.";
    msg.style.color = "red";
  }
});


//================= LOGIN =====================

function login() {

    if (!API_URL) {
        alert("⚠ Primero debes guardar la URL del servidor");
        return;
    }

    const nombre = document.getElementById("loginUser").value.trim();
    const contrasena = document.getElementById("loginPass").value.trim();
    const msg = document.getElementById("loginMsg");

    msg.textContent = "";

    if (!nombre || !contrasena) {
        msg.textContent = "Todos los campos son obligatorios.";
        msg.style.color = "red";
        return;
    }

    fetch(API_URL + "/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre, contrasena: contrasena })
    })
    .then(response => response.json())
    .then(data => {
        msg.textContent = data.mensaje;
        msg.style.color = data.mensaje.startsWith("Inicio") ? "green" : "red";

        if (data.mensaje.startsWith("Inicio de sesión exitoso")) {
            window.location.href = "dulceria.html";
        }
    })
    .catch(error => {
        console.error(error);
        msg.textContent = "Ocurrió un error en el servidor.";
        msg.style.color = "red";
    });
}

// ================= API DULCES ======================

async function apiGetDulces() {
	const res = await fetch(`${API_URL}/api/dulce/listar`);
	return res.ok ? res.json() : [];
}

async function apiAddDulce(dulce) {
	const res = await fetch(`${API_URL}/api/dulce/registrar`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(dulce)
	});

	return res.ok ? res.json() : null;
}

async function apiDeleteDulce(nombre) {
	await fetch(`${API_URL}/api/dulce/eliminar/nombre/${nombre}`, {
		method: "DELETE"
	});
}

async function apiUpdateDulce(id, dulce) {
	const res = await fetch(`${API_URL}/api/dulce/actualizar/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(dulce)
	});

	return res.ok ? res.json() : null;
}


async function apiVentaCarrito(carrito) {
	const res = await fetch(`${API_URL}/ventas/generar`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(carrito)
	});

	return res.ok ? res.json() : null;
}

function cerrarSesion() {
    window.location.href = "login.html";
}


let dulces = [];
let carrito = [];

const mainScreen = document.getElementById('mainScreen');
const btnInicio = document.getElementById('btnInicio');
const btnAgregar = document.getElementById('btnAgregar');
const btnInventario = document.getElementById('btnInventario');
const btnVentas = document.getElementById('btnVentas');
const contentArea = document.getElementById('contentArea');

// ========================
//    PANTALLAS BÁSICAS
// ========================
function renderInicio() {
	contentArea.innerHTML = `
    <h2>Bienvenido a Dulceria Kawaii 🍬</h2>
  `;
}

function renderAgregar() {
	contentArea.innerHTML = `
    <h2>Agregar nuevo dulce</h2>
    <button class="btn primary" id="openAddModal">Agregar</button>
    <p id="msgAdd"></p>
  `;

	document.getElementById("openAddModal").onclick = openAddModal;
}

function openAddModal() {
	const overlay = document.createElement("div");
	overlay.classList = "modal-overlay";
	overlay.id = "modalOverlay";

	const modal = document.createElement("div");
	modal.classList = "modal";
	modal.id = "addModal";

	modal.innerHTML = `
    <h3>Agregar Dulce</h3>
    <input id="nombre_dulce" placeholder="Nombre">
    <input id="precio_dulce" type="number" step="0.01" placeholder="Precio">
    <input id="marca_dulce" placeholder="Marca">
    <input id="cantidad_dulce" type="number" placeholder="Cantidad">
    <button id="confirmAdd">Agregar</button>
    <button id="cancelAdd">Cancelar</button>
    <p id="addMsg"></p>
  `;

	document.body.append(overlay, modal);

	document.getElementById("cancelAdd").onclick = closeModal;
	document.getElementById("confirmAdd").onclick = confirmAddDulce;
}

function closeModal() {
	document.getElementById("addModal")?.remove();
	document.getElementById("modalOverlay")?.remove();
}

async function confirmAddDulce() {
	const dulce = {
		nombre: document.getElementById("nombre_dulce").value,
		precio: parseFloat(document.getElementById("precio_dulce").value),
		marca: document.getElementById("marca_dulce").value,
		cantidad: parseInt(document.getElementById("cantidad_dulce").value)
	};

	const addMsg = document.getElementById("addMsg");

	if (!dulce.nombre || isNaN(dulce.precio) || !dulce.marca || isNaN(dulce.cantidad)) {
		addMsg.textContent = "Completa todos los campos";
		return;
	}

	const result = await apiAddDulce(dulce);

	addMsg.textContent = result ? "Dulce agregado!" : "Error al agregar";
}

// ========================
//       INVENTARIO
// ========================
async function cargarInventario() {
	dulces = await apiGetDulces();
}

function renderInventario() {
	let html = `<h2>Inventario</h2>` +
		`<div class="table-wrap"><table>
     <thead><tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Marca</th><th>Cantidad</th><th>Acción</th></tr></thead>
     <tbody>`;

	dulces.forEach(d => {
		html += `
      <tr>
        <td>${d.id_dulce}</td>

        <td><input value="${d.nombre}" data-id="${d.id_dulce}" data-field="nombre" onkeydown="actualizaCampo(event)" /></td>
        <td><input type="number" value="${d.precio}" data-id="${d.id_dulce}" data-field="precio" onkeydown="actualizaCampo(event)" /></td>
        <td><input value="${d.marca}" data-id="${d.id_dulce}" data-field="marca" onkeydown="actualizaCampo(event)" /></td>
        <td><input type="number" value="${d.cantidad}" data-id="${d.id_dulce}" data-field="cantidad" onkeydown="actualizaCampo(event)" /></td>

        <td><button onclick="eliminarDulce('${d.nombre}')">Eliminar</button></td>
      </tr>`;
	});

	html += `</tbody></table></div>`;
	contentArea.innerHTML = html;
}


window.eliminarDulce = async (nombre) => {
	await apiDeleteDulce(nombre);
	await cargarInventario();
	renderInventario();
};

async function actualizaCampo(event) {
	if (event.key !== "Enter") return;

	const input = event.target;

	const id = input.getAttribute("data-id");
	const campo = input.getAttribute("data-field");
	const valor = input.value;

	// buscamos el dulce original
	let dulce = dulces.find(d => d.id_dulce == id);

	if (!dulce) return;

	// actualizamos el valor modificado
	dulce = { ...dulce, [campo]: valor };

	// enviamos a API
	const resultado = await apiUpdateDulce(id, dulce);

	if (resultado) {
		alert("Actualizado correctamente ✔");

		// recargar inventario y mostrarlo
		await cargarInventario();
		renderInventario();
	} else {
		alert("Error al actualizar ❌");
	}
}

if (btnInicio) btnInicio.onclick = renderInicio;
if (btnAgregar) btnAgregar.onclick = renderAgregar;
if (btnInventario) btnInventario.onclick = () => {
	cargarInventario().then(renderInventario);
};
if (btnVentas) btnVentas.onclick = renderVentas;

// PANTALLA DE VENTAS
function renderVentas() {
	contentArea.innerHTML = `
    <h2>Ventas</h2>

    <h3>Selecciona un producto</h3>

    <!-- SELECT PRODUCTO -->
    <select id="selectProducto" class="select-ventas">
      <option value="">-- Selecciona un dulce --</option>
      ${dulces.map(d => `
        <option value="${d.id_dulce}">
          ${d.nombre} | $${d.precio} | Stock: ${d.cantidad}
        </option>
      `).join("")}
    </select>

    <!-- SELECT CANTIDAD -->
    <select id="selectCantidad" class="select-ventas">
      <option value="">-- Cantidad --</option>
    </select>

    <button id="btnAgregarCarrito" class="btn primary">Agregar al carrito</button>

    <div class="ventas-flex">

      <!-- CARRITO IZQ -->
      <div class="carrito-card-rosa">
        <h3>🛒 Carrito actual</h3>
        <div id="carritoArea"></div>

        <h3>Totales</h3>
        <p id="subtotalTxt">Subtotal: $0.00</p>
        <p id="ivaTxt">IVA (16%): $0.00</p>
        <p id="totalTxt">Total: $0.00</p>

        <button id="btnProcesarVenta" class="btn primary">Procesar Venta</button>
        <p id="ventaMsg"></p>
      </div>

      <!-- TICKET DER -->
      <div class="ticket-card-rosa">
        <h3>🧾 Ticket</h3>
        <div id="ticketArea"></div>
      </div>

    </div>
  `;

	renderCarrito();
	actualizarTotales();

	document.getElementById("btnProcesarVenta").onclick = procesarVenta;

	// Eventos
	document.getElementById("btnAgregarCarrito").onclick = agregarDesdeSelect;
	document.getElementById("selectProducto").onchange = cargarCantidades;
}


function agregarDesdeSelect() {
	const id = parseInt(document.getElementById("selectProducto").value);
	const cantidad = parseInt(document.getElementById("selectCantidad").value);

	if (!id || !cantidad) return;

	const dulce = dulces.find(d => d.id_dulce === id);
	if (!dulce) return;

	const existente = carrito.find(c => c.id_dulce === id);

	if (existente) {
		existente.cantidad += cantidad;
	} else {
		carrito.push({
			id_dulce: dulce.id_dulce,
			nombre: dulce.nombre,
			precio: dulce.precio,
			cantidad: cantidad
		});
	}

	renderCarrito();
	actualizarTotales();

	// limpiar selects
	document.getElementById("selectProducto").value = "";
	document.getElementById("selectCantidad").innerHTML = `<option value="">-- Cantidad --</option>`;
}


function cargarCantidades() {
	const id = parseInt(document.getElementById("selectProducto").value);
	const selectCantidad = document.getElementById("selectCantidad");

	selectCantidad.innerHTML = `<option value="">-- Cantidad --</option>`;

	if (!id) return;

	const dulce = dulces.find(d => d.id_dulce === id);
	if (!dulce) return;

	for (let i = 1; i <= dulce.cantidad; i++) {
		selectCantidad.innerHTML += `<option value="${i}">${i}</option>`;
	}
}




function renderTablaVentas() {
	let html = `
    <h3>Selecciona productos</h3>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Marca</th><th>Cantidad</th><th>Agregar</th></tr>
        </thead>
        <tbody>
  `;

	dulces.forEach(d => {
		html += `
      <tr>
        <td>${d.id_dulce}</td>
        <td>${d.nombre}</td>
        <td>$${d.precio.toFixed(2)}</td>
        <td>${d.marca}</td>
        <td>${d.cantidad}</td>
        <td><button onclick="agregarAlCarrito(${d.id_dulce})">Agregar</button></td>
      </tr>
    `;
	});

	html += `</tbody></table></div>`;

	return html;
}

window.agregarAlCarrito = (id_dulce) => {
	const dulce = dulces.find(d => d.id_dulce === id_dulce);
	if (!dulce) return;

	const existente = carrito.find(c => c.id_dulce === id_dulce);

	if (existente) {
		existente.cantidad += 1;
	} else {
		carrito.push({
			id_dulce: dulce.id_dulce,
			nombre: dulce.nombre,
			precio: dulce.precio,
			cantidad: 1
		});
	}

	renderCarrito();
	actualizarTotales();
};

// Mostrar carrito
function renderCarrito() {
	const div = document.getElementById("carritoArea");
	if (!div) return;

	if (carrito.length === 0) {
		div.innerHTML = "<p>Carrito vacío</p>";
		return;
	}

	let html = "";
	carrito.forEach(c => {
		html += `<p>${c.nombre} x${c.cantidad} - $${(c.cantidad * c.precio).toFixed(2)}</p>`;
	});

	div.innerHTML = html;
}


// PROCESAR VENTA
async function procesarVenta() {
	const ventaMsg = document.getElementById("ventaMsg");

	if (carrito.length === 0) {
		ventaMsg.textContent = "El carrito está vacío";
		return;
	}

	const resultado = await apiVentaCarrito(carrito);

	if (!resultado) {
		ventaMsg.textContent = "Error al procesar la venta";
		return;
	}

	ventaMsg.textContent = "Venta realizada correctamente";

	carrito = [];
	renderCarrito();
	mostrarTicket(resultado);
}

// MOSTRAR TICKET EN PANTALLA
function mostrarTicket(data) {
	const ticketDiv = document.getElementById("ticketArea");

	ticketDiv.innerHTML = `
    <p><strong>Ticket - Dulcería Kawaii</strong></p>
    <p>${new Date().toLocaleString()}</p>
    <hr>
    ${data.detalles
			.map(
				d =>
					`<p>${d.dulce.nombre} x${d.cantidadVendida} - $${(
						d.precioUnitario * d.cantidadVendida
					).toFixed(2)}</p>`
			)
			.join("")}
    <hr>
    <p>Subtotal: $${(data.total / 1.16).toFixed(2)}</p>
    <p>IVA (16%): $${(data.total - data.total / 1.16).toFixed(2)}</p>
    <h3>Total: $${data.total.toFixed(2)}</h3>
  `;
}

function actualizarTotales() {
	let subtotal = carrito.reduce((s, c) => s + c.precio * c.cantidad, 0);
	let iva = subtotal * 0.16;
	let total = subtotal + iva;

	document.getElementById("subtotalTxt").textContent = `Subtotal: $${subtotal.toFixed(2)}`;
	document.getElementById("ivaTxt").textContent = `IVA (16%): $${iva.toFixed(2)}`;
	document.getElementById("totalTxt").textContent = `Total: $${total.toFixed(2)}`;
}
