import { render, screen, fireEvent } from '@testing-library/react-native';
import { RichText } from '@presentation/ui/RichText';
import type { RichTextDocument } from '@core/contract/models/richText';

test('renders paragraphs, headings, formatted text and lists', async () => {
  const document: RichTextDocument = {
    root: {
      children: [
        { type: 'heading', tag: 'h1', children: [{ type: 'text', text: 'Privacy Notice' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Bold text', format: 1 }] },
        {
          type: 'list',
          listType: 'bullet',
          children: [
            { type: 'listitem', children: [{ type: 'text', text: 'First point' }] },
            { type: 'listitem', children: [{ type: 'text', text: 'Second point' }] },
          ],
        },
      ],
    },
  };

  await render(<RichText document={document} onLinkPress={jest.fn()} />);

  expect(screen.getByText('Privacy Notice')).toBeTruthy();
  expect(screen.getByText('Bold text')).toBeTruthy();
  expect(screen.getByText('First point')).toBeTruthy();
  expect(screen.getByText('Second point')).toBeTruthy();
});

test('a link navigates through the destination resolver via onLinkPress', async () => {
  const onLinkPress = jest.fn();
  const document: RichTextDocument = {
    root: {
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              fields: { url: 'https://casamaiz.example/terms' },
              children: [{ type: 'text', text: 'Terms of service' }],
            },
          ],
        },
      ],
    },
  };

  await render(<RichText document={document} onLinkPress={onLinkPress} />);
  fireEvent.press(screen.getByText('Terms of service'));

  expect(onLinkPress).toHaveBeenCalledWith('https://casamaiz.example/terms');
});

test('an unrecognised node renders its children where present and is otherwise skipped', async () => {
  const document: RichTextDocument = {
    root: {
      children: [
        { type: 'futureBlock', children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Still visible' }] }] },
        { type: 'anotherFutureBlock' },
      ],
    },
  };

  await render(<RichText document={document} onLinkPress={jest.fn()} />);
  expect(screen.getByText('Still visible')).toBeTruthy();
});
