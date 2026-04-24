import React, {useState, useEffect} from 'react';
import {StatusBar, ActivityIndicator, View, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import {Colors} from './src/theme';

const App = (): React.JSX.Element => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    AsyncStorage.getItem('userSession').then(session => {
      if (session) {
        setIsLoggedIn(true);
      }
      setLoading(false);
    });

    // Listen for session changes
    const interval = setInterval(async () => {
      const session = await AsyncStorage.getItem('userSession');
      setIsLoggedIn(!!session);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <AppNavigator isLoggedIn={isLoggedIn} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

export default App;
