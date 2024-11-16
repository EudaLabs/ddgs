import { DuckDuckGoService } from '../src/services';
import { DuckDuckGoError } from '../src/errors';
import type { NewsResult } from '../src/services/news';

describe('DuckDuckGoService - News', () => {
  let ddg: DuckDuckGoService;
  let newsResults: NewsResult[];

  beforeAll(async () => {
    ddg = new DuckDuckGoService();
    newsResults = await ddg.searchNews('test');
  });

  afterAll(async () => {
    await ddg.close();
  });

  it('should return basic news results', () => {
    expect(newsResults.length).toBeGreaterThan(0);
    expect(newsResults[0]).toMatchObject({
      title: expect.any(String),
      url: expect.stringMatching(/^https?:\/\//),
    });
  });

  it('should include news metadata when available', () => {
    const firstResult = newsResults[0];
    
    if (firstResult.source) {
      expect(firstResult.source).toBeTruthy();
      expect(firstResult.source.length).toBeGreaterThan(0);
    }
    if (firstResult.time) {
      expect(firstResult.time).toBeTruthy();
      expect(firstResult.time.length).toBeGreaterThan(0);
    }
    if (firstResult.snippet) {
      expect(firstResult.snippet.length).toBeGreaterThan(10);
    }
  });

  it('should handle current events search', async () => {
    const results = await ddg.searchNews('breaking news');
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      expect(result.title).toBeTruthy();
      expect(result.url).toMatch(/^https?:\/\//);
    }
  });

  it('should handle technical news search', async () => {
    const results = await ddg.searchNews('technology news');
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      expect(result.title).toBeTruthy();
      expect(result.url).toMatch(/^https?:\/\//);
    }
  });

  it('should validate news result structure', () => {
    for (const result of newsResults) {
      expect(result).toMatchObject({
        title: expect.any(String),
        url: expect.stringMatching(/^https?:\/\//),
      });

      // Additional validations
      expect(result.title.length).toBeGreaterThan(0);
      expect(result.url.length).toBeGreaterThan(0);
      
      if (result.source) {
        expect(result.source.length).toBeGreaterThan(0);
      }
      if (result.snippet) {
        expect(result.snippet.length).toBeGreaterThan(0);
      }
      if (result.time) {
        expect(result.time.length).toBeGreaterThan(0);
      }
    }
  });

  it('should return unique results', () => {
    const uniqueUrls = new Set(newsResults.map(r => r.url));
    expect(uniqueUrls.size).toBe(newsResults.length);
  });

  it('should handle empty queries', async () => {
    await expect(ddg.searchNews('')).rejects.toThrow(DuckDuckGoError);
  });

  it('should handle invalid queries', async () => {
    await expect(ddg.searchNews('   ')).rejects.toThrow(DuckDuckGoError);
  });
}); 