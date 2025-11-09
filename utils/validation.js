/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Validation utilities for user input
 */

const MAX_QUERY_LENGTH = 500;
const MIN_QUERY_LENGTH = 1;

// Patterns that might indicate malicious input
const SUSPICIOUS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i, // Event handlers like onclick=
  /<iframe/i,
  /eval\(/i,
];

/**
 * Validates a search query
 * @param {string} query - The search query to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateSearchQuery(query) {
  // Check if query exists
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Query must be a non-empty string' };
  }

  // Trim whitespace
  const trimmed = query.trim();

  // Check length
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return { valid: false, error: 'Query is too short' };
  }

  if (trimmed.length > MAX_QUERY_LENGTH) {
    return { valid: false, error: `Query is too long (max ${MAX_QUERY_LENGTH} characters)` };
  }

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: 'Query contains invalid characters' };
    }
  }

  return { valid: true };
}

/**
 * Sanitizes user input by removing potentially dangerous content
 * @param {string} input - The input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Limit to printable characters and common punctuation
    .replace(/[^\w\s\-.,!?'":;()]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .substring(0, MAX_QUERY_LENGTH);
}

/**
 * Validates a node ID
 * @param {string} nodeId - The node ID to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateNodeId(nodeId) {
  if (!nodeId || typeof nodeId !== 'string') {
    return { valid: false, error: 'Node ID must be a non-empty string' };
  }

  // Node IDs should match pattern: "type:label"
  const nodeIdPattern = /^(book|author|theme):.+$/;

  if (!nodeIdPattern.test(nodeId)) {
    return { valid: false, error: 'Invalid node ID format' };
  }

  return { valid: true };
}

/**
 * Validates a year for timeline filtering
 * @param {number} year - The year to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateYear(year) {
  const currentYear = new Date().getFullYear();
  const minYear = 1000; // Earliest reasonable publication year

  if (typeof year !== 'number' || isNaN(year)) {
    return { valid: false, error: 'Year must be a number' };
  }

  if (year < minYear || year > currentYear + 10) {
    return { valid: false, error: `Year must be between ${minYear} and ${currentYear + 10}` };
  }

  return { valid: true };
}
