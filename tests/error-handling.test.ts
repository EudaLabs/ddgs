import { DuckDuckGoService } from '../src/services';
import { DuckDuckGoError, ErrorType } from '../src/errors';

describe('DuckDuckGoService - Error Handling', () => {
  let ddg: DuckDuckGoService;

  beforeEach(() => {
    ddg = new DuckDuckGoService();
  });

  afterEach(async () => {
    await ddg.close();
  });

  it('should handle empty queries', async () => {
    await expect(ddg.search('')).rejects.toThrow(DuckDuckGoError);
    await expect(ddg.searchImages('')).rejects.toThrow(DuckDuckGoError);
    await expect(ddg.searchVideos('')).rejects.toThrow(DuckDuckGoError);
    await expect(ddg.searchNews('')).rejects.toThrow(DuckDuckGoError);
  });

  it('should handle invalid queries', async () => {
    await expect(ddg.search('   ')).rejects.toThrow(DuckDuckGoError);
    await expect(ddg.searchImages('   ')).rejects.toThrow(DuckDuckGoError);
    await expect(ddg.searchVideos('   ')).rejects.toThrow(DuckDuckGoError);
    await expect(ddg.searchNews('   ')).rejects.toThrow(DuckDuckGoError);
  });

  it('should handle timeouts', async () => {
    const shortTimeoutService = new DuckDuckGoService({ timeout: 1 });
    await expect(shortTimeoutService.search('test')).rejects.toThrow();
  });
}); 