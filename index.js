import express from 'express';
import { Resend } from 'resend';

const app = express();
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.get('/', (req, res) => {
  res.send('FluxoStart Email Service OK');
});

/*
|--------------------------------------------------------------------------
| ROTA GENÉRICA PARA ENVIO DE EMAIL
|--------------------------------------------------------------------------
*/

app.post('/enviar-email', async (req, res) => {
  try {
    console.log('REQ BODY:', req.body);

    const {
      email,
      nome,
      assunto,
      titulo,
      mensagem,
      botaoTexto,
      botaoLink
    } = req.body;

    if (!email || !assunto || !mensagem) {
      return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
    }

    const html = `
      <div style="font-family:Arial,sans-serif;padding:20px">
        <h2>${titulo || ''}</h2>
        <p>Olá ${nome || ''},</p>
        <p>${mensagem}</p>

        ${
          botaoLink
            ? `
              <p>
                <a href="${botaoLink}"
                   style="padding:10px 20px;background:#0d6efd;color:#fff;text-decoration:none;border-radius:5px">
                   ${botaoTexto || 'Clique aqui'}
                </a>
              </p>
            `
            : ''
        }

        <p style="font-size:12px;color:#999">
          Se você não solicitou esta ação, ignore este e-mail.
        </p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'FluxoStart <no-reply@fluxostart.online>',
      to: [email],
      subject: assunto,
      html: html
    });

    console.log('RESEND DATA:', data);
    console.log('RESEND ERROR:', error);

    if (error) {
      return res.status(500).json({ error });
    }

    res.status(200).json({ success: true });

  } catch (err) {
    console.error('ERRO AO ENVIAR EMAIL:', err);
    res.status(500).json({ error: 'Erro interno no envio' });
  }
});

/*
|--------------------------------------------------------------------------
| MANTER ROTA ANTIGA PARA COMPATIBILIDADE (opcional)
|--------------------------------------------------------------------------
*/

app.post('/enviar-confirmacao', async (req, res) => {
  try {
    const { email, nome, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const link = `https://fluxostart.infinityfreeapp.com/backend/validar_credenciais.php?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: 'FluxoStart <no-reply@fluxostart.online>',
      to: [email],
      subject: 'Confirme seu cadastro no FluxoStart',
      html: `
        <p>Olá <strong>${nome}</strong>,</p>
        <p>Para confirmar seu cadastro, clique no link abaixo:</p>
        <p><a href="${link}">Confirmar cadastro</a></p>
      `
    });

    if (error) {
      return res.status(500).json({ error });
    }

    res.status(200).json({ success: true });

  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar confirmação' });
  }
});

app.listen(10000, () => {
  console.log('Email service rodando na porta 10000');
});