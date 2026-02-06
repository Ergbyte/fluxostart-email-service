import express from 'express';
import { Resend } from 'resend';

const app = express();
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.get('/', (req, res) => {
  res.send('FluxoStart Email Service OK');
});

app.post('/enviar-confirmacao', async (req, res) => {
  try {
    console.log('REQ BODY:', req.body);

    const { email, nome, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    //link deve ser atualizado quando o host sofrer upgrade
    const link = `https://fluxostart.infinityfreeapp.com/backend/confirmar.php?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: 'FluxoStart <no-reply@fluxostart.online>',
      to: [email], // 👈 IMPORTANTE: array
      subject: 'Confirme seu cadastro no FluxoStart',
      html: `
        <p>Olá <strong>${nome}</strong>,</p>
        <p>Para confirmar seu cadastro, clique no link abaixo:</p>
        <p><a href="${link}">Confirmar cadastro</a></p>
        <p>Se você não solicitou este cadastro, ignore este e-mail.</p>
      `
    });

    console.log('RESEND DATA:', data);
    console.log('RESEND ERROR:', error);

    if (error) {
      return res.status(500).json({ error });
    }


    res.json({ success: true });
  } catch (error) {
    console.error('ERRO AO ENVIAR EMAIL:', error);
    res.status(500).json({ error: 'Erro ao enviar e-mail' });
  }
});

app.listen(10000, () => {
  console.log('Email service rodando na porta 10000');
});
