# Hello World Plugin

A simple example plugin that demonstrates the BigMind plugin API.

## Features

- ✅ Command registration
- ✅ Menu item integration
- ✅ Notifications
- ✅ Lifecycle hooks (onLoad/onUnload)

## Installation

```bash
# Install via BigMind Plugin Manager
# Or copy to BigMind plugins directory
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev
```

## API Usage

This plugin demonstrates:

- `context.commands.register()` - Register commands
- `context.ui.showNotification()` - Show notifications
- `context.ui.addMenuItem()` - Add menu items
- Cleanup in `onUnload()` hook

## License

MIT
