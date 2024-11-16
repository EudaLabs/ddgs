import type { Page } from 'puppeteer';
import { BaseService } from './base';
import type { SearchResult, AboutResult } from '../types';
import { DuckDuckGoError, ErrorType, ErrorCodes } from '../errors';
import { BASE_URL } from './base';
import { selectors } from '../selectors';

export class SearchService extends BaseService {
  async search(query: string): Promise<{ results: SearchResult[]; about?: AboutResult }> {
    this.validateQuery(query);

    const browser = await this.initBrowser();
    let page: Page | null = null;

    try {
      page = await browser.newPage();
      this.log('Page created');

      await this.setupPage(page);
      this.log('Page configured');

      const url = `${BASE_URL}/?q=${encodeURIComponent(query)}&kl=${this.config.region}`;
      this.log(`Navigating to: ${url}`);
      
      await page.goto(url, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: this.config.timeout,
      });
      this.log('Page loaded');

      // Wait for results container
      await page.waitForSelector('.react-results--main', { timeout: this.config.timeout });
      this.log('Results container found');

      // Extract search results
      const results = await page.evaluate(
        /* istanbul ignore next */
        (searchSelectors) => {
        const searchResults = [];
        
        // Find all result articles using selector from selectors.ts
        const articles = document.querySelectorAll(searchSelectors.resultItem[0]);

        for (let i = 0; i < articles.length; i++) {
          const article = articles[i];
          const titleEl = article.querySelector(searchSelectors.title[0]);
          const snippetEl = article.querySelector(searchSelectors.snippet[0]);
          const urlEl = article.querySelector(searchSelectors.url[0]);
          const domainEl = article.querySelector(searchSelectors.domain[0]);

          if (titleEl) {
            const url = titleEl.getAttribute('href');
            // Only add results with valid URLs
            if (url && url !== '#') {
              const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
              
              searchResults.push({
                title: titleEl.textContent?.trim()?.replace('Your browser indicates if you\'ve visited this link', '') || '',
                url: formattedUrl,
                snippet: snippetEl?.textContent?.trim() || '',
                position: i + 1,
                domain: domainEl?.textContent?.trim()?.replace(/Only include results for this siteHide site from these resultsShare feedback about this site/, '') || '',
              });
            }
          }
        }

        return searchResults;
      }, selectors.search);

      this.log(`Results: ${JSON.stringify(results, null, 2)}`);

      if (results.length === 0) {
        throw new DuckDuckGoError(
          ErrorCodes[ErrorType.NOT_FOUND],
          'No results found',
          undefined,
          ErrorType.NOT_FOUND
        );
      }

      return { results };

    } catch (error: unknown) {
      this.logError(error);
      
      if (page) {
        const html = await page.content();
        this.log(`Current HTML: ${html.substring(0, 500)}...`);
      }
      
      if (error instanceof DuckDuckGoError) throw error;
      throw new DuckDuckGoError(
        ErrorCodes[ErrorType.PARSING],
        'Failed to parse search results',
        error,
        ErrorType.PARSING
      );
    } finally {
      if (page) await page.close();
      await this.close();
    }
  }
} 