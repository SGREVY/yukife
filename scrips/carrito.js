// ===== DETECTAR PAGO EXITOSO =====
const urlParams = new URLSearchParams(window.location.search);
const status = urlParams.get("redirect_status");

if (status === "succeeded") {

  localStorage.removeItem("carrito");

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

  let elements;

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

      suma += Number(item.precio) || 0;
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
  const stripe = Stripe("pk_live_51T98saIiPSkmlO8n5zNH6qeBMA7nO8CouXHfS6AhBED2632zSiL2nOINlFrVA6QrL6lbQsLmP71YTAnhcaBkintW009SbyMJ7m");

  // 👉 BOTÓN IR A PAGAR
  document.getElementById("pagar").addEventListener("click", async () => {

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
      alert("Carrito vacío");
      return;
    }

    const total = carrito.reduce(
      (acc, item) => acc + (Number(item.precio) || 0),
      0
    );

    console.log("TOTAL:", total);

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

    form.style.display = "block";

    elements = stripe.elements({
      clientSecret: data.clientSecret,
    });

    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");
  });

  // 👉 COMPLETAR PAGO
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