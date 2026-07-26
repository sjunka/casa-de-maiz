import { Platform } from 'react-native';
import { AppPressable } from './AppPressable';

test('android gets a ripple with the given color; ios gets none', () => {
  Platform.OS = 'android';
  const androidElement = AppPressable({ rippleColor: '#000', children: null });
  expect(androidElement.props.android_ripple).toEqual({ color: '#000' });

  Platform.OS = 'ios';
  const iosElement = AppPressable({ children: null });
  expect(iosElement.props.android_ripple).toBeUndefined();
});

test('ios applies opacity feedback while pressed; android relies on the ripple instead', () => {
  Platform.OS = 'ios';
  const element = AppPressable({ style: { padding: 4 }, children: null });
  expect(element.props.style({ pressed: true })).toEqual([{ padding: 4 }, { opacity: 0.6 }]);
  expect(element.props.style({ pressed: false })).toEqual([{ padding: 4 }, false]);

  Platform.OS = 'android';
  const androidElement = AppPressable({ style: { padding: 4 }, children: null });
  expect(androidElement.props.style({ pressed: true })).toEqual([{ padding: 4 }, false]);
});
