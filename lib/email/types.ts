// Email types

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  text?: string;
}
