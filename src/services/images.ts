import type { Page } from 'puppeteer';
import { BaseService } from './base';
import { DuckDuckGoError, ErrorType, ErrorCodes } from '../errors';
import { BASE_URL } from './base';
import { selectors } from '../selectors';

export interface ImageResult {
  title: string;
  imageUrl: string;
  pageUrl: string;
  dimensions?: string;
  size?: string;
}

export class ImageService extends BaseService {
  async searchImages(query: string): Promise<ImageResult[]> {
    this.validateQuery(query);

    const browser = await this.initBrowser();
    let page: Page | null = null;

    try {
      page = await browser.newPage();
      this.log('Page created');

      await this.setupPage(page);
      this.log('Page configured');

      const url = `${BASE_URL}/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
      this.log(`Navigating to: ${url}`);
      
      await page.goto(url, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: this.config.timeout,
      });
      this.log('Page loaded');

      await page.waitForSelector(selectors.images.resultItem[0], { timeout: this.config.timeout });
      this.log('Results container found');

      const html = await page.content();
      this.log(`Current HTML structure: ${JSON.stringify({
        length: html.length,
        hasImageResults: html.includes('tile--img'),
        sample: html.substring(0, 500)
      }, null, 2)}`);

      const results = await page.evaluate(
        /* istanbul ignore next */
        (imageSelectors) => {
        const imageResults: ImageResult[] = [];
        
        const items = document.querySelectorAll(imageSelectors.resultItem[0]);
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const titleEl = item.querySelector(imageSelectors.title[0]);
          const imgEl = item.querySelector(imageSelectors.imageUrl[0]);
          const dimensionsText = item.textContent || '';
          
          const dimensionsMatch = dimensionsText.match(/(\d+\s*×\s*\d+)/);
          const dimensions = dimensionsMatch ? dimensionsMatch[0] : undefined;
          
          if (imgEl && titleEl) {
            const imageUrl = imgEl.getAttribute('src') || imgEl.getAttribute('data-src');
            const pageUrl = titleEl.getAttribute('href');

            if (imageUrl && pageUrl && imageUrl !== '#' && pageUrl !== '#') {
              const formattedImageUrl = imageUrl.startsWith('//') 
                ? `https:${imageUrl}`
                : imageUrl.startsWith('http') 
                  ? imageUrl 
                  : `https://${imageUrl}`;

              imageResults.push({
                title: titleEl.textContent?.trim() || '',
                imageUrl: formattedImageUrl,
                pageUrl: pageUrl.startsWith('http') ? pageUrl : `https://${pageUrl}`,
                dimensions,
                size: dimensions ? `${dimensions} pixels` : undefined
              });
            }
          }
        }

        return imageResults;
      }, selectors.images);

      this.log(`Results: ${JSON.stringify(results, null, 2)}`);

      if (results.length === 0) {
        throw new DuckDuckGoError(
          ErrorCodes[ErrorType.NOT_FOUND],
          'No image results found',
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
        'Failed to parse image results',
        error,
        ErrorType.PARSING
      );
    } finally {
      if (page) await page.close();
      await this.close();
    }
  }
} 