require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ===== CREATE PAYMENT INTENT =====
app.post('/create-payment-intent', async (req, res) => {
  try {

    let amount = Number(req.body.amount);

    console.log("Amount recibido (pesos):", amount);

    // VALIDACIÓN FUERTE
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    // CONVERTIR A CENTAVOS
    const amountInCents = Math.round(amount * 100);

    console.log("Amount en centavos:", amountInCents);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'mxn',

      // 🔥 IMPORTANTE PARA PAYMENT ELEMENT
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("PaymentIntent creado:", paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error("❌ ERROR STRIPE:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// ===== SERVER =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});