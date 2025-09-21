import { z } from "zod";
import { CredentialType } from "@repo/database";

import { createTrpcRouter, protectedProcedure } from "../trpc";

export const credentialRouter = createTrpcRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.credentials.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.credentials.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),

  getByType: protectedProcedure
    .input(
      z.object({
        type: z.nativeEnum(CredentialType),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.credentials.findMany({
        where: {
          type: input.type,
          userId: ctx.session.user.id,
        },
        select: {
          id: true,
          name: true,
          type: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.nativeEnum(CredentialType),
        data: z.record(z.any(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.credentials.create({
        data: {
          name: input.name,
          type: input.type,
          data: input.data,
          userId: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        data: z.record(z.any(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.credentials.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          name: input.name,
          data: input.data,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.credentials.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
      return { success: true };
    }),

  testConnectivity: protectedProcedure
    .mutation(async () => {
      try {
        console.log('Starting connectivity test from tRPC...');
        
        // Test basic internet connectivity
        const response = await fetch('https://httpbin.org/get', {
          method: 'GET',
          signal: AbortSignal.timeout(15000), // Increased to 15 seconds
          headers: {
            'User-Agent': 'n8n-agentic/1.0',
            'Accept': 'application/json',
          }
        });
        
        console.log('Response received:', response.status, response.statusText);
        
        return { 
          success: response.ok, 
          message: response.ok ? "Internet connectivity is working" : "Internet connectivity test failed" 
        };
      } catch (error) {
        console.error('Connectivity test error in tRPC:', error);
        return { 
          success: false, 
          message: `Connectivity test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
      }
    }),

  test: protectedProcedure
    .input(
      z.object({
        type: z.nativeEnum(CredentialType),
        data: z.record(z.any(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Test credential by making a simple API call
      try {
        console.log('Testing credential type:', input.type);
        console.log('Input data keys:', Object.keys(input.data));
        switch (input.type) {
          case CredentialType.TELEGRAM_BOT:
            if (!input.data.token) {
              return { success: false, message: "Bot token is required" };
            }
            
            // Telegram Bot Token format validation
            // Format: 8-10 digits, colon, exactly 35 alphanumeric characters (including _ and -)
            const telegramTokenRegex = /^[0-9]{8,10}:[a-zA-Z0-9_-]{35}$/;
            if (!telegramTokenRegex.test(input.data.token)) {
              return { 
                success: false, 
                message: "Invalid bot token format. Token should be in format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz1234567890 (8-10 digits, colon, 35 alphanumeric characters)" 
              };
            }
            
            console.log('Testing Telegram API with token:', input.data.token.substring(0, 10) + '...');
            
            try {
              const telegramResponse = await fetch(
                `https://api.telegram.org/bot${input.data.token}/getMe`,
                { 
                  method: 'GET',
                  headers: { 
                    'Content-Type': 'application/json',
                    'User-Agent': 'n8n-agentic/1.0',
                    'Accept': 'application/json',
                  },
                  signal: AbortSignal.timeout(15000) // 15 second timeout
                }
              );
              
              console.log('Telegram API response status:', telegramResponse.status);
            
              if (telegramResponse.ok) {
                const data = await telegramResponse.json();
                if (data.ok && data.result) {
                  return { success: true, message: `Telegram bot is valid: @${data.result.username || 'Unknown'} (${data.result.first_name || 'Bot'})` };
                } else {
                  return { success: false, message: `Invalid bot token: ${data.description || 'Unknown error'}` };
                }
              } else {
                const errorData = await telegramResponse.json();
                if (telegramResponse.status === 401) {
                  return { success: false, message: `Invalid bot token: ${errorData.description || 'Unauthorized'}` };
                } else {
                  return { success: false, message: `Telegram API error (${telegramResponse.status}): ${errorData.description || 'Unknown error'}` };
                }
              }
            } catch (telegramError) {
              console.error('Telegram API specific error:', telegramError);
              if (telegramError instanceof Error) {
                if (telegramError.message.includes('ETIMEDOUT')) {
                  return { success: false, message: "Telegram API timeout - please check your internet connection and try again" };
                }
                if (telegramError.message.includes('fetch failed')) {
                  return { success: false, message: "Cannot reach Telegram API - please check your internet connection" };
                }
                return { success: false, message: `Telegram API error: ${telegramError.message}` };
              }
              return { success: false, message: "Unknown Telegram API error" };
            }
            
            // Fallback: If we reach here, the token format is valid but API is unreachable
            return { success: true, message: "Bot token format is valid (API unreachable for testing)" };
          
          case CredentialType.RESEND_EMAIL:
            if (!input.data.apiKey) {
              return { success: false, message: "API key is required" };
            }
                  const resendResponse = await fetch("https://api.resend.com/domains", {
                    method: 'GET',
                    headers: {
                      "Authorization": `Bearer ${input.data.apiKey}`,
                      "Content-Type": "application/json",
                      "User-Agent": "n8n-agentic/1.0",
                      "Accept": "application/json",
                    },
                    signal: AbortSignal.timeout(15000)
                  });
            
            if (resendResponse.ok) {
              return { success: true, message: "Resend API key is valid" };
            } else {
              const errorData = await resendResponse.text();
              return { success: false, message: `Resend API error (${resendResponse.status}): ${errorData}` };
            }
          
          case CredentialType.GEMINI_API:
            if (!input.data.apiKey) {
              return { success: false, message: "API key is required" };
            }
                  const geminiResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models?key=${input.data.apiKey}`,
                    { 
                      method: 'GET',
                      headers: { 
                        'Content-Type': 'application/json',
                        'User-Agent': 'n8n-agentic/1.0',
                        'Accept': 'application/json',
                      },
                      signal: AbortSignal.timeout(15000)
                    }
                  );
            
            if (geminiResponse.ok) {
              return { success: true, message: "Gemini API key is valid" };
            } else {
              const errorData = await geminiResponse.text();
              return { success: false, message: `Gemini API error (${geminiResponse.status}): ${errorData}` };
            }
          
          case CredentialType.OPENAI_API:
            if (!input.data.apiKey) {
              return { success: false, message: "API key is required" };
            }
                  const openaiResponse = await fetch("https://api.openai.com/v1/models", {
                    method: 'GET',
                    headers: {
                      "Authorization": `Bearer ${input.data.apiKey}`,
                      "Content-Type": "application/json",
                      "User-Agent": "n8n-agentic/1.0",
                      "Accept": "application/json",
                    },
                    signal: AbortSignal.timeout(15000)
                  });
            
            if (openaiResponse.ok) {
              return { success: true, message: "OpenAI API key is valid" };
            } else {
              const errorData = await openaiResponse.text();
              return { success: false, message: `OpenAI API error (${openaiResponse.status}): ${errorData}` };
            }
          
          default:
            return { success: true, message: "Credential type not testable" };
        }
      } catch (error) {
        console.error('Credential test error:', error);
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            return { success: false, message: "Test timed out after 15 seconds - please check your internet connection" };
          }
          if (error.message.includes('fetch failed')) {
            return { success: false, message: "Network error - please check your internet connection and try again" };
          }
          if (error.message.includes('ETIMEDOUT')) {
            return { success: false, message: "Connection timeout - please check your internet connection and firewall settings" };
          }
          if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo ENOTFOUND')) {
            return { success: false, message: "DNS resolution failed - please check your internet connection" };
          }
          return { success: false, message: `Test failed: ${error.message}` };
        }
        return { success: false, message: "Unknown error occurred during testing" };
      }
    }),
});
