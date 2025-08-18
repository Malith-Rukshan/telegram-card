/**
 * Telegram Card - Dynamic OG Image Generator for Telegram Profiles
 * https://github.com/Malith-Rukshan/telegram-card
 *
 * Generates beautiful, theme-aware preview cards for Telegram channels,
 * groups, and personal profiles. Perfect for embedding in GitHub READMEs,
 * websites, and social media.
 *
 * Usage: /?username=YourTelegramUsername&theme=light|dark
 *
 * Copyright (c) 2025 Malith Rukshan
 * Licensed under the MIT License
 *
 * Demo: https://telegram-card.vercel.app/?username=SingleDevelopers
 */

'use server';

import { NextRequest } from 'next/server'
import { ImageResponse } from 'next/og';
import scrapeTelegram from "@/utils/scrapeTelegram";
import { TelegramScrapeError, UserNotFoundError } from '@/utils/errors';
import { readFileSync } from 'fs';
import { join } from 'path';

function sanitizeUsername(username: string): string {
  return username.replace(/[^a-zA-Z0-9_]/g, ' ');
}

export async function GET(request: NextRequest) {
  let errorMessage = 'Please check the username and try again';
  try {
    // Parse request parameters
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || null;
    const theme = searchParams.get('theme') || 'light';
    const isDark = theme === 'dark';

    // If username is not provided, show homepage
    if (!username) {
      try {
        const htmlPath = join(process.cwd(), 'public', 'index.html');
        const htmlContent = readFileSync(htmlPath, 'utf8');
        
        const headers = new Headers();
        headers.set('Content-Type', 'text/html');
        headers.set('Cache-Control', 'public, max-age=3600');

        return new Response(htmlContent, {
          status: 200,
          headers: headers,
        });
      } catch {
        // Fallback if file doesn't exist
        return new Response('Homepage not found', { status: 404 });
      }
    }

    const sanitizedUsername = sanitizeUsername(username);

    // Fetch Telegram data
    const result = await scrapeTelegram(sanitizedUsername);

    // Theme-specific colors
    const cardBgColor = searchParams.get('bgColor') || (isDark ? 'rgba(42, 42, 42, 1)' : 'rgba(255, 255, 255, 1)');
    const textColor = searchParams.get('textColor') || (isDark ? '#ffffff' : '#000000');
    const subtleTextColor = searchParams.get('subtleTextColor') || (isDark ? '#AAAAAA' : '#666666');
    const extraColor = searchParams.get('extraColor') || (isDark ? '#8DD5FF' : '#3390D6');
    const shadowColor = searchParams.get('shadowColor') || (isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)');
    const fontFamily = searchParams.get('fontFamily') || 'Inter, sans-serif';

    const headers = new Headers();
    headers.set('Content-Type', 'image/png');
    headers.set('Cache-Control', 'public, max-age=7200');
    headers.set('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; font-src 'self'");

    // Generate the image response
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: cardBgColor,
              padding: '32px 40px',
              borderRadius: '24px',
              width: '600px',
              height: '180px',
              boxShadow: `0 12px 28px ${shadowColor}`,
              color: textColor,
              fontFamily: fontFamily,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Avatar section */}
            <div
              style={{
                position: 'relative',
                width: 110,
                height: 110,
                marginRight: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={result.image}
                alt={`${result.username} profile picture`}
                width={120}
                height={120}
                style={{
                  borderRadius: 9999,
                  objectFit: 'cover',
                }}
              />
            </div>

            {/* Content section */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                width: '100%',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', maxWidth: '380px' }}>
                  <span
                    style={{
                      fontSize: 30,
                      fontWeight: 700,
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      fontFamily: 'Arial',
                      letterSpacing: '-0.5px',
                    }}
                  >
                    {result.title}
                  </span>
                  {result.isVerified && (
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 26 26"
                      style={{
                        marginLeft: '8px',
                        verticalAlign: '-4px',
                        flexShrink: 0,
                      }}
                    >
                      <path d="m6 6h12v12h-12z" fill="#fff"/>
                      <path 
                        clipRule="evenodd" 
                        d="m14.38 1.51 1.82 1.82c.37.37.86.57 1.38.57h2.57c1.01 0 1.85.77 1.94 1.76l.01.19v2.57c0 .52.21 1.01.57 1.38l1.82 1.82c.71.71.76 1.84.13 2.61l-.13.15-1.82 1.82c-.37.37-.57.86-.57 1.38v2.57c0 1.01-.77 1.85-1.76 1.94l-.19.01h-2.57c-.52 0-1.01.21-1.38.57l-1.82 1.82c-.71.71-1.84.76-2.61.13l-.15-.13-1.82-1.82c-.37-.37-.86-.57-1.38-.57h-2.57c-1.01 0-1.85-.77-1.94-1.76l-.01-.19v-2.57c0-.52-.21-1.01-.57-1.38l-1.82-1.82c-.71-.71-.76-1.84-.13-2.61l.13-.15 1.82-1.82c.37-.37.57-.86.57-1.38v-2.57c0-1.08.87-1.95 1.95-1.95h2.57c.52 0 1.01-.21 1.38-.57l1.82-1.82c.76-.76 2-.76 2.76 0zm3.2 8.05c-.43-.34-1.03-.31-1.42.06l-.1.11-4.45 5.56-1.75-1.75-.11-.1c-.42-.32-1.03-.29-1.42.1s-.42.99-.1 1.42l.1.11 2.6 2.6.11.1c.42.32 1.02.29 1.4-.08l.1-.11 5.2-6.5.08-.12c.27-.46.17-1.05-.25-1.4z" 
                        fill="#1c93e3" 
                        fillRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>

              <span
                style={{
                  fontSize: 20,
                  fontWeight: 400,
                  color: subtleTextColor,
                  display: 'flex',
                  alignItems: 'center',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  maxWidth: '380px',
                }}
              >
                @{result.username}
              </span>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    color: extraColor,
                    display: 'flex',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    maxWidth: '360px',
                  }}
                >
                  {result.extra}
                </span>
              </div>
            </div>

            {/* Subtle corner gradient for depth */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: '120px',
                height: '120px',
                borderRadius: '100% 0 0 0',
                background: isDark ? 'radial-gradient(circle at 100% 100%, rgba(0,136,204,0.1), transparent 70%)' : 'radial-gradient(circle at 100% 100%, rgba(0,136,204,0.05), transparent 70%)',
                zIndex: 0,
              }}
            />
          </div>
        </div>
      ),
      {
        width: 700,
        height: 250,
        emoji: 'fluent',
        headers: headers,
      },
    );
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return new Response(buffer, {
      status: 200,
      headers: headers,
    });

  } catch (error) {
    console.error('Error generating Telegram card:', error);
    if (error instanceof UserNotFoundError) {
      errorMessage = error.message;
    } else if (error instanceof TelegramScrapeError) {
      errorMessage = error.message;
    }

    const headers = new Headers();
    headers.set('Content-Type', 'image/png');
    headers.set('Cache-Control', 'public, max-age=7200');
    headers.set('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; font-src 'self'");

    // Return a fallback image response
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '32px 40px',
              borderRadius: '24px',
              width: '600px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
              fontFamily: 'Inter, sans-serif',
              color: '#333333',
              gap: '16px',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 0C5.376 0 0 5.376 0 12C0 18.624 5.376 24 12 24C18.624 24 24 18.624 24 12C24 5.376 18.624 0 12 0ZM17.568 8.16C17.388 10.056 16.608 14.664 16.212 16.788C16.044 17.688 15.708 17.988 15.396 18.024C14.7 18.084 14.172 17.568 13.5 17.124C12.444 16.428 11.844 16.02 10.824 15.336C9.636 14.544 10.404 14.112 11.088 13.416C11.268 13.236 14.34 10.44 14.4 10.188C14.412 10.152 14.412 10.044 14.352 9.996C14.292 9.948 14.208 9.96 14.136 9.972C14.04 9.984 12.24 11.184 8.76 13.548C8.304 13.848 7.884 13.992 7.512 13.98C7.104 13.968 6.312 13.74 5.724 13.548C5.004 13.308 4.428 13.18 4.476 12.78C4.5 12.576 4.788 12.36 5.34 12.144C9.06 10.32 11.58 9.108 12.876 8.496C16.5 6.768 17.304 6.456 17.82 6.456C17.928 6.456 18.18 6.48 18.336 6.636C18.456 6.756 18.492 6.912 18.504 7.032C18.516 7.104 18.528 7.296 18.516 7.464C18.504 7.608 17.568 8.16 17.568 8.16Z"
                fill="#0088CC"
              />
            </svg>
            <span style={{ fontSize: 24, fontWeight: 600 }}>
              Unable to load Telegram profile
            </span>
            <span style={{ fontSize: 16, color: '#666666', textAlign: 'center' }}>
              {errorMessage}
            </span>
          </div>
        </div>
      ),
      {
        width: 700,
        height: 250,
        emoji: 'fluent',
        headers: headers,
      }
    );
  }
}