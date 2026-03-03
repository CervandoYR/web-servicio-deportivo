import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Academia Deportiva'}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

export const welcomeEmailTemplate = (studentName: string, academyName: string): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #3B82F6;">¡Bienvenido a ${academyName}!</h1>
    <p>Hola, <strong>${studentName}</strong></p>
    <p>Nos complace darte la bienvenida a nuestra academia deportiva. Estamos emocionados de tenerte con nosotros.</p>
    <p>En breve, nuestro equipo se pondrá en contacto contigo con todos los detalles de tu programa.</p>
    <hr />
    <p style="color: #6B7280; font-size: 12px;">Este email fue enviado automáticamente por ${academyName}.</p>
  </div>
`;

export const paymentReminderTemplate = (studentName: string, amount: string, dueDate: string): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #F59E0B;">Recordatorio de Pago</h1>
    <p>Hola, <strong>${studentName}</strong></p>
    <p>Te recordamos que tienes un pago pendiente de <strong>$${amount}</strong> con fecha de vencimiento el <strong>${dueDate}</strong>.</p>
    <p>Por favor realiza tu pago a tiempo para mantener tu membresía activa.</p>
    <hr />
    <p style="color: #6B7280; font-size: 12px;">Si ya realizaste el pago, por favor ignora este mensaje.</p>
  </div>
`;
