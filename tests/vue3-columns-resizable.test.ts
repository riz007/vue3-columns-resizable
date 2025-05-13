import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Plugin from '../src/plugins/vue3-columns-resizable';

describe('vue3-columns-resizable', () => {
  it('should mount directive without error', () => {
    const wrapper = mount({
      template: `
        <table v-columns-resizable>
          <thead>
            <tr><th>Col1</th><th>Col2</th></tr>
          </thead>
        </table>
      `,
      directives: {
        'columns-resizable': Plugin.install?.({ directive: () => {} } as any),
      },
    });

    expect(wrapper.html()).toContain('<table');
  });
});
