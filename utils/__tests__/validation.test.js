/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect } from 'vitest';
import {
  validateSearchQuery,
  sanitizeInput,
  validateNodeId,
  validateYear
} from '../validation';

describe('validateSearchQuery', () => {
  it('should accept valid queries', () => {
    const result = validateSearchQuery('The Great Gatsby');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject empty queries', () => {
    const result = validateSearchQuery('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should reject non-string queries', () => {
    const result = validateSearchQuery(null);
    expect(result.valid).toBe(false);
  });

  it('should reject queries with script tags', () => {
    const result = validateSearchQuery('<script>alert("xss")</script>');
    expect(result.valid).toBe(false);
  });

  it('should reject queries that are too long', () => {
    const longQuery = 'a'.repeat(501);
    const result = validateSearchQuery(longQuery);
    expect(result.valid).toBe(false);
  });

  it('should reject queries with javascript: protocol', () => {
    const result = validateSearchQuery('javascript:alert(1)');
    expect(result.valid).toBe(false);
  });
});

describe('sanitizeInput', () => {
  it('should remove HTML tags', () => {
    const result = sanitizeInput('<b>Hello</b> World');
    expect(result).toBe('Hello World');
  });

  it('should remove script tags', () => {
    const result = sanitizeInput('Hello <script>alert(1)</script> World');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
  });

  it('should trim whitespace', () => {
    const result = sanitizeInput('  Hello World  ');
    expect(result).toBe('Hello World');
  });

  it('should handle null input', () => {
    const result = sanitizeInput(null);
    expect(result).toBe('');
  });

  it('should limit length', () => {
    const longInput = 'a'.repeat(600);
    const result = sanitizeInput(longInput);
    expect(result.length).toBeLessThanOrEqual(500);
  });
});

describe('validateNodeId', () => {
  it('should accept valid book node IDs', () => {
    const result = validateNodeId('book:The Great Gatsby');
    expect(result.valid).toBe(true);
  });

  it('should accept valid author node IDs', () => {
    const result = validateNodeId('author:F. Scott Fitzgerald');
    expect(result.valid).toBe(true);
  });

  it('should accept valid theme node IDs', () => {
    const result = validateNodeId('theme:American Dream');
    expect(result.valid).toBe(true);
  });

  it('should reject invalid format', () => {
    const result = validateNodeId('invalid-format');
    expect(result.valid).toBe(false);
  });

  it('should reject empty string', () => {
    const result = validateNodeId('');
    expect(result.valid).toBe(false);
  });

  it('should reject invalid node type', () => {
    const result = validateNodeId('movie:Inception');
    expect(result.valid).toBe(false);
  });
});

describe('validateYear', () => {
  it('should accept valid years', () => {
    const result = validateYear(2024);
    expect(result.valid).toBe(true);
  });

  it('should reject years that are too old', () => {
    const result = validateYear(999);
    expect(result.valid).toBe(false);
  });

  it('should reject years too far in the future', () => {
    const currentYear = new Date().getFullYear();
    const result = validateYear(currentYear + 20);
    expect(result.valid).toBe(false);
  });

  it('should reject non-numeric years', () => {
    const result = validateYear('2024');
    expect(result.valid).toBe(false);
  });

  it('should reject NaN', () => {
    const result = validateYear(NaN);
    expect(result.valid).toBe(false);
  });
});
