# eBird Target Birds Finder

Find target birds from eBird based on recent sightings in your area. This tool helps you identify birds you haven't seen yet that have been consistently reported by multiple observers.

## Features

- ✅ Uses official eBird API (no scraping needed!)
- 🎯 Filters birds by consecutive days seen and number of observers
- 📍 Searches within a configurable radius of your location
- 🐦 Optionally filters out birds already on your eBird life list
- ⚙️ Fully configurable thresholds

## Prerequisites

- Node.js (v18 or higher recommended)
- An eBird API key ([get one here](https://ebird.org/api/keygen))

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure your settings:**

   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your details:

   ```env
   # Get your API key at https://ebird.org/api/keygen
   EBIRD_API_KEY=your_actual_api_key

   # Your coordinates (find them at https://www.latlong.net/)
   LATITUDE=40.7128
   LONGITUDE=-74.0060

   # Search radius in kilometers (max 50)
   RADIUS_KM=25

   # Minimum consecutive days a bird must be seen
   MIN_CONSECUTIVE_DAYS=2

   # Minimum number of different observers
   MIN_OBSERVERS=5

   # How many days back to search
   DAYS_BACK=14
   ```

3. **Optional: Add your eBird username**

   To filter out birds you've already seen, add to `.env`:

   ```env
   EBIRD_USERNAME=your_ebird_username
   ```

   Or pass it as a command line argument when running.

## Usage

**Basic usage (no life list filtering):**

```bash
npm start
```

**With your eBird username (to exclude birds you've seen):**

```bash
npm start your_ebird_username
```

Or:

```bash
node index.js your_ebird_username
```

## Configuration Options

All configurable options are in the `.env` file:

| Variable               | Description               | Default  | Notes                                              |
| ---------------------- | ------------------------- | -------- | -------------------------------------------------- |
| `EBIRD_API_KEY`        | Your eBird API key        | Required | Get from [eBird API](https://ebird.org/api/keygen) |
| `LATITUDE`             | Your latitude             | Required | Decimal degrees                                    |
| `LONGITUDE`            | Your longitude            | Required | Decimal degrees                                    |
| `RADIUS_KM`            | Search radius             | 25       | Max 50 km                                          |
| `MIN_CONSECUTIVE_DAYS` | Minimum consecutive days  | 2        | Birds must be seen this many days in a row         |
| `MIN_OBSERVERS`        | Minimum observers         | 5        | Birds must be seen by at least this many people    |
| `DAYS_BACK`            | Days of history to search | 14       | How far back to look                               |
| `EBIRD_USERNAME`       | Your eBird username       | Optional | For life list filtering                            |

## Example Output

```
🔍 Searching for target birds...
📍 Location: 40.7128, -74.0060 (25km radius)
⚙️  Criteria: 2+ consecutive days, 5+ observers

Fetching recent observations...
Found 1247 total observations

Fetching life list for birder123...
Life list contains 342 species

✅ Found 3 target bird(s):

════════════════════════════════════════════════════════════════════════════════

1. Snowy Owl (Bubo scandiacus)
   Species Code: snoowl1
   👥 Observers: 12
   📊 Total Sightings: 18
   📅 Dates Seen: 2026-01-09, 2026-01-10, 2026-01-11
   📍 Locations (sample):
      • Central Park
      • Jamaica Bay Wildlife Refuge
      • Floyd Bennett Field
      ... and 2 more location(s)

2. Red Crossbill (Loxia curvirostra)
   Species Code: redcro
   👥 Observers: 8
   📊 Total Sightings: 15
   📅 Dates Seen: 2026-01-08, 2026-01-09, 2026-01-10
   📍 Locations (sample):
      • Prospect Park
      • Green-Wood Cemetery
      • Forest Park

════════════════════════════════════════════════════════════════════════════════
```

## How It Works

1. **Fetches recent observations** from eBird within your specified radius
2. **Groups observations by species** and analyzes patterns
3. **Filters birds** that meet your criteria:
   - Seen on consecutive days (configurable)
   - Seen by minimum number of observers (configurable)
   - Not on your life list (if username provided)
4. **Displays results** sorted by number of observers

## API Limits

The eBird API has rate limits. For normal use, you shouldn't hit them, but be aware:

- Don't run this continuously in a loop
- The API is free for reasonable personal use

## Troubleshooting

**"Configuration errors: EBIRD_API_KEY is required"**

- Make sure you've created a `.env` file and added your API key

**"eBird API error: 403"**

- Your API key is invalid or not provided correctly
- Get a new key at https://ebird.org/api/keygen

**"User not found or life list not public"**

- The eBird username might be wrong
- Or the user's life list is set to private in their eBird settings
- The tool will continue without life list filtering

**No target birds found**

- Try reducing `MIN_CONSECUTIVE_DAYS` or `MIN_OBSERVERS`
- Increase `RADIUS_KM` or `DAYS_BACK`
- Make sure there's been recent birding activity in your area

## Contributing

Feel free to open issues or submit PRs!

## License

MIT
