import {describe, it, expect} from 'vitest';
import {extractSignals} from '@/lib/analyzer';

describe('extractSignals', () => {
  it('parses basic meta and counts', () => {
    const html = `
      <html>
        <head>
          <title>Test</title>
          <meta name="description" content="Desc" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="canonical" href="https://example.com" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body>
          <h1>Heading</h1>
          <img width="100" height="100" />
          <script></script>
          <a href="/privacy">Privacy</a>
        </body>
      </html>
    `;
    const s = extractSignals(html, 'https://example.com');
    expect(s.title).toBe('Test');
    expect(s.metaDescription).toBe('Desc');
    expect(s.h1).toBe('Heading');
    expect(s.hasViewportMeta).toBe(true);
    expect(s.favicon).toBe(true);
    expect(s.imgCount).toBe(1);
    expect(s.scriptCount).toBe(1);
    expect(s.privacyPolicyUrlFound).toBe(true);
    expect(s.hasHTTPS).toBe(true);
  });
});



