import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import AsyncStorageScreen from './storage/asyncStorage/asyncStorageScreen';

export default function App() {
  const [showDemo, setShowDemo] = React.useState(false);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {showDemo ? (
        <AsyncStorageScreen onBack={() => setShowDemo(false)} />
      ) : (
        <View style={styles.home}>
          <Text style={styles.title}>Local Storage Demo</Text>
          <Button title="Open AsyncStorage Demo" onPress={() => setShowDemo(true)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  home: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
});
