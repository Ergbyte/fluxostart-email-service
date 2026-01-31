const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check (Render usa isso)
app.get('/', (req, res) => {
  res.send('FluxoStart Email Service OK');
});

// Endpoint para envio de e-mail de confirmação
app.post('/send-confirmation', async (req, res) => {
  const { email, nome, token } = req.body;

  if (!email || !nome || !token) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const link = `https://fluxostart.infinityfreeapp.com/backend/confirmar.php?token=${token}`;

    await transporter.sendMail({
      from: `"FluxoStart" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Confirme seu cadastro - FluxoStart',
      html: `
        <h2>Olá, ${nome}!</h2>
        <p>Para confirmar sua conta, clique no link abaixo:</p>
        <p><a href="${link}">Confirmar cadastro</a></p>
        <p>Se você não solicitou esse cadastro, ignore este e-mail.</p>
      `,
      text: `
Olá, ${nome}

Confirme sua conta acessando o link abaixo:
${link}

Se você não solicitou esse cadastro, ignore este e-mail.
      `
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao enviar e-mail' });
  }
});

// Porta dinâmica do Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Email service rodando na porta', PORT);
});
