import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, Switch, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { secureStorage } from './index';

type Props = { onBack?: () => void };

export default function EncryptedStorageRN({ onBack }: Props) {
  const [strVal, setStrVal] = React.useState('');
  const [numVal, setNumVal] = React.useState('');
  const [boolVal, setBoolVal] = React.useState(false);
  const [arrVal, setArrVal] = React.useState('x,y,z');
  const [jsonVal, setJsonVal] = React.useState('{"hello":"world"}');

  const [readStr, setReadStr] = React.useState<string | null>(null);
  const [readNum, setReadNum] = React.useState<number | null>(null);
  const [readBool, setReadBool] = React.useState<boolean | null>(null);
  const [readArr, setReadArr] = React.useState<string[] | null>(null);
  const [readJson, setReadJson] = React.useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = React.useState<string>('');

  const writeAll = async () => {
    try {
      await secureStorage.setString('enc:string', strVal);
      const parsedNum = Number(numVal);
      if (!Number.isNaN(parsedNum)) {
        await secureStorage.setNumber('enc:number', parsedNum);
      }
      await secureStorage.setBoolean('enc:boolean', boolVal);
      const arr = arrVal.split(',').map((s) => s.trim()).filter(Boolean);
      await secureStorage.setArray('enc:array', arr);
      try {
        const obj = JSON.parse(jsonVal);
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          await secureStorage.setJson('enc:json', obj as Record<string, unknown>);
        }
      } catch {}
      setStatus('Wrote values');
    } catch (e: any) {
      setStatus(`Write error: ${e?.message ?? String(e)}`);
    }
  };

  const readAll = async () => {
    try {
      setReadStr(await secureStorage.getString('enc:string'));
      setReadNum(await secureStorage.getNumber('enc:number'));
      setReadBool(await secureStorage.getBoolean('enc:boolean'));
      setReadArr(await secureStorage.getArray('enc:array'));
      setReadJson(await secureStorage.getJson('enc:json'));
      setStatus('Read values');
    } catch (e: any) {
      setStatus(`Read error: ${e?.message ?? String(e)}`);
    }
  };

  const removeAll = async () => {
    try {
      await secureStorage.remove('enc:string');
      await secureStorage.remove('enc:number');
      await secureStorage.remove('enc:boolean');
      await secureStorage.remove('enc:array');
      await secureStorage.remove('enc:json');
      setReadStr(null);
      setReadNum(null);
      setReadBool(null);
      setReadArr(null);
      setReadJson(null);
      setStatus('Removed demo keys');
    } catch (e: any) {
      setStatus(`Remove error: ${e?.message ?? String(e)}`);
    }
  };

  const clear = async () => {
    // expo-secure-store has no clearAll; remove our known keys instead
    try {
      await removeAll();
      setStatus('Cleared demo keys');
    } catch (e: any) {
      setStatus(`Clear error: ${e?.message ?? String(e)}`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>Encrypted Storage Demo</Text>
        {onBack ? <Button title="Back" onPress={onBack} /> : null}
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.block}>
          <Text style={styles.label}>String</Text>
          <TextInput style={styles.input} placeholder="Enter a string" value={strVal} onChangeText={setStrVal} />
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Number</Text>
          <TextInput style={styles.input} keyboardType="number-pad" placeholder="123" value={numVal} onChangeText={setNumVal} />
        </View>

        <View style={styles.blockRow}>
          <Text style={styles.label}>Boolean</Text>
          <Switch value={boolVal} onValueChange={setBoolVal} />
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Array (comma separated)</Text>
          <TextInput style={styles.input} placeholder="x,y,z" value={arrVal} onChangeText={setArrVal} />
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>JSON Object</Text>
          <TextInput style={styles.input} placeholder='{"hello":"world"}' value={jsonVal} onChangeText={setJsonVal} />
        </View>

        <View style={styles.actions}>
          <Button title="Write" onPress={writeAll} />
          <Button title="Read" onPress={readAll} />
        </View>
        <View style={styles.actions}>
          <Button title="Remove Keys" onPress={removeAll} />
          <Button title="Clear All" onPress={clear} />
        </View>

        <View style={styles.results}>
          <Text style={styles.resultTitle}>Results</Text>
          {status ? <Text>{status}</Text> : null}
          <Text>String: {readStr === null ? 'null' : readStr}</Text>
          <Text>Number: {readNum === null ? 'null' : String(readNum)}</Text>
          <Text>Boolean: {readBool === null ? 'null' : String(readBool)}</Text>
          <Text>Array: {readArr === null ? 'null' : `[${readArr.join(', ')}]`}</Text>
          <Text>JSON: {readJson === null ? 'null' : JSON.stringify(readJson)}</Text>
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
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  scroll: { paddingBottom: 40 },
  block: { marginBottom: 12 },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: { marginBottom: 6, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  results: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 4,
  },
  resultTitle: { fontWeight: '600', marginBottom: 4 },
});


