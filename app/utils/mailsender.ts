interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async ({ to, subject, html, text }: SendEmailOptions) => {
  try {
    // Basic parsing for EMAIL_FROM if it looks like "Name <email@domain.com>"
    let senderName = "Dream Jobs";
    let senderEmail = "no-reply@dreamjobs.com";
    
    const emailFromEnv = process.env.EMAIL_FROM;
    if (emailFromEnv) {
      const match = emailFromEnv.match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/);
      if (match) {
        if (match[1]) senderName = match[1].trim();
        if (match[2]) senderEmail = match[2].trim();
      } else {
        senderEmail = emailFromEnv.trim();
      }
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY as string,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        ...(text ? { textContent: text } : {}),
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Brevo API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log("Message sent: %s", data.messageId);
    return data;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};
