class Pokemon {
    constructor(nombre, nivel, Tipo) {
        this.nombre = nombre;
        this.nivel = Number(nivel);
        this.Tipo = Tipo;
        this.fecha = new Date().toLocaleDateString("es-ES");
    }
}

class PokemonManager {
    constructor() {
        if (PokemonManager.instance) return PokemonManager.instance;
        this.listaPokemons = JSON.parse(localStorage.getItem("listaPokemons")) || [];
        PokemonManager.instance = this;
    }

    agregar(pokemon) {
        this.listaPokemons.push(pokemon);
        this.guardar();
    }

    borrarTodos() {
        this.listaPokemons = [];
        this.guardar();
    }

    guardar() {
        localStorage.setItem("listaPokemons", JSON.stringify(this.listaPokemons));
    }
}

const DOMFacade = {
    contenedor: document.getElementById("lista-pokemon"),
    estadFuego: document.getElementById("estad-fuego"),
    estadAgua: document.getElementById("estad-agua"),
    estadPlanta: document.getElementById("estad-planta"),

    //funcion ver lista
    mostrarLista(lista) {
        this.contenedor.innerHTML = "";
        if (lista.length === 0) {
            this.contenedor.innerHTML = "<p>No se han encontrado Pokemons</p>";
            return;
        }
        lista.forEach(p => {
            const div = document.createElement("div");
            div.classList.add("poke");
            div.innerHTML = `
            <h4 class="rojo">${p.nombre}</h4>
                <p><strong>Tipo:</strong> ${p.Tipo}</p>
                <p><strong>Nivel:</strong> ${p.nivel}</p>
                <p><strong>Capturado:</strong> ${p.fecha}</p>
            `;
            this.contenedor.appendChild(div);
        });
    },

    //funcion ver estadisticas
    mostrarEstadisticas(lista) {
        const tipos = ["Fuego", "Agua", "Planta"];

        for (let i = 0; i < tipos.length; i++) {
            const tipo = tipos[i];

            let sumaNiveles = 0;
            let cantidad = 0;

            for (let j = 0; j < lista.length; j++) {
                const pokemon = lista[j];
                if (pokemon.Tipo === tipo) {
                    sumaNiveles += pokemon.nivel;
                    cantidad++;
                }
            }

            let promedio = 0;
            if (cantidad > 0) {
                promedio = (sumaNiveles / cantidad).toFixed(2);
            }

            this["estad" + tipo].textContent = tipo + ": " + promedio;
        }
    }
}

const manager = new PokemonManager();
//formulario añadir pokemon
const form = document.getElementById("form-pokemon");
form.addEventListener("submit", e => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value.trim();
    const nivel = document.getElementById("nivel").value.trim();
    const Tipo = document.getElementById("Tipo").value.trim();
    manager.agregar(new Pokemon(nombre, nivel, Tipo));
    DOMFacade.mostrarLista(manager.listaPokemons);
    form.reset();
});

// Boton de estadisticas
const btnEstadisticas = document.getElementById("btn-estadisticas");
btnEstadisticas.addEventListener("click", () => {
    DOMFacade.mostrarEstadisticas(manager.listaPokemons);
});

//Boton de borrar
document.getElementById("btn-borrar").addEventListener("click", () => {
    manager.borrarTodos();
    DOMFacade.mostrarLista(manager.listaPokemons);
    DOMFacade.mostrarEstadisticas(manager.listaPokemons);
});

//filtro de busqueda
document.getElementById("filtro").addEventListener("input", () => {
    const texto = document.getElementById("filtro").value.trim().toLowerCase();
    const filtrados = manager.listaPokemons.filter(p =>
        p.nombre.toLowerCase().includes(texto) ||
        p.Tipo.toLowerCase().includes(texto)
    );
    DOMFacade.mostrarLista(filtrados);
});

window.addEventListener("load", () => {
    DOMFacade.mostrarLista(manager.listaPokemons);
});
