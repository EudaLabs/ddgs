import puppeteer from 'puppeteer-extra';
import type { Browser, Page } from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { DuckDuckGoError, ErrorType, ErrorCodes } from '../errors';

// Add stealth plugin to avoid detection
const stealth = StealthPlugin();
puppeteer.use(stealth);

export const BASE_URL = 'https://duckduckgo.com';

export interface DuckDuckGoConfig {
  cacheTTL?: number;
  timeout?: number;
  maxRetries?: number;
  language?: string;
  region?: string;
  safeSearch?: boolean;
}

export abstract class BaseService {
  protected browser: Browser | null = null;
  protected readonly config: Required<DuckDuckGoConfig>;

  constructor(config: DuckDuckGoConfig = {}) {
    this.config = {
      cacheTTL: config.cacheTTL ?? 300,
      timeout: config.timeout ?? 10000,
      maxRetries: config.maxRetries ?? 3,
      language: config.language ?? 'en-US',
      region: config.region ?? 'wt-wt',
      safeSearch: config.safeSearch ?? true,
    };
  }

  protected log(message: string): void {
    if (process.env.NODE_ENV === 'test' && process.argv.includes('--verbose')) {
      console.log(message);
    }
  }

  protected logError(error: unknown): void {
    if (process.env.NODE_ENV === 'test' && process.argv.includes('--verbose')) {
      console.error('Full error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        details: error instanceof Error && 'details' in error ? (error as Record<string, unknown>).details : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
    }
  }

  protected async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      // Launch browser with enhanced configurations
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-infobars',
          '--window-position=0,0',
          '--ignore-certifcate-errors',
          '--ignore-certifcate-errors-spki-list',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-blink-features=AutomationControlled',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-blink-features',
          '--disable-notifications',
        ],
        ignoreHTTPSErrors: true,
        defaultViewport: null,
        executablePath: process.env.CHROME_PATH,
      });

      // Set up default context
      const context = this.browser.defaultBrowserContext();
      await context.overridePermissions(BASE_URL, []);
    }
    return this.browser;
  }

  protected async setupPage(page: Page): Promise<void> {
    // Set default timeouts
    await page.setDefaultNavigationTimeout(this.config.timeout);
    await page.setDefaultTimeout(this.config.timeout);

    // Set viewport
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: true,
      isMobile: false,
    });

    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    });

    // Disable webdriver
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      // @ts-ignore
      window.chrome = { runtime: {} };
    });

    // Add random delay
    await page.waitForTimeout(Math.floor(Math.random() * 500) + 500);
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  protected validateQuery(query: string): void {
    if (!query?.trim()) {
      throw new DuckDuckGoError(
        ErrorCodes[ErrorType.VALIDATION],
        'Search query cannot be empty',
        undefined,
        ErrorType.VALIDATION
      );
    }
  }
} 