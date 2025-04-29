# Telegram Card

Dynamic, beautiful preview cards for Telegram channels, groups, and bots.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMalith-Rukshan%2Ftelegram-card)

## Features

- 🎨 Beautiful, responsive design
- 🌓 Dark and light theme support
- 🚀 Fast generation using Next.js OG Image API
- 📱 Works with channels, groups, bots and personal profiles
- 📊 Shows subscriber count, member count, or monthly users

## Usage

### Basic Usage

```
https://your-deployment.vercel.app/api/og?username=YourTelegramUsername
```

### With Theme Specification

```
https://your-deployment.vercel.app/api/og?username=YourTelegramUsername&theme=dark
```

## Examples

### Light Theme
![Telegram Card Light](https://telegram-card.vercel.app/api/og?username=SingleDevelopers&theme=light)

### Dark Theme
![Telegram Card Dark](https://telegram-card.vercel.app/api/og?username=SingleDevelopers&theme=dark)

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Malith-Rukshan/telegram-card.git
   cd telegram-card
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000/api/og?username=SingleDevelopers](http://localhost:3000/api/og?username=SingleDevelopers) to see your card!

## Deploy Your Own

Deploy your own version of the Telegram Card using Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMalith-Rukshan%2Ftelegram-card)

## Contributing

Contributions are welcome! Feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Built with [Next.js](https://nextjs.org/)
- OG Images powered by [@vercel/og](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)
- Inspired by GitHub profile cards