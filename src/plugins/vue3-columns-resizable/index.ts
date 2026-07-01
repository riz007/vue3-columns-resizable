import type { App } from 'vue';

interface ResizableState {
  cleanup: () => void;
}

// Track per-element teardown so listeners, observers and injected DOM can be
// removed on unmount.
const stateMap = new WeakMap<HTMLElement, ResizableState>();

function setup(el: HTMLElement): (() => void) | void {
  // Guard against SSR / non-DOM environments.
  if (typeof document === 'undefined') return;

  const nodeName = el.nodeName;
  if (!['TABLE', 'THEAD'].includes(nodeName)) return;

  const table = nodeName === 'TABLE' ? el : (el.parentElement as HTMLElement | null);
  if (!table) return;

  const thead = table.querySelector('thead');
  const ths = Array.from(thead?.querySelectorAll('th') ?? []);
  if (ths.length === 0) return;

  table.style.position = 'relative';

  const resizeContainer = document.createElement('div');
  resizeContainer.className = 'vue3-columns-resizable';
  resizeContainer.style.position = 'relative';
  table.parentElement?.insertBefore(resizeContainer, table);

  let moving = false;
  let movingIndex = 0;
  let widthsFixed = false;

  // One draggable bar per column boundary (every column except the last).
  const bars: HTMLElement[] = [];
  ths.forEach((_, index) => {
    if (index + 1 >= ths.length) return;

    const bar = document.createElement('div');
    bar.className = 'columns-resize-bar';
    bar.style.position = 'absolute';
    bar.style.top = '0';
    bar.style.width = '8px';
    bar.style.cursor = 'col-resize';
    bar.style.zIndex = '1';

    bar.addEventListener('mousedown', () => {
      moving = true;
      movingIndex = index;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });

    bars[index] = bar;
    resizeContainer.appendChild(bar);
  });

  const cutPx = (value: string): number => parseFloat(value) || 0;

  // Measure the rendered table and (re)position the bars. Safe to call
  // repeatedly: it only pins column widths once a real layout is available,
  // and does nothing mid-drag.
  const layout = () => {
    if (moving) return;

    const tableWidth = table.offsetWidth;
    const barHeight = nodeName === 'TABLE' ? table.offsetHeight : thead?.offsetHeight ?? 0;

    // Nothing has been laid out yet (styles not applied, table hidden, async
    // content still pending). Bail — the ResizeObserver will call us again
    // once the table has real dimensions.
    if (tableWidth === 0 || barHeight === 0) return;

    resizeContainer.style.width = `${tableWidth}px`;

    // Pin each column to its rendered width once, so dragging redistributes
    // pixels instead of fighting the browser's automatic table layout.
    if (!widthsFixed) {
      ths.forEach((th) => {
        th.style.width = `${th.offsetWidth}px`;
      });
      widthsFixed = true;
    }

    ths.forEach((_, index) => {
      const bar = bars[index];
      const nextTh = ths[index + 1];
      if (!bar || !nextTh) return;
      bar.style.height = `${barHeight}px`;
      bar.style.left = `${nextTh.offsetLeft - 4}px`;
    });
  };

  const onMouseUp = () => {
    if (!moving) return;

    moving = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    // Snap bars back to the final column boundaries.
    ths.forEach((th, index) => {
      const bar = bars[index];
      const nextTh = ths[index + 1];
      th.style.width = `${th.offsetWidth}px`;
      if (bar && nextTh) bar.style.left = `${nextTh.offsetLeft - 4}px`;
    });
  };

  const handleResize = (e: MouseEvent) => {
    if (!moving) return;

    const th = ths[movingIndex];
    const nextTh = ths[movingIndex + 1];
    const bar = bars[movingIndex];
    if (!th || !nextTh || !bar) return;

    const delta = e.movementX;
    const newThWidth = cutPx(th.style.width) + delta;
    const newNextThWidth = cutPx(nextTh.style.width) - delta;

    th.style.width = `${newThWidth}px`;
    nextTh.style.width = `${newNextThWidth}px`;
    bar.style.left = `${nextTh.offsetLeft - 4 + delta}px`;

    // Emit event from the root element where the directive is applied.
    el.dispatchEvent(
      new CustomEvent('column-resized', {
        detail: {
          index: movingIndex,
          width: newThWidth,
          nextIndex: movingIndex + 1,
          nextWidth: newNextThWidth,
        },
        bubbles: true,
      }),
    );
  };

  document.addEventListener('mouseup', onMouseUp);
  resizeContainer.addEventListener('mousemove', handleResize);
  table.addEventListener('mousemove', handleResize);

  // The initial positioning must wait for the browser to lay the table out.
  // Running synchronously in `mounted` reads zero/stale offsets — that is why
  // bars used to be invisible (height 0) until a parent `:key` forced a
  // remount. A double rAF ensures a completed layout pass first.
  let rafId = requestAnimationFrame(() => {
    rafId = requestAnimationFrame(layout);
  });

  // Keep bars aligned as the table's size changes afterwards: a Vuetify data
  // table populating rows, responsive breakpoints, fonts loading, etc.
  const resizeObserver =
    typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => layout()) : null;
  resizeObserver?.observe(table);

  return () => {
    cancelAnimationFrame(rafId);
    resizeObserver?.disconnect();
    document.removeEventListener('mouseup', onMouseUp);
    resizeContainer.removeEventListener('mousemove', handleResize);
    table.removeEventListener('mousemove', handleResize);
    resizeContainer.remove();
  };
}

const columnsResizableDirective = {
  mounted(el: HTMLElement) {
    const cleanup = setup(el);
    if (cleanup) stateMap.set(el, { cleanup });
  },

  unmounted(el: HTMLElement) {
    const state = stateMap.get(el);
    if (!state) return;
    state.cleanup();
    stateMap.delete(el);
  },
};

export default {
  install(app: App) {
    app.directive('columns-resizable', columnsResizableDirective);
  },
};
