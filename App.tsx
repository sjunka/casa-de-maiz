/**
 * @format
 */

import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { LogBox, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from './src/data/remote/queryClient';
import { BootstrapScreen } from './src/presentation/screens/BootstrapScreen';
import { navigationRef, getCurrentRouteName, flushPendingNavigation } from './src/navigation/navigationRef';
import { initDeepLinking } from './src/navigation/deepLinking';
import { useTheme } from './src/presentation/theme/useTheme';
import { initCrashReporting, wrapRootComponent, reportTransportError } from './src/observability/crashReporting';
import { DISABLE_LOGBOX_NOTIFICATIONS } from './src/core/transport/config';
import { setTransportErrorReporter } from './src/core/transport/client';
import { PrototypeChromeProvider } from './src/presentation/prototype/PrototypeChrome';

initCrashReporting();
setTransportErrorReporter(reportTransportError);

if (DISABLE_LOGBOX_NOTIFICATIONS) {
  LogBox.ignoreAllLogs(true);
}

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
        <PrototypeChromeProvider>
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
        </PrototypeChromeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default wrapRootComponent(App);
