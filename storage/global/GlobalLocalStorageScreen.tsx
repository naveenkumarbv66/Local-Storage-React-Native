import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, Switch, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { KEYS } from './keys';
import { secureStorage } from '../encryptedStorage';

type Props = { onBack?: () => void };

export default function GlobalLocalStorageScreen({ onBack }: Props) {
  const [name, setName] = React.useState('');
  const [age, setAge] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [isMarried, setIsMarried] = React.useState(false);
  const [aboutHim, setAboutHim] = React.useState('{"bio":"..."}');
  const [hisFamily, setHisFamily] = React.useState('Alice,Bob');

  const [status, setStatus] = React.useState('');
  const [out, setOut] = React.useState<Record<string, unknown> | null>(null);

  const writeAll = async () => {
    try {
      await secureStorage.setString(KEYS.name, name);
      const n = Number(age);
      if (!Number.isNaN(n)) await secureStorage.setNumber(KEYS.age, n);
      await secureStorage.setString(KEYS.address, address);
      await secureStorage.setBoolean(KEYS.isMarried, isMarried);
      const fam = hisFamily.split(',').map(s => s.trim()).filter(Boolean);
      await secureStorage.setArray(KEYS.hisFamily, fam);
      try {
        const obj = JSON.parse(aboutHim);
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          await secureStorage.setJson(KEYS.aboutHim, obj as Record<string, unknown>);
        }
      } catch {}
      setStatus('Saved');
    } catch (e: any) {
      setStatus(`Write error: ${e?.message ?? String(e)}`);
    }
  };

  const readAll = async () => {
    try {
      const result = {
        name: await secureStorage.getString(KEYS.name),
        age: await secureStorage.getNumber(KEYS.age),
        address: await secureStorage.getString(KEYS.address),
        isMarried: await secureStorage.getBoolean(KEYS.isMarried),
        aboutHim: await secureStorage.getJson(KEYS.aboutHim),
        hisFamily: await secureStorage.getArray(KEYS.hisFamily),
      } as Record<string, unknown>;
      setOut(result);
      setStatus('Loaded');
    } catch (e: any) {
      setStatus(`Read error: ${e?.message ?? String(e)}`);
    }
  };

  const removeAll = async () => {
    try {
      await secureStorage.remove(KEYS.name);
      await secureStorage.remove(KEYS.age);
      await secureStorage.remove(KEYS.address);
      await secureStorage.remove(KEYS.isMarried);
      await secureStorage.remove(KEYS.aboutHim);
      await secureStorage.remove(KEYS.hisFamily);
      setOut(null);
      setStatus('Removed keys');
    } catch (e: any) {
      setStatus(`Remove error: ${e?.message ?? String(e)}`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>Global Local Storage (Secure)</Text>
        {onBack ? <Button title="Back" onPress={onBack} /> : null}
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.block}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} placeholder="John" value={name} onChangeText={setName} />
        </View>
        <View style={styles.block}>
          <Text style={styles.label}>Age</Text>
          <TextInput style={styles.input} placeholder="30" keyboardType="number-pad" value={age} onChangeText={setAge} />
        </View>
        <View style={styles.block}>
          <Text style={styles.label}>Address</Text>
          <TextInput style={styles.input} placeholder="221B Baker Street" value={address} onChangeText={setAddress} />
        </View>
        <View style={styles.blockRow}>
          <Text style={styles.label}>Is Married</Text>
          <Switch value={isMarried} onValueChange={setIsMarried} />
        </View>
        <View style={styles.block}>
          <Text style={styles.label}>About Him (JSON)</Text>
          <TextInput style={styles.input} placeholder='{"bio":"..."}' value={aboutHim} onChangeText={setAboutHim} />
        </View>
        <View style={styles.block}>
          <Text style={styles.label}>His Family (comma separated)</Text>
          <TextInput style={styles.input} placeholder="Alice,Bob" value={hisFamily} onChangeText={setHisFamily} />
        </View>
        <View style={styles.actions}>
          <Button title="Save" onPress={writeAll} />
          <Button title="Load" onPress={readAll} />
        </View>
        <View style={styles.actions}>
          <Button title="Remove Keys" onPress={removeAll} />
        </View>
        <View style={styles.results}>
          <Text style={styles.resultTitle}>Results</Text>
          {status ? <Text>{status}</Text> : null}
          <Text selectable>{out ? JSON.stringify(out) : 'null'}</Text>
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '600' },
  scroll: { paddingBottom: 40 },
  block: { marginBottom: 12 },
  blockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  label: { marginBottom: 6, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  results: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#eee', gap: 4 },
  resultTitle: { fontWeight: '600', marginBottom: 4 },
});


