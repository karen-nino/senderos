import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const DESTINATION_EMAIL = "reservas@senderosdechiapas.com.mx";

const LIMITS = {
  name: { max: 100, min: 2 },
  subject: { max: 200, min: 2 },
  message: { max: 2000, min: 10 },
} as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Record<"name" | "email" | "subject" | "message", string | undefined>;

function validate(body: Record<string, unknown>): { errors: FieldErrors } {
  const { name, email, subject, message } = body;
  const errors: FieldErrors = { name: undefined, email: undefined, subject: undefined, message: undefined };

  const nameStr = typeof name === "string" ? name.trim() : "";
  if (!nameStr) errors.name = "El nombre es obligatorio.";
  else if (nameStr.length < LIMITS.name.min) errors.name = `El nombre debe tener al menos ${LIMITS.name.min} caracteres.`;
  else if (nameStr.length > LIMITS.name.max) errors.name = `El nombre no puede superar ${LIMITS.name.max} caracteres.`;

  const emailStr = typeof email === "string" ? email.trim() : "";
  if (!emailStr) errors.email = "El email es obligatorio.";
  else if (!EMAIL_REGEX.test(emailStr)) errors.email = "Introduce un email válido.";
  else if (emailStr.length > 254) errors.email = "El email no es válido.";

  const subjectStr = typeof subject === "string" ? subject.trim() : "";
  if (!subjectStr) errors.subject = "El asunto es obligatorio.";
  else if (subjectStr.length < LIMITS.subject.min) errors.subject = `El asunto debe tener al menos ${LIMITS.subject.min} caracteres.`;
  else if (subjectStr.length > LIMITS.subject.max) errors.subject = `El asunto no puede superar ${LIMITS.subject.max} caracteres.`;

  const messageStr = typeof message === "string" ? message.trim() : "";
  if (!messageStr) errors.message = "El mensaje es obligatorio.";
  else if (messageStr.length < LIMITS.message.min) errors.message = `El mensaje debe tener al menos ${LIMITS.message.min} caracteres.`;
  else if (messageStr.length > LIMITS.message.max) errors.message = `El mensaje no puede superar ${LIMITS.message.max} caracteres.`;

  return { errors };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, website } = body;

    // Honeypot: si un bot rellena este campo oculto, no enviamos
    if (website) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const { errors } = validate(body);
    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const nameStr = String(name).trim();
    const emailStr = String(email).trim();
    const subjectStr = String(subject).trim();
    const messageStr = String(message).trim();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY no está configurada.");
      return NextResponse.json(
        { error: "El envío de correo no está configurado. Contacta al administrador." },
        { status: 500 }
      );
    }

    const html = `
      <h2>Nuevo mensaje desde el formulario de contacto</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(nameStr)}</p>
      <p><strong>Email:</strong> ${escapeHtml(emailStr)}</p>
      <p><strong>Asunto:</strong> ${escapeHtml(subjectStr)}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${escapeHtml(messageStr).replace(/\n/g, "<br>")}</p>
      <hr>
      <p><small>Enviado desde Senderos de Chiapas - Formulario de contacto</small></p>
    `;

    const { data, error } = await resend.emails.send({
      from: "Senderos de Chiapas <onboarding@resend.dev>",
      to: [DESTINATION_EMAIL],
      replyTo: emailStr,
      subject: `[Contacto] ${subjectStr.slice(0, 80)}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "No se pudo enviar el mensaje. Intenta de nuevo más tarde." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id }, { status: 200 });
  } catch (e) {
    console.error("Contact API error:", e);
    return NextResponse.json(
      { error: "Error al procesar tu mensaje. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m] ?? m);
}
