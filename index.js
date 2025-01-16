const amqp = require("amqplib");
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "marcoantonio.desenvolvedor@gmail.com",
    pass: "cktkowbrruenklhy",
  },
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    await transport.sendMail({
      from: "<marcoantonio.desenvolvedor@gmail.com>",
      to,
      subject,
      html,
      text,
    });
    console.log(`E-mail enviado para ${to}`);
  } catch (err) {
    console.error(`Erro ao enviar e-mail para ${to}:`, err);
  }
};

const startConsumer = async () => {
  try {
    const connection = await amqp.connect("amqp://rabbitmq:5672");
    const channel = await connection.createChannel();
    const queue = "email_queue";

    await channel.assertQueue(queue, { durable: true });

    console.log(`Aguardando mensagens na fila: ${queue}`);

    channel.consume(
      queue,
      async (msg) => {
        if (msg) {
          console.log("Mensagem recebida:", msg.content.toString());

          try {
            const emailData = JSON.parse(msg.content.toString());

            if (!emailData.to || !emailData.subject) {
              throw new Error("Mensagem inválida: falta 'to' ou 'subject'");
            }

            await sendEmail(emailData);

            channel.ack(msg);
          } catch (error) {
            console.error("Erro ao processar mensagem:", error);
            channel.nack(msg, false, false);
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Erro ao conectar ao RabbitMQ:", error);
  }
};

startConsumer();
