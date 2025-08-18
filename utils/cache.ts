/**
 * Telegram Card - Cache
 * https://github.com/Malith-Rukshan/telegram-card
 *
 * This module contains a simple in-memory cache.
 *
 * Copyright (c) 2025 Malith Rukshan
 * Licensed under the MIT License
 */

const cache = new Map<string, { data: any; expires: number }>();

export function get<T>(key: string): T | null {
    const item = cache.get(key);
    if (item && item.expires > Date.now()) {
        return item.data as T;
    }
    return null;
}

export function set<T>(key: string, data: T, ttl: number) {
    const expires = Date.now() + ttl;
    cache.set(key, { data, expires });
}
