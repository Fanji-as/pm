/**
 * Email Service for sending invitation emails using Mailjet
 *
 * This implementation uses Mailjet API to send emails.
 *
 * Environment variables required:
 * - MAIL_SENDER: Sender email address
 * - MAIL_HOST: Mailjet API host (in-v3.mailjet.com)
 * - MAIL_PORT: Mailjet API port (587)
 * - MAIL_USER: Mailjet API Key
 * - MAIL_PASSWORD: Mailjet API Secret
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  // Check if email service is configured
  if (
    !process.env.MAIL_SENDER ||
    !process.env.MAIL_USER ||
    !process.env.MAIL_PASSWORD
  ) {
    console.log(
      "Email Service - Email not configured. Using console output for development:",
    );
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("HTML:", options.html);
    return;
  }

  try {
    // Use Mailjet API to send email
    const authString = process.env.MAIL_USER + ":" + process.env.MAIL_PASSWORD;
    const base64Auth = Buffer.from(authString).toString("base64");

    const response = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + base64Auth,
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: process.env.MAIL_SENDER,
              Name: "PM Project Management",
            },
            To: [
              {
                Email: options.to,
              },
            ],
            Subject: options.subject,
            HTMLPart: options.html,
            TextPart: options.text || "",
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.ErrorMessage || "Failed to send email");
    }

    const result = await response.json();
    console.log("Email sent successfully:", result);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export function generateInvitationEmail(
  projectName: string,
  inviterName: string,
  invitationLink: string,
): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Invitation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #84B179;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #84B179;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Project Invitation</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p><strong>${inviterName}</strong> has invited you to join the project <strong>"${projectName}"</strong>.</p>
          <p>Click the button below to accept the invitation:</p>
          <a href="${invitationLink}" class="button">Accept Invitation</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${invitationLink}</p>
          <p>This invitation will expire in 7 days.</p>
        </div>
        <div class="footer">
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Project Invitation
    
    Hello,
    
    ${inviterName} has invited you to join the project "${projectName}".
    
    Click the link below to accept the invitation:
    ${invitationLink}
    
    This invitation will expire in 7 days.
    
    If you didn't expect this invitation, you can safely ignore this email.
  `;

  return { html, text };
}
