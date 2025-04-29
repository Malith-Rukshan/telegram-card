/**
 * Telegram Card - Web Scraper Utility for Telegram Profiles
 * https://github.com/Malith-Rukshan/telegram-card
 * 
 * This server-side utility scrapes information from Telegram's public web pages
 * to extract profile information including title, username, description, profile image,
 * and additional stats based on the account type (user, bot, channel, or group).
 * 
 * The utility determines the type of Telegram entity and extracts the appropriate
 * information for display in the Telegram Card OG image.
 * 
 * Note: This scraper is intended for publicly available information only and
 * respects Telegram's public web interface.
 * 
 * Copyright (c) 2025 Malith Rukshan
 * Licensed under the MIT License
 */

'use server';

import { SoruceType } from "@/types/enums";
import { JSDOM } from 'jsdom';

interface ScrapeResult {
    type: SoruceType;
    title: string;
    username: string;
    description: string | null;
    image: string;
    extra: string | null;
}

// Helper function to fetch and parse the HTML
async function fetchAndParseHtml(username: string): Promise<Document> {
    const response = await fetch(`https://t.me/${username}`, {
        method: 'GET',
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch data from @${username}`);
    }

    const text = await response.text();
    const dom = new JSDOM(text);
    return dom.window.document;
}

// Helper function to extract text content from a selector
function extractTextContent(doc: Document, selector: string): string | null {
    return doc.querySelector(selector)?.textContent?.trim() || null;
}

// Helper function to determine the source type
function determineSourceType(doc: Document): SoruceType {
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

// Helper function to extract the 'extra' information, handling the bot case
function extractExtraInfo(doc: Document, type: SoruceType): string | null {
    const extraElements = doc.querySelectorAll('div.tgme_page_extra');

    if (type === SoruceType.Bot) {
        // For bots, the second 'extra' element might contain the relevant info (monthly users count)
        return extraElements.length > 1 ? extraElements[1]?.textContent?.trim() || null : null;
    } else if (type === SoruceType.User) {
        // For users, just return 'User Account'
        return 'User Account';
    }  else {
        // For other types, the first 'extra' element usually contains subscriber/member count
        return extraElements[0]?.textContent?.trim() || null;
    }
}


export default async function scrapeTelegram(username: string): Promise<ScrapeResult> {
    const doc = await fetchAndParseHtml(username);

    const image = doc.querySelector('img.tgme_page_photo_image')?.getAttribute('src') || '';
    const title = extractTextContent(doc, 'div.tgme_page_title') || '';
    const description = extractTextContent(doc, 'div.tgme_page_description');
    const type = determineSourceType(doc);
    const extra = extractExtraInfo(doc, type);

    const result: ScrapeResult = {
        type: type,
        title: title,
        username: username,
        description: description,
        image: image,
        extra: extra,
    };

    return result;
}