
class Publicacion {
    constructor(titulo, tipo, contenido) {
        this.titulo = titulo;
        this.tipo = tipo;
        this.contenido = contenido;
        this.fecha = new Date().toLocaleDateString("es-ES");
    }

    mostrar() {
        return `<strong>${this.titulo}</strong> — ${this.contenido} <br> <em>${this.fecha}</em>`;
    }
}

class Campaña {
    constructor(nombre) {
        this.nombre = nombre;
        this.elementos = [];
    }

    agregar(elemento) {
        this.elementos.push(elemento);
    }

    mostrar() {
        let html = `<h4>${this.nombre}</h4>`;
        const recursivo = (elems) => {
            let res = "<ul>";
            elems.forEach(e => {
                if (e instanceof Publicacion) {
                    res += `<li>${e.mostrar()}</li>`;
                } else if (e instanceof Campaña) {
                    res += `<li>${e.mostrar()}</li>`;
                }
            });
            res += "</ul>";
            return res;
        };
        html += recursivo(this.elementos);
        return html;
    }
}


class GestorPublicaciones {
    static instancia;

    constructor() {
        if (GestorPublicaciones.instancia) return GestorPublicaciones.instancia;

        this.publicaciones = [];
        this.campanas = [];
        this.cargar();

        GestorPublicaciones.instancia = this;
    }

    agregarPublicacion(pub) {
        this.publicaciones.push(pub);
        this.guardar();
    }

    agregarCampana(camp) {
        this.campanas.push(camp);
        this.guardar();
    }

    borrarTodo() {
        this.publicaciones = [];
        this.campanas = [];
        this.guardar();
    }

    guardar() {
        localStorage.setItem("publicaciones", JSON.stringify(this.publicaciones));
        localStorage.setItem("campanas", JSON.stringify(this.campanas));
    }

    cargar() {
        const pubs = JSON.parse(localStorage.getItem("publicaciones") || "[]");
        const camps = JSON.parse(localStorage.getItem("campanas") || "[]");

        this.publicaciones = pubs.map(p => Object.assign(new Publicacion(), p));

        this.campanas = camps.map(c => {
            const camp = Object.assign(new Campaña(), c);
            const rec = (elems) => elems.map(e => {
                if (e.titulo) return Object.assign(new Publicacion(), e);
                else return Object.assign(new Campaña(), e);
            });
            camp.elementos = rec(camp.elementos || []);
            return camp;
        });
    }
}

const gestor = new GestorPublicaciones();

function renderPublicaciones(lista = null) {
    const contenedor = document.getElementById("listaPublicaciones");
    contenedor.innerHTML = "";
    const pubs = lista || gestor.publicaciones;

    if (!pubs.length) {
        contenedor.innerHTML = "<p>No hay publicaciones</p>";
        return;
    }

    pubs.forEach(pub => {
        contenedor.innerHTML += `<div class="card">
            <h3>${pub.titulo}</h3>
            <p>${pub.contenido}</p>
            <p><strong>${pub.tipo}</strong></p>
            <p>${pub.fecha}</p>
        </div>`;
    });
}

function renderCampanas() {
    const lista = document.getElementById("listaCampañas");
    lista.innerHTML = "";
    if (!gestor.campanas.length) {
        lista.innerHTML = "<p>No hay campañas</p>";
        return;
    }

    gestor.campanas.forEach((camp, i) => {
        const div = document.createElement("div");
        div.classList.add("card");
        div.innerHTML = `
            <h3>${camp.nombre}</h3>
            <select id="selPub-${i}">
                <option value="">Seleccionar publicacion</option>
                ${gestor.publicaciones.map((p, index) => `<option value="${index}">${p.titulo}</option>`).join("")}
            </select>
            <button data-i="${i}" class="addPubBtn">Añadir publicación</button>
            <button data-i="${i}" class="verBtn">Ver contenido</button>
            <div id="contenido-${i}" style="margin-top:10px;"></div>
        `;
        lista.appendChild(div);
    });

    document.querySelectorAll(".addPubBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            const i = btn.dataset.i;
            const sel = document.getElementById(`selPub-${i}`);
            if (sel.value === "") return;
            const pub = gestor.publicaciones[sel.value];
            gestor.campanas[i].agregar(pub);
            sel.value = "";
            const cont = document.getElementById(`contenido-${i}`);
            if (cont.innerHTML !== "") cont.innerHTML = gestor.campanas[i].mostrar();
            gestor.guardar();
        });
    });

    document.querySelectorAll(".verBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            const i = btn.dataset.i;
            const cont = document.getElementById(`contenido-${i}`);
            cont.innerHTML = gestor.campanas[i].mostrar();
        });
    });
}

document.getElementById("formpubli").addEventListener("submit", e => {
    e.preventDefault();
    const titulo = document.getElementById("nombre").value.trim();
    const contenido = document.getElementById("contenido").value.trim();
    const tipo = document.getElementById("categoria").value;

    gestor.agregarPublicacion(new Publicacion(titulo, tipo, contenido));
    renderPublicaciones();
    renderCampanas();
    e.target.reset();
});

document.getElementById("formCampaña").addEventListener("submit", e => {
    e.preventDefault();
    const nombre = document.getElementById("tituloCampaña").value.trim();
    if (!nombre) return alert("Escribe un nombre de campaña");

    gestor.agregarCampana(new Campaña(nombre));
    renderCampanas();
    e.target.reset();
});

document.getElementById("btnBorrar").addEventListener("click", () => {
    if (!confirm("Seguro de que quieres borrar todo?")) return;
    gestor.borrarTodo();
    renderPublicaciones();
    renderCampanas();
});


document.getElementById("busqueda").addEventListener("input", () => {
    const texto = document.getElementById("busqueda").value.trim().toLowerCase();
    const filtradas = gestor.publicaciones.filter(p =>
        p.titulo.toLowerCase().includes(texto) ||
        p.tipo.toLowerCase().includes(texto)
    );
    renderPublicaciones(filtradas);
});

window.addEventListener("load", () => {
    renderPublicaciones();
    renderCampanas();
});
