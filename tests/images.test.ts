import { DuckDuckGoService } from '../src/services';
import { DuckDuckGoError } from '../src/errors';
import type { ImageResult } from '../src/services/images';

describe('DuckDuckGoService - Images', () => {
  let ddg: DuckDuckGoService;
  let imageResults: ImageResult[];

  beforeAll(async () => {
    ddg = new DuckDuckGoService();
    imageResults = await ddg.searchImages('test');
  });

  afterAll(async () => {
    await ddg.close();
  });

  it('should return basic image results', () => {
    expect(imageResults.length).toBeGreaterThan(0);
    expect(imageResults[0]).toMatchObject({
      title: expect.any(String),
      imageUrl: expect.stringMatching(/^https?:\/\//),
      pageUrl: expect.stringMatching(/^https?:\/\//),
    });
  });

  it('should include image dimensions and size when available', () => {
    const firstResult = imageResults[0];
    
    if (firstResult.dimensions) {
      expect(firstResult.dimensions).toMatch(/\d+\s*×\s*\d+/);
    }
    if (firstResult.size) {
      expect(firstResult.size).toContain('pixels');
    }
  });

  it('should validate image result structure', () => {
    for (const result of imageResults) {
      expect(result).toMatchObject({
        title: expect.any(String),
        imageUrl: expect.stringMatching(/^https?:\/\//),
        pageUrl: expect.stringMatching(/^https?:\/\//),
      });
    }
  });

  it('should return unique results', () => {
    const uniqueUrls = new Set(imageResults.map(r => r.imageUrl));
    expect(uniqueUrls.size).toBe(imageResults.length);
  });

  it('should handle empty queries', async () => {
    await expect(ddg.searchImages('')).rejects.toThrow(DuckDuckGoError);
  });

  it('should handle invalid queries', async () => {
    await expect(ddg.searchImages('   ')).rejects.toThrow(DuckDuckGoError);
  });

  it('should handle timeouts', async () => {
    const shortTimeoutService = new DuckDuckGoService({ timeout: 1 });
    await expect(shortTimeoutService.searchImages('test')).rejects.toThrow();
  });
}); 