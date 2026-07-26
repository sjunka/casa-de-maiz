import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

// Notices sit above the tab navigator, so their height comes straight out of
// the content's. At the largest text settings three of them fill the viewport
// and leave nothing reachable, so the stack is capped and scrolls internally
// past that point instead of pushing the app off screen.
const MAX_SHARE_OF_SCREEN = '40%';

export const NoticeStack = ({ children }: { children: ReactNode }) => (
  <ScrollView
    style={styles.stack}
    contentContainerStyle={styles.content}
    bounces={false}
    testID="notice-stack"
  >
    {children}
  </ScrollView>
);

const styles = StyleSheet.create({
  stack: { flexGrow: 0, maxHeight: MAX_SHARE_OF_SCREEN },
  content: { flexGrow: 0 },
});
