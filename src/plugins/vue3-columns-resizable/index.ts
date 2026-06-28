import type { App } from 'vue';

interface ResizableState {
  cleanup: () => void;
}

// Track per-element teardown so listeners and injected DOM can be removed on unmount.
const stateMap = new WeakMap<HTMLElement, ResizableState>();

const columnsResizableDirective = {
  mounted(el: HTMLElement) {
    // Guard against SSR / non-DOM environments.
    if (typeof document === 'undefined') return;

    const nodeName = el.nodeName;
    if (!['TABLE', 'THEAD'].includes(nodeName)) return;

    const table = nodeName === 'TABLE' ? el : (el.parentElement as HTMLElement | null);
    if (!table) return;

    const thead = table.querySelector('thead');
    const ths = Array.from(thead?.querySelectorAll('th') ?? []);
    if (ths.length === 0) return;

    const barHeight = nodeName === 'TABLE' ? table.offsetHeight : thead?.offsetHeight ?? 0;

    const resizeContainer = document.createElement('div');
    table.style.position = 'relative';
    resizeContainer.style.position = 'relative';
    resizeContainer.style.width = `${table.offsetWidth}px`;
    resizeContainer.className = 'vue3-columns-resizable';
    table.parentElement?.insertBefore(resizeContainer, table);

    let moving = false;
    let movingIndex = 0;

    ths.forEach((th, index) => {
      th.style.width = `${th.offsetWidth}px`;

      if (index + 1 >= ths.length) return;

      const nextTh = ths[index + 1];
      if (!nextTh) return;

      const bar = document.createElement('div');

      bar.style.position = 'absolute';
      bar.style.left = `${nextTh.offsetLeft - 4}px`;
      bar.style.top = '0';
      bar.style.height = `${barHeight}px`;
      bar.style.width = '8px';
      bar.style.cursor = 'col-resize';
      bar.style.zIndex = '1';
      bar.className = 'columns-resize-bar';

      bar.addEventListener('mousedown', () => {
        moving = true;
        movingIndex = index;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      });

      resizeContainer.appendChild(bar);
    });

    const bars = Array.from(resizeContainer.querySelectorAll<HTMLElement>('.columns-resize-bar'));

    const cutPx = (str: string): number => +str.replace('px', '');

    const onMouseUp = () => {
      if (!moving) return;

      moving = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      bars.forEach((bar, index) => {
        const th = ths[index];
        const nextTh = ths[index + 1];
        if (th) th.style.width = `${th.offsetWidth}px`;
        if (nextTh) bar.style.left = `${nextTh.offsetLeft - 4}px`;
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

    // Remember how to undo everything this directive added.
    stateMap.set(el, {
      cleanup() {
        document.removeEventListener('mouseup', onMouseUp);
        resizeContainer.removeEventListener('mousemove', handleResize);
        table.removeEventListener('mousemove', handleResize);
        resizeContainer.remove();
      },
    });
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
