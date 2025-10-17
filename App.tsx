import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import AsyncStorageScreen from './storage/asyncStorage/asyncStorageScreen';
import EncryptedStorageRN from './storage/encryptedStorage/EncryptedStorageRN';
import MMKVReactNativeStorage from './storage/mmkvRC/MMKVReactNativeStorage';

export default function App() {
  const [route, setRoute] = React.useState<'home' | 'async' | 'encrypted' | 'mmkv'>('home');

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {route === 'home' && (
        <View style={styles.home}>
          <Text style={styles.title}>Local Storage Demo</Text>
          <Button title="Open AsyncStorage Demo" onPress={() => setRoute('async')} />
          <Button title="Open Encrypted Storage Demo" onPress={() => setRoute('encrypted')} />
          <Button title="Open MMKV Storage Demo" onPress={() => setRoute('mmkv')} />
        </View>
      )}
      {route === 'async' && <AsyncStorageScreen onBack={() => setRoute('home')} />}
      {route === 'encrypted' && <EncryptedStorageRN onBack={() => setRoute('home')} />}
      {route === 'mmkv' && <MMKVReactNativeStorage onBack={() => setRoute('home')} />}
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
