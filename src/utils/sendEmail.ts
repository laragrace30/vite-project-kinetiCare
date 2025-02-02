import emailjs from "@emailjs/browser";

interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Initialize EmailJS with your public key
emailjs.init("StJ3I0UD5A419lt2r");

export const sendEmail = async ({ to, subject, text, html }: EmailParams): Promise<void> => {
  const serviceId = "service_02mvhtf";
  const templateId = "template_ydb8dle";

  const templateParams = {
    to_email: to,
    subject: subject,
    message: text,
    html_message: html
  };

  try {
    const response = await emailjs.send(serviceId, templateId, templateParams);
    console.log("✅ Email sent successfully!", response);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};