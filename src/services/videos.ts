import type { Page } from 'puppeteer';
import { BaseService } from './base';
import { DuckDuckGoError, ErrorType, ErrorCodes } from '../errors';
import { BASE_URL } from './base';
import { selectors } from '../selectors';

export interface VideoResult {
  title: string;
  url: string;
  thumbnailUrl?: string;
  duration?: string;
  views?: string;
  channel?: string;
}

export class VideoService extends BaseService {
  async searchVideos(query: string): Promise<VideoResult[]> {
    this.validateQuery(query);

    const browser = await this.initBrowser();
    let page: Page | null = null;

    try {
      page = await browser.newPage();
      this.log('Page created');

      await this.setupPage(page);
      this.log('Page configured');

      const url = `${BASE_URL}/?q=${encodeURIComponent(query)}&iax=videos&ia=videos`;
      this.log(`Navigating to: ${url}`);
      
      await page.goto(url, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: this.config.timeout,
      });
      this.log('Page loaded');

      await page.waitForSelector(selectors.videos.resultItem[0], { timeout: this.config.timeout });
      this.log('Results container found');

      const html = await page.content();
      this.log(`Current HTML structure: ${JSON.stringify({
        length: html.length,
        hasVideoResults: html.includes('tile--vid'),
        sample: html.substring(0, 500)
      }, null, 2)}`);

      const results = await page.evaluate(
        /* istanbul ignore next */
        (videoSelectors) => {
        const videoResults: VideoResult[] = [];
        
        const items = document.querySelectorAll(videoSelectors.resultItem[0]);
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const titleEl = item.querySelector(videoSelectors.title[0]);
          const bodyEl = item.querySelector(videoSelectors.body[0]);
          const durationEl = item.querySelector(videoSelectors.duration[0]);
          const thumbnailEl = item.querySelector(videoSelectors.thumbnail[0]);
          const viewsMatch = bodyEl?.textContent?.match(/YouTube(.*?)views/);
          
          if (titleEl) {
            const url = titleEl.getAttribute('href');
            if (url && url !== '#') {
              const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
              const thumbnailUrl = thumbnailEl?.getAttribute('src') || thumbnailEl?.getAttribute('data-src');
              const formattedThumbnailUrl = thumbnailUrl ? (
                thumbnailUrl.startsWith('//') 
                  ? `https:${thumbnailUrl}`
                  : thumbnailUrl.startsWith('http')
                    ? thumbnailUrl
                    : `https://${thumbnailUrl}`
              ) : undefined;

              const result: VideoResult = {
                title: titleEl.textContent?.trim().replace('Your browser indicates if you\'ve visited this link', '') || '',
                url: formattedUrl,
              };

              if (durationEl) {
                result.duration = durationEl.textContent?.trim();
              }

              if (formattedThumbnailUrl) {
                result.thumbnailUrl = formattedThumbnailUrl;
              }

              if (viewsMatch) {
                result.views = `${viewsMatch[1].trim()} views`;
              }

              videoResults.push(result);
            }
          }
        }

        return videoResults;
      }, selectors.videos);

      this.log(`Results: ${JSON.stringify(results, null, 2)}`);

      if (results.length === 0) {
        throw new DuckDuckGoError(
          ErrorCodes[ErrorType.NOT_FOUND],
          'No video results found',
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
        'Failed to parse video results',
        error,
        ErrorType.PARSING
      );
    } finally {
      if (page) await page.close();
      await this.close();
    }
  }
} 