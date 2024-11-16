# DDGS - DuckDuckGo Search API

A Node.js library providing programmatic access to DuckDuckGo search functionality, including web search, images, videos, and news results.

## Features

- Web Search with comprehensive result data
- Image Search including dimensions and metadata
- Video Search with duration and engagement metrics  
- News Search with source attribution and publication dates
- Advanced request handling to prevent rate limiting
- Modern async/await Promise-based API
- Full TypeScript support and type definitions
- Extensive test coverage and reliability

## Installation

```bash
pnpm add ddgs
# or
npm install ddgs
# or
yarn add ddgs
```

## Usage

### Basic Search

```typescript
import DuckDuckGoService from 'ddgs';

const ddg = new DuckDuckGoService();

// Basic web search
const { results } = await ddg.search('nodejs');
console.log(results);

// Don't forget to close the browser when done
await ddg.close();
```

### Image Search

```typescript
const images = await ddg.searchImages('cats');
console.log(images);
// [
//   {
//     title: 'Cute cat image',
//     imageUrl: 'https://...',
//     pageUrl: 'https://...',
//     dimensions: '1920 × 1080',
//     size: '1920 × 1080 pixels'
//   },
//   ...
// ]
```

### Video Search

```typescript
const videos = await ddg.searchVideos('cooking tutorial');
console.log(videos);
// [
//   {
//     title: 'How to Cook...',
//     url: 'https://youtube.com/...',
//     thumbnailUrl: 'https://...',
//     duration: '10:30',
//     views: '1.2M views'
//   },
//   ...
// ]
```

### News Search

```typescript
const news = await ddg.searchNews('technology');
console.log(news);
// [
//   {
//     title: 'Latest Tech News',
//     url: 'https://...',
//     source: 'TechNews',
//     snippet: 'Breaking news about...',
//     time: '2 hours ago'
//   },
//   ...
// ]
```

## Configuration

You can customize the behavior by passing a config object:

```typescript
const ddg = new DuckDuckGoService({
  timeout: 10000,        // Request timeout in ms
  maxRetries: 3,         // Number of retries on failure
  language: 'en-US',     // Preferred language
  region: 'wt-wt',       // Region code (wt-wt for worldwide)
  safeSearch: true,      // Enable safe search
});
```

## Error Handling

The service throws `DuckDuckGoError` for various error conditions:

```typescript
try {
  const results = await ddg.search('');
} catch (error) {
  if (error instanceof DuckDuckGoError) {
    console.error('Search failed:', error.message);
    console.error('Error type:', error.type);
    console.error('Error code:', error.code);
  }
}
```

## Development

### Setup

```bash
git clone https://github.com/EudaLabs/ddgs.git
cd ddgs
pnpm install
```

### Testing

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:search
pnpm test:images
pnpm test:videos
pnpm test:news

# Run tests with verbose logging
pnpm test:search --verbose
```

### Building

```bash
pnpm build
```

## Types

The package includes TypeScript definitions for all features:

- `SearchResult` - Web search result type
- `ImageResult` - Image search result type
- `VideoResult` - Video search result type
- `NewsResult` - News search result type
- `DuckDuckGoConfig` - Configuration options type
- `DuckDuckGoError` - Error type with codes and details

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
