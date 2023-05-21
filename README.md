## GATE IO Trading Bot by Brock Phillis

Welcome to the GATE IO Trading Bot, developed by Brock Phillis. This trading bot is designed specifically for the Gate.IO exchange (https://www.gate.io/) and comes with a range of features to automate your trading experience.

### Features

- **Instant Buy and Sell**: The bot scans the exchange at regular intervals and instantly buys tokens that have dropped a certain amount since the last scan. It then places a sell order automatically.
- **Margin Token Monitoring**: Scrape the Gate.IO announcements page to identify newly listed margin tokens and purchases them as soon as the announcement is made.
- **Binance Announcements Integration**: Scrape the Binance announcements endpoint and automatically places orders on Gate.IO as soon as announcements are made.

### Getting Started

To get started with the GATE IO Trading Bot, follow these steps:

1. Create a `.env.local` file in the project's root directory.
2. Generate API keys on Gate.IO with the necessary permissions.
3. Define the following environment variables in the `.env.local` file:

```
NEXT_PUBLIC_GATEIO_SECRET=YOUR_SECRET_KEY
NEXT_PUBLIC_GATEIO_NORMAL=YOUR_API_KEY
```

4. Open the terminal and navigate to the project directory.
5. Run `yarn install` or `npm install` to install the required dependencies.
6. Start the bot by running `yarn run dev` or `npm run dev`.

### Setting Up the Bot

Before running the bot, you can customize its behavior by adjusting the following settings:

- **Amount per Trade** (`$ amount per trade`): Specify the amount you want to spend per trade.
- **Profit Threshold** (`% profit to sell`): Set the percentage gain at which you want to automatically sell the tokens.
- **Minimum Dip Threshold** (`% min dip to buy`): Define the minimum percentage drop at which you will buy tokens.
- **Maximum Dip Threshold** (`% max dip to buy`): Set the maximum percentage drop you are willing to buy at. This helps prevent falling for false price drops.
- **Daily Change Over** (`% daily change over`): Purchase tokens only if their daily change percentage is above a certain threshold.
- **Daily Change Under** (`% daily change under`): Purchase tokens only if their daily change percentage is below a certain threshold. This can prevent purchasing newly listed tokens.
- **Daily Volume Over** (`$ daily volume over`): Purchase tokens only if their daily trading volume is above a certain threshold. This helps avoid low-volume tokens.
- **Scan Interval** (`interval`): Specify the interval in milliseconds between each scan.

Feel free to adjust these settings according to your trading preferences and risk tolerance.

Now you are ready to start using the GATE IO Trading Bot and automate your trading on Gate.IO. Happy trading!
