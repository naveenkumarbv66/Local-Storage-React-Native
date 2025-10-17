import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, Switch, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MMKV } from 'react-native-mmkv';

let mmkvInstance: MMKV | null = null;
function getMMKV(): MMKV | null {
  try {
    if (!mmkvInstance) mmkvInstance = new MMKV();
    return mmkvInstance;
  } catch {
    return null;
  }
}

function setJson(key: string, value: Record<string, unknown>) {
  const inst = getMMKV();
  if (!inst) return;
  inst.set(key, JSON.stringify({ __type: 'object', value }));
}

function getJson<T extends Record<string, unknown>>(key: string): T | null {
  const inst = getMMKV();
  if (!inst) return null;
  const raw = inst.getString(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.__type === 'object' && parsed.value && typeof parsed.value === 'object') {
      return parsed.value as T;
    }
  } catch {}
  return null;
}

type Props = { onBack?: () => void };

export default function MMKVReactNativeStorage({ onBack }: Props) {
  const [strVal, setStrVal] = React.useState('');
  const [numVal, setNumVal] = React.useState('');
  const [boolVal, setBoolVal] = React.useState(false);
  const [arrVal, setArrVal] = React.useState('m,k,v');
  const [jsonVal, setJsonVal] = React.useState('{"hello":"mmkv"}');

  const [readStr, setReadStr] = React.useState<string | null>(null);
  const [readNum, setReadNum] = React.useState<number | null>(null);
  const [readBool, setReadBool] = React.useState<boolean | null>(null);
  const [readArr, setReadArr] = React.useState<string[] | null>(null);
  const [readJson, setReadJson] = React.useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = React.useState<string>('');

  const writeAll = () => {
    const mmkv = getMMKV();
    if (!mmkv) {
      setStatus('MMKV not available. Use a Dev Client (not Expo Go).');
      return;
    }
    try {
      mmkv.set('mmkv:string', strVal);
      const parsedNum = Number(numVal);
      if (!Number.isNaN(parsedNum)) mmkv.set('mmkv:number', parsedNum);
      mmkv.set('mmkv:boolean', boolVal);
      const arr = arrVal.split(',').map((s) => s.trim()).filter(Boolean);
      mmkv.set('mmkv:array', JSON.stringify({ __type: 'array', value: arr }));
      try {
        const obj = JSON.parse(jsonVal);
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) setJson('mmkv:json', obj);
      } catch {}
      setStatus('Wrote values');
    } catch (e: any) {
      setStatus(`Write error: ${e?.message ?? String(e)}`);
    }
  };

  const readAll = () => {
    const mmkv = getMMKV();
    if (!mmkv) {
      setStatus('MMKV not available. Use a Dev Client (not Expo Go).');
      return;
    }
    try {
      setReadStr(mmkv.getString('mmkv:string') ?? null);
      setReadNum(mmkv.contains('mmkv:number') ? mmkv.getNumber('mmkv:number') ?? null : null);
      setReadBool(mmkv.contains('mmkv:boolean') ? mmkv.getBoolean('mmkv:boolean') ?? null : null);
      const arrRaw = mmkv.getString('mmkv:array');
      if (arrRaw) {
        try {
          const parsed = JSON.parse(arrRaw);
          setReadArr(parsed && parsed.__type === 'array' && Array.isArray(parsed.value) ? parsed.value : null);
        } catch {
          setReadArr(null);
        }
      } else setReadArr(null);
      setReadJson(getJson('mmkv:json'));
      setStatus('Read values');
    } catch (e: any) {
      setStatus(`Read error: ${e?.message ?? String(e)}`);
    }
  };

  const removeAll = () => {
    const mmkv = getMMKV();
    if (!mmkv) {
      setStatus('MMKV not available. Use a Dev Client (not Expo Go).');
      return;
    }
    ['mmkv:string', 'mmkv:number', 'mmkv:boolean', 'mmkv:array', 'mmkv:json'].forEach((k) => mmkv.delete(k));
    setReadStr(null);
    setReadNum(null);
    setReadBool(null);
    setReadArr(null);
    setReadJson(null);
    setStatus('Removed keys');
  };

  const clear = () => {
    const mmkv = getMMKV();
    if (!mmkv) {
      setStatus('MMKV not available. Use a Dev Client (not Expo Go).');
      return;
    }
    mmkv.clearAll();
    setReadStr(null);
    setReadNum(null);
    setReadBool(null);
    setReadArr(null);
    setReadJson(null);
    setStatus('Cleared all');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>MMKV Storage Demo</Text>
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
          <TextInput style={styles.input} placeholder="m,k,v" value={arrVal} onChangeText={setArrVal} />
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>JSON Object</Text>
          <TextInput style={styles.input} placeholder='{"hello":"mmkv"}' value={jsonVal} onChangeText={setJsonVal} />
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


