# eBird Target Birds Finder

Find birds you need to see in your region using eBird. This tool logs into your eBird account, gets your life list, and compares it against the "Needs" list for your region to show you birds you haven't seen yet.

## Features

- � Automatically logs into your eBird account
- 📚 Fetches your complete life list
- 🎯 Checks "Needs [Region]" birds
- 🐦 Shows birds you haven't seen yet with detailed statistics
- 📊 Ranks birds by likelihood (based on observer counts, recent sightings, and photos)
- 📘 Written in TypeScript for type safety

## Prerequisites

- Node.js (v18 or higher recommended)
- An eBird account with username/password
- Google Chrome or Chromium browser installed

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure your settings:**

   Create a `.env` file in the project root:

   ```env
   # eBird login credentials
   EBIRD_USERNAME=your_email@example.com
   EBIRD_PASSWORD=your_password
   ```

## Usage

**Run the application:**

```bash
npm start
```

The app will:

1. Open a browser and log into eBird with your credentials
2. Fetch your life list from your profile
3. Get the "Needs" list for your region
4. Compare the two lists and display missing birds ranked by likelihood

**For development (with tsx, no build needed):**

```bash
npm run dev
```

**Build TypeScript to JavaScript:**

```bash
npm run build
```

**Watch TypeScript files for changes:**

```bash
npm run watch
```

## Project Structure

```
ebird-alerts/
├── src/                    # TypeScript source files
│   ├── index.ts            # Main entry point
│   ├── ebird-scraper.ts    # eBird web scraping logic
│   └── config.ts           # Configuration management
├── dist/                   # Compiled JavaScript (generated)
├── .env                    # Your configuration (create this file)
├── .gitignore              # Git ignore rules
├── tsconfig.json           # TypeScript configuration
├── package.json            # Project metadata and dependencies
└── README.md               # This file
```

## Configuration

Create a `.env` file with the following variables:

| Variable         | Description               | Required |
| ---------------- | ------------------------- | -------- |
| `EBIRD_USERNAME` | Your eBird email/username | Yes      |
| `EBIRD_PASSWORD` | Your eBird password       | Yes      |

## Example Output

```
🦅 eBird Target Birds Finder

1. Snowy Owl                   [92] ✓
   └─ 18 observation(s) | 3 day(s) | 5 location(s) | 12 observer(s) | 8 picture(s)
   └─ Last seen: 2026-01-15

2. Red Crossbill               [87] ✓
   └─ 15 observation(s) | 3 day(s) | 3 location(s) | 8 observer(s) | 5 picture(s)
   └─ Last seen: 2026-01-14

════════════════════════════════════════════════════════════════════════════════
```

## How It Works

The tool uses Puppeteer to:

1. **Log into eBird** with your provided credentials
2. **Scrape your life list** from your eBird profile
3. **Fetch the "Needs" list** for your region
4. **Compare the lists** to find birds you haven't seen yet
5. **Rank results** by:
   - Number of observers (more observers = higher likelihood)
   - Recent sightings (birds seen recently rank higher)
   - Available photos (documented sightings are more reliable)

## Troubleshooting

**"Configuration errors: EBIRD_USERNAME is required"**

- Make sure you've created a `.env` file with your eBird credentials

**Login fails or browser doesn't open**

- Make sure you have Google Chrome or Chromium installed
- Check that your eBird credentials are correct
- The browser window should open automatically during login

**"You've seen all the birds in your needs list!"**

- Congratulations! You've achieved your birding goal for your region.

## Contributing

Feel free to open issues or submit PRs!

## License

MIT
