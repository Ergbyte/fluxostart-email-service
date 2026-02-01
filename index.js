import express from 'express';
import nodemailer from 'nodemailer';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('FluxoStart Email Service OK');
});

app.post('/enviar-confirmacao', async (req, res) => {
  console.log('REQ BODY:', req.body);

  const { email, nome, token } = req.body;

  if (!email || !token) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  const link = `https://fluxostart.infinityfreeapp.com/backend/confirmar.php?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: 'FluxoStart <no-reply@fluxostart.com>',
    to: email,
    subject: 'Confirme seu cadastro',
    text: `Olá ${nome}, confirme aqui: ${link}`,
    html: `<p>Olá ${nome},</p><p><a href="${link}">Confirmar cadastro</a></p>`
  });

  res.json({ success: true });
});

app.listen(10000, () => {
  console.log('Email service rodando na porta 10000');
});
