import type { SearchResult, GoogleBooksVolume } from '../types';

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

export class GoogleBooksService {
  private cache: Map<string, any> = new Map();
  private apiKey?: string;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async searchBooks(query: string, maxResults: number = 10): Promise<SearchResult[]> {
    const cacheKey = `search:${query}:${maxResults}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const url = new URL(BASE_URL);
      url.searchParams.set('q', query);
      url.searchParams.set('maxResults', maxResults.toString());
      if (this.apiKey) {
        url.searchParams.set('key', this.apiKey);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.statusText}`);
      }

      const data = await response.json();
      const results: SearchResult[] = (data.items || []).map((item: GoogleBooksVolume) => {
        const { volumeInfo } = item;
        return {
          id: item.id,
          type: 'book' as const,
          title: volumeInfo.title,
          author: volumeInfo.authors?.[0],
          year: volumeInfo.publishedDate
            ? parseInt(volumeInfo.publishedDate.split('-')[0])
            : undefined,
          description: volumeInfo.description,
          coverUrl: volumeInfo.imageLinks?.thumbnail,
          source: 'google' as const,
          metadata: {
            authors: volumeInfo.authors || [],
            categories: volumeInfo.categories || [],
            pageCount: volumeInfo.pageCount,
            language: volumeInfo.language,
            isbn: volumeInfo.industryIdentifiers?.find((id) => id.type === 'ISBN_13')
              ?.identifier,
            googleBooksId: item.id,
          },
        };
      });

      this.cache.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Google Books search error:', error);
      return [];
    }
  }

  async getVolumeDetails(volumeId: string): Promise<GoogleBooksVolume | null> {
    const cacheKey = `volume:${volumeId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const url = new URL(`${BASE_URL}/${volumeId}`);
      if (this.apiKey) {
        url.searchParams.set('key', this.apiKey);
      }

      const response = await fetch(url.toString());
      if (!response.ok) return null;

      const volume = await response.json();
      this.cache.set(cacheKey, volume);
      return volume;
    } catch (error) {
      console.error('Google Books volume details error:', error);
      return null;
    }
  }

  async searchByAuthor(author: string, maxResults: number = 20): Promise<SearchResult[]> {
    return this.searchBooks(`inauthor:${author}`, maxResults);
  }

  async searchBySubject(subject: string, maxResults: number = 20): Promise<SearchResult[]> {
    return this.searchBooks(`subject:${subject}`, maxResults);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const googleBooksService = new GoogleBooksService();
