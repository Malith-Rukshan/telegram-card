/**
 * Telegram Card - Web Scraper Utility for Telegram Profiles
 * https://github.com/Malith-Rukshan/telegram-card
 *
 * This server-side utility scrapes information from Telegram's public web pages
 * to extract profile information.
 *
 * Copyright (c) 2025 Malith Rukshan
 * Licensed under the MIT License
 */

'use server';

import { JSDOM } from 'jsdom';
import { TelegramScrapeError, UserNotFoundError } from './errors';
import {
    determineSourceType,
    extractDescription,
    extractExtraInfo,
    extractImage,
    extractTitle,
    extractVerifiedStatus
} from './parsers';
import { SoruceType } from '@/types/enums';
import { get, set } from './cache';

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface ScrapeResult {
    type: SoruceType;
    title: string;
    username: string;
    description: string | null;
    image: string;
    extra: string | null;
    isVerified: boolean;
}

async function fetchAndParseHtml(username: string): Promise<Document> {
    const response = await fetch(`https://t.me/${username}`, {
        method: 'GET',
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        },
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new UserNotFoundError(username);
        }
        throw new TelegramScrapeError(`Failed to fetch data for @${username}. Status: ${response.status}`);
    }

    const text = await response.text();
    const dom = new JSDOM(text);
    return dom.window.document;
}

async function scrapeAndCache(username: string): Promise<ScrapeResult> {
    try {
        const doc = await fetchAndParseHtml(username);

        const image = extractImage(doc);
        const title = extractTitle(doc);
        const description = extractDescription(doc);

        if (!image || !title) {
            throw new TelegramScrapeError('Could not parse essential data from the Telegram page.');
        }

        const type = determineSourceType(doc);
        const extra = extractExtraInfo(doc, type);
        const isVerified = extractVerifiedStatus(doc);

        const result: ScrapeResult = {
            type,
            title,
            username,
            description,
            image,
            extra,
            isVerified,
        };

        set(username, result, CACHE_TTL);
        return result;
    } catch (error) {
        if (error instanceof TelegramScrapeError) {
            throw error;
        }
        throw new TelegramScrapeError(`An unexpected error occurred while scraping @${username}.`);
    }
}

export default async function scrapeTelegram(username: string): Promise<ScrapeResult> {
    const cachedResult = get<ScrapeResult>(username);
    if (cachedResult) {
        return cachedResult;
    }
    return scrapeAndCache(username);
}
