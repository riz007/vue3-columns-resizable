import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Plugin from '../src/plugins/vue3-columns-resizable';

const Table = {
  template: `
    <table v-columns-resizable>
      <thead>
        <tr><th>Col1</th><th>Col2</th></tr>
      </thead>
    </table>
  `,
};

describe('vue3-columns-resizable', () => {
  it('registers the directive and injects a resize container with a bar between columns', () => {
    const wrapper = mount(Table, {
      global: { plugins: [Plugin] },
      attachTo: document.body,
    });

    expect(wrapper.html()).toContain('<table');
    // The directive inserts a container as a sibling before the table...
    expect(document.querySelector('.vue3-columns-resizable')).not.toBeNull();
    // ...with one resize bar for the boundary between the two columns.
    expect(document.querySelectorAll('.columns-resize-bar').length).toBe(1);

    wrapper.unmount();
  });

  it('removes the injected container on unmount', () => {
    const wrapper = mount(Table, {
      global: { plugins: [Plugin] },
      attachTo: document.body,
    });
    expect(document.querySelector('.vue3-columns-resizable')).not.toBeNull();

    wrapper.unmount();

    expect(document.querySelector('.vue3-columns-resizable')).toBeNull();
  });
});

// Regression guard: bars used to be measured synchronously in `mounted`, so in
// async-rendered tables (e.g. Vuetify) they got height 0 and were invisible
// until a parent `:key` forced a remount. Positioning must happen once the
// table actually has dimensions (driven by rAF / ResizeObserver).
describe('deferred layout', () => {
  let resizeCallback: ResizeObserverCallback | null = null;
  const originalResizeObserver = globalThis.ResizeObserver;

  beforeEach(() => {
    resizeCallback = null;
    globalThis.ResizeObserver = class {
      constructor(cb: ResizeObserverCallback) {
        resizeCallback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;

    // jsdom reports 0 for all geometry; pretend the table has been laid out.
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(40);
    vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockReturnValue(150);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.ResizeObserver = originalResizeObserver;
  });

  it('gives bars a real height and position once the table has dimensions', () => {
    mount(Table, { global: { plugins: [Plugin] }, attachTo: document.body });

    const bar = document.querySelector<HTMLElement>('.columns-resize-bar');
    expect(bar).not.toBeNull();

    // Simulate the table finishing layout — the ResizeObserver fires.
    resizeCallback?.([], {} as ResizeObserver);

    expect(bar!.style.height).toBe('40px');
    expect(bar!.style.left).toBe('146px'); // offsetLeft (150) - 4
  });
});
