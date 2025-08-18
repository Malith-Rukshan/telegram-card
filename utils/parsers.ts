/**
 * Telegram Card - Parsers
 * https://github.com/Malith-Rukshan/telegram-card
 *
 * This module contains the parsing logic for different types of Telegram entities.
 *
 * Copyright (c) 2025 Malith Rukshan
 * Licensed under the MIT License
 */

import { SoruceType } from "@/types/enums";

// Helper function to extract text content from a selector
function extractTextContent(doc: Document, selector: string): string | null {
    return doc.querySelector(selector)?.textContent?.trim() || null;
}

export function determineSourceType(doc: Document): SoruceType {
    const btnTxt = extractTextContent(doc, 'a.tgme_action_button_new')?.toLowerCase();
    const contextLinkText = extractTextContent(doc, 'a.tgme_page_context_link');

    if (contextLinkText) {
        return SoruceType.Channel;
    }

    if (btnTxt?.includes('start')) {
        return SoruceType.Bot;
    } else if (btnTxt?.includes('view')) {
        return SoruceType.Group;
    } else if (btnTxt?.includes('send')) {
        return SoruceType.User;
    }

    return SoruceType.Unknown;
}

export function extractExtraInfo(doc: Document, type: SoruceType): string | null {
    const extraElements = doc.querySelectorAll('div.tgme_page_extra');

    if (type === SoruceType.Bot) {
        return extraElements.length > 1 ? extraElements[1]?.textContent?.trim() || null : null;
    } else if (type === SoruceType.User) {
        return 'User Account';
    } else {
        return extraElements[0]?.textContent?.trim() || null;
    }
}

export function extractTitle(doc: Document): string | null {
    const titleElement = doc.querySelector('div.tgme_page_title');
    if (!titleElement) return null;
    
    // Get text content from span elements only, excluding the verified icon
    const titleSpan = titleElement.querySelector('span[dir="auto"]');
    if (titleSpan) {
        return titleSpan.textContent?.trim() || null;
    }
    
    // Fallback: get all text content and remove common verification symbols
    const fullText = titleElement.textContent?.trim();
    if (!fullText) return null;
    
    // Remove verification checkmarks and other symbols
    return fullText.replace(/[✔✓☑]/g, '').trim();
}

export function extractDescription(doc: Document): string | null {
    return extractTextContent(doc, 'div.tgme_page_description');
}

export function extractImage(doc: Document): string | null {
    return doc.querySelector('img.tgme_page_photo_image')?.getAttribute('src') || null;
}

export function extractVerifiedStatus(doc: Document): boolean {
    return doc.querySelector('div.tgme_page_title i.verified-icon') !== null;
}
