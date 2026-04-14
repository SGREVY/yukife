// ===== DETECTAR PAGO EXITOSO =====
const urlParams = new URLSearchParams(window.location.search);
const status = urlParams.get("redirect_status");

if (status === "succeeded") {

  // vaciar carrito
  localStorage.removeItem("carrito");

  // mostrar mensaje
  document.body.innerHTML = `
    <div style="text-align:center; margin-top:100px;">
      <h1>✅ Pago completado</h1>
      <p>Gracias por tu compra</p>
      <a href="index.html">
        <button>Volver a la tienda</button>
      </a>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {

  // ===== CARRITO =====
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  const lista = document.getElementById("lista");
  const totalEl = document.getElementById("total");
  const form = document.getElementById("payment-form");

  let elements; // 👈 IMPORTANTE para Stripe

  // ===== RENDER =====
  function render() {
    lista.innerHTML = "";
    let suma = 0;

    carrito.forEach((item, index) => {
      const li = document.createElement("li");

      li.innerHTML = `
        ${item.nombre} - $${item.precio}
        <button onclick="eliminar(${index})">🗑️</button>
      `;

      lista.appendChild(li);
      suma += item.precio;
    });

    totalEl.textContent = suma;
  }

  // ===== ELIMINAR =====
  window.eliminar = function(index) {
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    render();
  };

  render();

  // ===== STRIPE =====
  const stripe = Stripe("pk_test_51T98siIvjB5ba2SD0pHagoipC5prORvkqJQgtrhwRTeAfIs95BYFrIANeu8L4mG8bZpeRCjj4X2HANsf4BAgpcyg005tvR55Qg");

  // 👉 BOTÓN IR A PAGAR
  document.getElementById("pagar").addEventListener("click", async () => {

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
      alert("Carrito vacío");
      return;
    }

    const total = Number(
      carrito.reduce((acc, item) => acc + item.precio, 0)
    );

    const res = await fetch("https://yukibe2.onrender.com/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ amount: total })
    });

    const data = await res.json();

    if (!data.clientSecret) {
      alert("Error creando pago");
      return;
    }

    // 👇 mostrar formulario
    form.style.display = "block";

    elements = stripe.elements({
      clientSecret: data.clientSecret,
    });

    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");
  });

  // 👉 BOTÓN COMPLETAR PAGO
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
    });

    if (error) {
      alert(error.message);
    }
  });

});