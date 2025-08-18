
export class TelegramScrapeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TelegramScrapeError';
    }
}

export class UserNotFoundError extends TelegramScrapeError {
    constructor(username: string) {
        super(`User "${username}" not found.`);
        this.name = 'UserNotFoundError';
    }
}
