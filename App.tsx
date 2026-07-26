/**
 * @format
 */

import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from './src/api/queryClient';
import { BootstrapScreen } from './src/screens/BootstrapScreen';
import { navigationRef, getCurrentRouteName, flushPendingNavigation } from './src/navigation/navigationRef';
import { initDeepLinking } from './src/navigation/deepLinking';
import { useTheme } from './src/theme/useTheme';

const App = () => {
  const theme = useTheme();
  const [currentRouteName, setCurrentRouteName] = useState('home');

  useEffect(() => initDeepLinking(), []);

  const navigationTheme = {
    ...(theme.scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.accent,
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle={theme.scheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <NavigationContainer
            ref={navigationRef}
            theme={navigationTheme}
            onReady={flushPendingNavigation}
            onStateChange={() => setCurrentRouteName(getCurrentRouteName() ?? 'home')}
          >
            <BootstrapScreen currentRouteName={currentRouteName} />
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
