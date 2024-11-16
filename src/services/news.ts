import type { Page } from 'puppeteer';
import { BaseService } from './base';
import { DuckDuckGoError, ErrorType, ErrorCodes } from '../errors';
import { BASE_URL } from './base';
import { selectors } from '../selectors';

export interface NewsResult {
  title: string;
  url: string;
  source?: string;
  snippet?: string;
  time?: string;
  category?: string;
}

export class NewsService extends BaseService {
  async searchNews(query: string): Promise<NewsResult[]> {
    this.validateQuery(query);

    const browser = await this.initBrowser();
    let page: Page | null = null;

    try {
      page = await browser.newPage();
      this.log('Page created');

      await this.setupPage(page);
      this.log('Page configured');

      const url = `${BASE_URL}/?q=${encodeURIComponent(query)}&iar=news&ia=news`;
      this.log(`Navigating to: ${url}`);
      
      await page.goto(url, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: this.config.timeout,
      });
      this.log('Page loaded');

      await page.waitForSelector(selectors.news.resultItem[0], { timeout: this.config.timeout });
      this.log('Results container found');

      const html = await page.content();
      this.log(`Current HTML structure: ${JSON.stringify({
        length: html.length,
        hasNewsResults: html.includes('result--news'),
        sample: html.substring(0, 500)
      }, null, 2)}`);

      const results = await page.evaluate(
        /* istanbul ignore next */
        (newsSelectors) => {
        const newsResults: NewsResult[] = [];
        
        const items = document.querySelectorAll(newsSelectors.resultItem[0]);
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const titleEl = item.querySelector(newsSelectors.title[0]);
          const sourceEl = item.querySelector(newsSelectors.source[0]);
          const snippetEl = item.querySelector(newsSelectors.snippet[0]);
          const timeEl = item.querySelector(newsSelectors.time[0]);
          
          if (titleEl) {
            const url = titleEl.getAttribute('href');
            if (url && url !== '#') {
              const formattedUrl = url.startsWith('http') ? url : `https://${url}`;

              const result: NewsResult = {
                title: titleEl.textContent?.trim().replace('Your browser indicates if you\'ve visited this link', '') || '',
                url: formattedUrl,
              };

              if (sourceEl) {
                result.source = sourceEl.textContent?.trim();
              }

              if (snippetEl) {
                result.snippet = snippetEl.textContent?.trim();
              }

              if (timeEl) {
                result.time = timeEl.textContent?.trim();
              }

              newsResults.push(result);
            }
          }
        }

        return newsResults;
      }, selectors.news);

      this.log(`Results: ${JSON.stringify(results, null, 2)}`);

      if (results.length === 0) {
        throw new DuckDuckGoError(
          ErrorCodes[ErrorType.NOT_FOUND],
          'No news results found',
          undefined,
          ErrorType.NOT_FOUND
        );
      }

      return results;

    } catch (error: unknown) {
      this.logError(error);
      
      if (page) {
        const html = await page.content();
        this.log(`Current HTML: ${html.substring(0, 500)}...`);
      }
      
      if (error instanceof DuckDuckGoError) throw error;
      throw new DuckDuckGoError(
        ErrorCodes[ErrorType.PARSING],
        'Failed to parse news results',
        error,
        ErrorType.PARSING
      );
    } finally {
      if (page) await page.close();
      await this.close();
    }
  }
} 