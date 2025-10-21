import type { SearchResult, OpenLibraryWork } from '../types';

const BASE_URL = 'https://openlibrary.org';

export class OpenLibraryService {
  private cache: Map<string, any> = new Map();

  async searchBooks(query: string, limit: number = 10): Promise<SearchResult[]> {
    const cacheKey = `search:${query}:${limit}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(
        `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`OpenLibrary API error: ${response.statusText}`);
      }

      const data = await response.json();
      const results: SearchResult[] = data.docs.map((doc: any) => ({
        id: doc.key || `ol-${doc.edition_key?.[0] || Math.random()}`,
        type: 'book' as const,
        title: doc.title,
        author: doc.author_name?.[0],
        year: doc.first_publish_year,
        description: doc.first_sentence?.[0] || '',
        coverUrl: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : undefined,
        source: 'openlibrary' as const,
        metadata: {
          isbn: doc.isbn?.[0],
          subjects: doc.subject?.slice(0, 5) || [],
          publishers: doc.publisher?.slice(0, 3) || [],
          openLibraryId: doc.key,
        },
      }));

      this.cache.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error('OpenLibrary search error:', error);
      return [];
    }
  }

  async getWorkDetails(workId: string): Promise<OpenLibraryWork | null> {
    const cacheKey = `work:${workId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${BASE_URL}${workId}.json`);
      if (!response.ok) return null;

      const work = await response.json();
      this.cache.set(cacheKey, work);
      return work;
    } catch (error) {
      console.error('OpenLibrary work details error:', error);
      return null;
    }
  }

  async getAuthorWorks(authorId: string, limit: number = 20): Promise<any[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/authors/${authorId}/works.json?limit=${limit}`
      );
      if (!response.ok) return [];

      const data = await response.json();
      return data.entries || [];
    } catch (error) {
      console.error('OpenLibrary author works error:', error);
      return [];
    }
  }

  async searchAuthors(query: string): Promise<SearchResult[]> {
    const cacheKey = `author-search:${query}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(
        `${BASE_URL}/search/authors.json?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) return [];

      const data = await response.json();
      const results: SearchResult[] = data.docs.slice(0, 10).map((doc: any) => ({
        id: doc.key || `author-${Math.random()}`,
        type: 'author' as const,
        title: doc.name,
        year: doc.birth_date ? parseInt(doc.birth_date) : undefined,
        description: doc.top_work || '',
        source: 'openlibrary' as const,
        metadata: {
          workCount: doc.work_count || 0,
          topSubjects: doc.top_subjects?.slice(0, 5) || [],
          openLibraryId: doc.key,
        },
      }));

      this.cache.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error('OpenLibrary author search error:', error);
      return [];
    }
  }

  async getSubjectBooks(subject: string, limit: number = 20): Promise<any[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/subjects/${encodeURIComponent(subject)}.json?limit=${limit}`
      );
      if (!response.ok) return [];

      const data = await response.json();
      return data.works || [];
    } catch (error) {
      console.error('OpenLibrary subject books error:', error);
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const openLibraryService = new OpenLibraryService();
