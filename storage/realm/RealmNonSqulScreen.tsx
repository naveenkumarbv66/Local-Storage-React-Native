import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, Switch, FlatList, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { userRealm, bankRealm, UserData, BankData, convertUserData, convertBankData, parseUserData, parseBankData } from './index';

type Props = { onBack?: () => void };

type Screen = 'users' | 'banks';

export default function RealmNonSqulScreen({ onBack }: Props) {
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('users');
  
  // User form state
  const [name, setName] = React.useState('');
  const [age, setAge] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [isMarried, setIsMarried] = React.useState(false);
  const [aboutHim, setAboutHim] = React.useState('{"bio":"..."}');
  const [hisFamily, setHisFamily] = React.useState('Alice,Bob');
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);

  // Bank form state
  const [bankName, setBankName] = React.useState('');
  const [bankID, setBankID] = React.useState('');

  // Data state
  const [users, setUsers] = React.useState<UserData[]>([]);
  const [banks, setBanks] = React.useState<BankData[]>([]);
  const [status, setStatus] = React.useState('Ready');

  React.useEffect(() => {
    loadUsers();
  }, []);

  React.useEffect(() => {
    if (selectedUserId) {
      loadBanksByUser(selectedUserId);
    } else {
      setBanks([]);
    }
  }, [selectedUserId]);

  const loadUsers = async () => {
    try {
      const realmUsers = await userRealm.readAll();
      const parsedUsers = realmUsers.map(parseUserData);
      setUsers(parsedUsers);
      setStatus(`Loaded ${parsedUsers.length} users`);
    } catch (error) {
      setStatus(`Error loading users: ${error}`);
    }
  };

  const loadBanksByUser = async (userId: string) => {
    try {
      const realmBanks = await bankRealm.readByFilter('userID == $0', new Realm.BSON.ObjectId(userId));
      const parsedBanks = realmBanks.map(parseBankData);
      setBanks(parsedBanks);
      setStatus(`Loaded ${parsedBanks.length} banks for user ${userId}`);
    } catch (error) {
      setStatus(`Error loading banks: ${error}`);
    }
  };

  const createUser = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    try {
      const userData = convertUserData({
        name: name.trim(),
        age: parseInt(age) || 0,
        address: address.trim(),
        isMarried,
        aboutHim: aboutHim.trim() ? JSON.parse(aboutHim) : {},
        hisFamily: hisFamily.trim() ? hisFamily.split(',').map(s => s.trim()) : [],
      });

      await userRealm.create(userData);
      setName('');
      setAge('');
      setAddress('');
      setIsMarried(false);
      setAboutHim('{"bio":"..."}');
      setHisFamily('Alice,Bob');
      await loadUsers();
      setStatus('User created successfully');
    } catch (error) {
      setStatus(`Error creating user: ${error}`);
    }
  };

  const createBank = async () => {
    if (!selectedUserId) {
      Alert.alert('Error', 'Please select a user first');
      return;
    }
    if (!bankName.trim() || !bankID.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const bankData = convertBankData({
        bankName: bankName.trim(),
        bankID: bankID.trim(),
        userID: selectedUserId,
      });

      await bankRealm.create(bankData);
      setBankName('');
      setBankID('');
      await loadBanksByUser(selectedUserId);
      setStatus('Bank created successfully');
    } catch (error) {
      setStatus(`Error creating bank: ${error}`);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await userRealm.delete(userId);
      await loadUsers();
      if (selectedUserId === userId) {
        setSelectedUserId(null);
      }
      setStatus('User deleted successfully');
    } catch (error) {
      setStatus(`Error deleting user: ${error}`);
    }
  };

  const deleteBank = async (bankId: string) => {
    try {
      await bankRealm.delete(bankId);
      if (selectedUserId) {
        await loadBanksByUser(selectedUserId);
      }
      setStatus('Bank deleted successfully');
    } catch (error) {
      setStatus(`Error deleting bank: ${error}`);
    }
  };

  const selectUser = (user: UserData) => {
    setSelectedUserId(user._id!);
    setStatus(`Selected user: ${user.name} (ID: ${user._id})`);
  };

  const renderUser = ({ item }: { item: UserData }) => (
    <View style={styles.item}>
      <Text style={styles.itemName}>{item.name} (ID: {item._id})</Text>
      <Text>Age: {item.age}, Married: {item.isMarried ? 'Yes' : 'No'}</Text>
      <Text>Address: {item.address}</Text>
      <View style={styles.itemActions}>
        <Button 
          title={selectedUserId === item._id ? "Selected" : "Select"} 
          onPress={() => selectUser(item)}
          disabled={selectedUserId === item._id}
        />
        <Button title="Delete" onPress={() => deleteUser(item._id!)} />
      </View>
    </View>
  );

  const renderBank = ({ item }: { item: BankData }) => (
    <View style={styles.item}>
      <Text style={styles.itemName}>{item.bankName} (ID: {item._id})</Text>
      <Text>Bank ID: {item.bankID}</Text>
      <Text>User ID: {item.userID}</Text>
      <Button title="Delete" onPress={() => deleteBank(item._id!)} />
    </View>
  );

  const renderUserForm = () => (
    <View style={styles.form}>
      <Text style={styles.sectionTitle}>Add New User</Text>
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
      <Button title="Create User" onPress={createUser} />
    </View>
  );

  const renderBankForm = () => (
    <View style={styles.form}>
      <Text style={styles.sectionTitle}>Add New Bank</Text>
      <View style={styles.block}>
        <Text style={styles.label}>Bank Name</Text>
        <TextInput style={styles.input} placeholder="Chase Bank" value={bankName} onChangeText={setBankName} />
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>Bank ID</Text>
        <TextInput style={styles.input} placeholder="CHASE001" value={bankID} onChangeText={setBankID} />
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>Selected User</Text>
        <Text style={styles.selectedUser}>
          {selectedUserId ? `User ID: ${selectedUserId}` : 'No user selected'}
        </Text>
      </View>
      <Button 
        title="Create Bank" 
        onPress={createBank}
        disabled={!selectedUserId || !bankName.trim() || !bankID.trim()}
      />
    </View>
  );

  const renderStatus = () => (
    <View style={styles.status}>
      <Text style={styles.statusText}>Status: {status}</Text>
    </View>
  );

  const renderUsers = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Users ({users.length})</Text>
    </View>
  );

  const renderBanks = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Banks for User {selectedUserId} ({banks.length} banks)
      </Text>
    </View>
  );

  const data = [
    { type: 'status', key: 'status' },
    { type: 'form', key: 'form' },
    { type: 'users', key: 'users' },
    ...users.map(user => ({ type: 'user', key: `user-${user._id}`, user })),
    { type: 'banks', key: 'banks' },
    ...banks.map(bank => ({ type: 'bank', key: `bank-${bank._id}`, bank })),
  ];

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'status') return renderStatus();
    if (item.type === 'form') return currentScreen === 'users' ? renderUserForm() : renderBankForm();
    if (item.type === 'users') return renderUsers();
    if (item.type === 'user') return renderUser({ item: item.user });
    if (item.type === 'banks') return renderBanks();
    if (item.type === 'bank') return renderBank({ item: item.bank });
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>Realm NoSQL Demo</Text>
        <View style={styles.headerButtons}>
          <Button 
            title="Users" 
            onPress={() => setCurrentScreen('users')}
            disabled={currentScreen === 'users'}
          />
          <Button 
            title="Banks" 
            onPress={() => setCurrentScreen('banks')}
            disabled={currentScreen === 'banks'}
          />
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
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  scroll: {
    paddingBottom: 20,
  },
  status: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  statusText: {
    fontWeight: '600',
  },
  form: {
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  block: {
    marginBottom: 12,
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectedUser: {
    padding: 12,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b3d9ff',
  },
  item: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  itemName: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#2c5aa0',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
});
