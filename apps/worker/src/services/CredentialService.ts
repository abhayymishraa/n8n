import { CredentialType } from "@repo/database";

export interface CredentialData {
  [key: string]: any;
}

export interface AuthenticatedRequest {
  url: string;
  headers: Record<string, string>;
  body?: any;
  method?: string;
}

export class CredentialService {
  /**
   * Get authentication headers for a given credential
   */
  static getAuthHeaders(credentialType: CredentialType, credentialData: CredentialData): Record<string, string> {
    switch (credentialType) {
      case CredentialType.TELEGRAM_BOT:
        return {
          'Authorization': `Bearer ${credentialData.token}`,
        };

      case CredentialType.RESEND_EMAIL:
        return {
          'Authorization': `Bearer ${credentialData.apiKey}`,
          'Content-Type': 'application/json',
        };

      case CredentialType.GEMINI_API:
        return {
          'Content-Type': 'application/json',
        };

      case CredentialType.OPENAI_API:
        return {
          'Authorization': `Bearer ${credentialData.apiKey}`,
          'Content-Type': 'application/json',
        };

      case CredentialType.HTTP_BASIC_AUTH:
        const basicAuth = Buffer.from(`${credentialData.username}:${credentialData.password}`).toString('base64');
        return {
          'Authorization': `Basic ${basicAuth}`,
        };

      case CredentialType.API_KEY:
        return {
          [credentialData.headerName || 'Authorization']: credentialData.apiKey,
        };

      case CredentialType.OAUTH2:
        // For OAuth2, we would need to handle token refresh
        // This is a simplified version - in production, you'd want to store and refresh tokens
        return {
          'Authorization': `Bearer ${credentialData.accessToken}`,
        };

      case CredentialType.WEBHOOK_URL:
        return {
          'Content-Type': 'application/json',
        };

      case CredentialType.CUSTOM:
        return credentialData.headers || {};

      default:
        return {};
    }
  }

  /**
   * Get the base URL for API calls (for services that need it)
   */
  static getBaseUrl(credentialType: CredentialType, credentialData: CredentialData): string {
    switch (credentialType) {
      case CredentialType.TELEGRAM_BOT:
        return `https://api.telegram.org/bot${credentialData.token}`;

      case CredentialType.RESEND_EMAIL:
        return 'https://api.resend.com';

      case CredentialType.GEMINI_API:
        return `https://generativelanguage.googleapis.com/v1beta`;

      case CredentialType.OPENAI_API:
        return 'https://api.openai.com/v1';

      case CredentialType.WEBHOOK_URL:
        return credentialData.url;

      default:
        return '';
    }
  }

  /**
   * Prepare a request with authentication
   */
  static prepareRequest(
    credentialType: CredentialType,
    credentialData: CredentialData,
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): AuthenticatedRequest {
    const baseUrl = this.getBaseUrl(credentialType, credentialData);
    const fullUrl = baseUrl ? `${baseUrl}${endpoint}` : endpoint;
    const headers = this.getAuthHeaders(credentialType, credentialData);

    // Add query parameters for API key based services
    let finalUrl = fullUrl;
    if (credentialType === CredentialType.GEMINI_API) {
      const url = new URL(fullUrl);
      url.searchParams.set('key', credentialData.apiKey);
      finalUrl = url.toString();
    }

    return {
      url: finalUrl,
      headers,
      body,
      method,
    };
  }

  /**
   * Test a credential by making a simple API call
   */
  static async testCredential(credentialType: CredentialType, credentialData: CredentialData): Promise<{ success: boolean; message: string }> {
    try {
      switch (credentialType) {
        case CredentialType.TELEGRAM_BOT:
          const telegramRequest = this.prepareRequest(credentialType, credentialData, '/getMe');
          const telegramResponse = await fetch(telegramRequest.url, {
            method: telegramRequest.method,
            headers: telegramRequest.headers,
          });
          return {
            success: telegramResponse.ok,
            message: telegramResponse.ok ? 'Telegram bot token is valid' : 'Invalid token'
          };

        case CredentialType.RESEND_EMAIL:
          const resendRequest = this.prepareRequest(credentialType, credentialData, '/domains');
          const resendResponse = await fetch(resendRequest.url, {
            method: resendRequest.method,
            headers: resendRequest.headers,
          });
          return {
            success: resendResponse.ok,
            message: resendResponse.ok ? 'Resend API key is valid' : 'Invalid API key'
          };

        case CredentialType.GEMINI_API:
          const geminiRequest = this.prepareRequest(credentialType, credentialData, '/models');
          const geminiResponse = await fetch(geminiRequest.url, {
            method: geminiRequest.method,
            headers: geminiRequest.headers,
          });
          return {
            success: geminiResponse.ok,
            message: geminiResponse.ok ? 'Gemini API key is valid' : 'Invalid API key'
          };

        case CredentialType.OPENAI_API:
          const openaiRequest = this.prepareRequest(credentialType, credentialData, '/models');
          const openaiResponse = await fetch(openaiRequest.url, {
            method: openaiRequest.method,
            headers: openaiRequest.headers,
          });
          return {
            success: openaiResponse.ok,
            message: openaiResponse.ok ? 'OpenAI API key is valid' : 'Invalid API key'
          };

        default:
          return { success: true, message: 'Credential type not testable' };
      }
    } catch (error) {
      return {
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get credential configuration for a specific node type
   */
  static getNodeCredentialConfig(nodeType: string): { required: boolean; credentialTypes: CredentialType[] } {
    switch (nodeType) {
      case 'telegram-send-message':
        return {
          required: true,
          credentialTypes: [CredentialType.TELEGRAM_BOT]
        };

      case 'email':
        return {
          required: true,
          credentialTypes: [CredentialType.RESEND_EMAIL]
        };

      case 'gemini-generate':
        return {
          required: true,
          credentialTypes: [CredentialType.GEMINI_API]
        };

      case 'openai-generate':
        return {
          required: true,
          credentialTypes: [CredentialType.OPENAI_API]
        };

      case 'http-request':
        return {
          required: false,
          credentialTypes: [
            CredentialType.HTTP_BASIC_AUTH,
            CredentialType.API_KEY,
            CredentialType.OAUTH2,
            CredentialType.CUSTOM
          ]
        };

      case 'webhook-send':
        return {
          required: true,
          credentialTypes: [CredentialType.WEBHOOK_URL]
        };

      default:
        return {
          required: false,
          credentialTypes: []
        };
    }
  }
}
