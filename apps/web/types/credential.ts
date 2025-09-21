// Client-side credential types (without Prisma dependencies)
export enum CredentialType {
  TELEGRAM_BOT = 'TELEGRAM_BOT',
  GEMINI_API = 'GEMINI_API',
  RESEND_EMAIL = 'RESEND_EMAIL',
  OPENAI_API = 'OPENAI_API',
  WEBHOOK_URL = 'WEBHOOK_URL',
  HTTP_BASIC_AUTH = 'HTTP_BASIC_AUTH',
  API_KEY = 'API_KEY',
  OAUTH2 = 'OAUTH2',
  CUSTOM = 'CUSTOM',
}

export interface Credential {
  id: string;
  name: string;
  type: CredentialType;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
