import { Link } from '@tiptap/extension-link';
import { contentLinkAttributes } from './content-links';

// Preserve Tiptap's URI validation while normalizing pasted and legacy attributes.
export const ContentLink = Link.extend({
  renderHTML(props) {
    return this.parent!({
      ...props,
      HTMLAttributes: {
        ...props.HTMLAttributes,
        ...contentLinkAttributes(props.HTMLAttributes),
      },
    });
  },
}).configure({
  openOnClick: false,
  HTMLAttributes: {
    class: 'text-blue-600 underline cursor-pointer',
    target: null,
    rel: null,
  },
});
