/**
 * @format
 */

import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from './src/api/queryClient';
import { BootstrapScreen } from './src/screens/BootstrapScreen';
import { navigationRef, getCurrentRouteName } from './src/navigation/navigationRef';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentRouteName, setCurrentRouteName] = useState('home');

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.container}>
          <NavigationContainer
            ref={navigationRef}
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
