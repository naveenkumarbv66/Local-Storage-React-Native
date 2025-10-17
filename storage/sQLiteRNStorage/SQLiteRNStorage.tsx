import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, Switch, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { sqliteDB, DatabaseRecord } from './index';
import BankCustomerInfo from './bankCustomerInfo';

type Props = { onBack?: () => void };

type Screen = 'users' | 'banks';

interface UserRecord extends DatabaseRecord {
  name: string;
  age: number;
  address: string;
  isMarried: boolean;
  aboutHim: Record<string, unknown> | null;
  hisFamily: unknown[] | null;
}

export default function SQLiteRNStorage({ onBack }: Props) {
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('users');
  const [name, setName] = React.useState('');
  const [age, setAge] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [isMarried, setIsMarried] = React.useState(false);
  const [aboutHim, setAboutHim] = React.useState('{"bio":"..."}');
  const [hisFamily, setHisFamily] = React.useState('Alice,Bob');
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  const [status, setStatus] = React.useState('');
  const [users, setUsers] = React.useState<UserRecord[]>([]);

  const loadUsers = async () => {
    try {
      const data = await sqliteDB.read();
      setUsers(data as UserRecord[]);
      setStatus(`Loaded ${data.length} users`);
    } catch (e: any) {
      setStatus(`Load error: ${e?.message ?? String(e)}`);
    }
  };

  const createUser = async () => {
    try {
      const userData = {
        name,
        age: Number(age) || 0,
        address,
        isMarried,
        aboutHim: aboutHim ? JSON.parse(aboutHim) : null,
        hisFamily: hisFamily.split(',').map(s => s.trim()).filter(Boolean),
      };
      const id = await sqliteDB.create(userData);
      setStatus(`Created user with ID: ${id}`);
      await loadUsers();
    } catch (e: any) {
      setStatus(`Create error: ${e?.message ?? String(e)}`);
    }
  };

  const updateUser = async () => {
    if (!selectedId) {
      setStatus('Select a user to update');
      return;
    }
    try {
      const userData = {
        name,
        age: Number(age) || 0,
        address,
        isMarried,
        aboutHim: aboutHim ? JSON.parse(aboutHim) : null,
        hisFamily: hisFamily.split(',').map(s => s.trim()).filter(Boolean),
      };
      const success = await sqliteDB.update(selectedId, userData);
      setStatus(success ? `Updated user ${selectedId}` : 'Update failed');
      await loadUsers();
    } catch (e: any) {
      setStatus(`Update error: ${e?.message ?? String(e)}`);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      const success = await sqliteDB.delete(id);
      setStatus(success ? `Deleted user ${id}` : 'Delete failed');
      await loadUsers();
    } catch (e: any) {
      setStatus(`Delete error: ${e?.message ?? String(e)}`);
    }
  };

  const deleteAllUsers = async () => {
    try {
      const success = await sqliteDB.deleteAll();
      setStatus(success ? 'Deleted all users' : 'Delete all failed');
      await loadUsers();
    } catch (e: any) {
      setStatus(`Delete all error: ${e?.message ?? String(e)}`);
    }
  };

  const selectUser = (user: UserRecord) => {
    setSelectedId(user.id || null);
    setName(user.name);
    setAge(String(user.age));
    setAddress(user.address);
    setIsMarried(user.isMarried);
    setAboutHim(user.aboutHim ? JSON.stringify(user.aboutHim) : '');
    setHisFamily(user.hisFamily ? user.hisFamily.join(',') : '');
  };

  React.useEffect(() => {
    loadUsers();
  }, []);

  const renderUser = ({ item }: { item: UserRecord }) => (
    <View style={styles.userItem}>
      <Text style={styles.userName}>{item.name} (ID: {item.id})</Text>
      <Text>Age: {item.age}, Married: {item.isMarried ? 'Yes' : 'No'}</Text>
      <Text>Address: {item.address}</Text>
      <View style={styles.userActions}>
        <Button title="Select" onPress={() => selectUser(item)} />
        <Button title="Delete" onPress={() => deleteUser(item.id!)} />
      </View>
    </View>
  );

  const renderForm = () => (
    <View style={styles.form}>
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
        <Button title="Create" onPress={createUser} />
        <Button title="Update" onPress={updateUser} />
      </View>
      <View style={styles.actions}>
        <Button title="Load All" onPress={loadUsers} />
        <Button title="Delete All" onPress={deleteAllUsers} />
      </View>
    </View>
  );

  const renderResults = () => (
    <View style={styles.results}>
      <Text style={styles.resultTitle}>Status: {status}</Text>
      <Text style={styles.resultTitle}>Users ({users.length}):</Text>
    </View>
  );

  const data = [
    { type: 'form', key: 'form' },
    { type: 'results', key: 'results' },
    ...users.map(user => ({ type: 'user', key: `user-${user.id}`, user })),
  ];

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'form') return renderForm();
    if (item.type === 'results') return renderResults();
    if (item.type === 'user') return renderUser({ item: item.user });
    return null;
  };

  if (currentScreen === 'banks') {
    return <BankCustomerInfo onBack={() => setCurrentScreen('users')} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>SQLite Storage Demo</Text>
        <View style={styles.headerButtons}>
          <Button title="Banks" onPress={() => setCurrentScreen('banks')} />
          {onBack ? <Button title="Back" onPress={onBack} /> : null}
        </View>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      />
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  title: { fontSize: 20, fontWeight: '600' },
  scroll: { paddingBottom: 40 },
  form: { marginBottom: 20 },
  block: { marginBottom: 12 },
  blockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  label: { marginBottom: 6, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  results: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#eee' },
  resultTitle: { fontWeight: '600', marginBottom: 4 },
  userItem: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  userName: { fontWeight: '600', marginBottom: 4 },
  userActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
});
