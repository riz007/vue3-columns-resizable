import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
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
