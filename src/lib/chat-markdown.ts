/**
 * Convert bare URLs to markdown links, `[url](url)`, leaving URLs that are
 * already inside `[text](url)` alone. Idempotent, so it can run on every
 * chunk of a streamed answer: a URL split across chunks simply grows.
 */
export function formatUrlsAsMarkdown(text: string): string {
  const urlRegex = /(?<!\]\()(?<!\[)https?:\/\/[^\s\[\]]+/g;
  return text.replace(urlRegex, (url) => `[${url}](${url})`);
}
