import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost/' });
(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;
(globalThis as any).navigator = dom.window.navigator;
(globalThis as any).HTMLElement = dom.window.HTMLElement;
(globalThis as any).Node = dom.window.Node;
(globalThis as any).MutationObserver = dom.window.MutationObserver;
(globalThis as any).getComputedStyle = dom.window.getComputedStyle;
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
const { createRoot } = await import('react-dom/client');
const { default: App } = await import('./src/App');
try {
  const root = createRoot(document.getElementById('root')!);
  root.render(<App />);
  await new Promise((r) => setTimeout(r, 100));
  console.log('CLIENT_OK', document.getElementById('root')?.innerHTML.length ?? 0);
} catch (error) {
  console.error('CLIENT_ERROR');
  console.error(error);
  process.exit(1);
}
