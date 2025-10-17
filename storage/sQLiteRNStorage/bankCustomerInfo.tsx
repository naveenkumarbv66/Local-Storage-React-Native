import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { bankDB, sqliteDB, BankRecord, DatabaseRecord } from './index';

type Props = { onBack?: () => void };

interface UserRecord extends DatabaseRecord {
  name: string;
  age: number;
  address: string;
  isMarried: boolean;
  aboutHim: Record<string, unknown> | null;
  hisFamily: unknown[] | null;
}

export default function BankCustomerInfo({ onBack }: Props) {
  const [bankName, setBankName] = React.useState('');
  const [bankID, setBankID] = React.useState('');
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null);
  const [banks, setBanks] = React.useState<BankRecord[]>([]);
  const [users, setUsers] = React.useState<UserRecord[]>([]);
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
      const userList = await sqliteDB.read();
      setUsers(userList as UserRecord[]);
      setStatus(`Loaded ${userList.length} users`);
    } catch (error) {
      setStatus(`Error loading users: ${error}`);
    }
  };

  const loadBanksByUser = async (userId: number) => {
    try {
      const bankList = await bankDB.readByUserId(userId);
      setBanks(bankList as BankRecord[]);
      setStatus(`Loaded ${bankList.length} banks for user ${userId}`);
    } catch (error) {
      setStatus(`Error loading banks: ${error}`);
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
      await bankDB.create({
        bankName: bankName.trim(),
        bankID: bankID.trim(),
        userID: selectedUserId,
      });
      setBankName('');
      setBankID('');
      await loadBanksByUser(selectedUserId);
      setStatus('Bank created successfully');
    } catch (error) {
      setStatus(`Error creating bank: ${error}`);
    }
  };

  const deleteBank = async (bankId: number) => {
    try {
      await bankDB.delete(bankId);
      if (selectedUserId) {
        await loadBanksByUser(selectedUserId);
      }
      setStatus('Bank deleted successfully');
    } catch (error) {
      setStatus(`Error deleting bank: ${error}`);
    }
  };

  const selectUser = (user: UserRecord) => {
    setSelectedUserId(user.id!);
    setStatus(`Selected user: ${user.name} (ID: ${user.id})`);
  };

  const renderUser = ({ item }: { item: UserRecord }) => (
    <View style={styles.userItem}>
      <Text style={styles.userName}>{item.name} (ID: {item.id})</Text>
      <Text>Age: {item.age}, Address: {item.address}</Text>
      <Button 
        title={selectedUserId === item.id ? "Selected" : "Select"} 
        onPress={() => selectUser(item)}
        disabled={selectedUserId === item.id}
      />
    </View>
  );

  const renderBank = ({ item }: { item: BankRecord }) => (
    <View style={styles.bankItem}>
      <Text style={styles.bankName}>{item.bankName} (ID: {item.id})</Text>
      <Text>Bank ID: {item.bankID}</Text>
      <Text>User ID: {item.userID}</Text>
      <Button title="Delete" onPress={() => deleteBank(item.id!)} />
    </View>
  );

  const renderForm = () => (
    <View style={styles.form}>
      <Text style={styles.sectionTitle}>Add New Bank</Text>
      <View style={styles.block}>
        <Text style={styles.label}>Bank Name</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Chase Bank" 
          value={bankName} 
          onChangeText={setBankName} 
        />
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>Bank ID</Text>
        <TextInput 
          style={styles.input} 
          placeholder="CHASE001" 
          value={bankID} 
          onChangeText={setBankID} 
        />
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

  const renderUsers = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select User ({users.length} users)</Text>
    </View>
  );

  const renderBanks = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Banks for User {selectedUserId} ({banks.length} banks)
      </Text>
    </View>
  );

  const renderStatus = () => (
    <View style={styles.status}>
      <Text style={styles.statusText}>Status: {status}</Text>
    </View>
  );

  const data = [
    { type: 'status', key: 'status' },
    { type: 'form', key: 'form' },
    { type: 'users', key: 'users' },
    ...users.map(user => ({ type: 'user', key: `user-${user.id}`, user })),
    { type: 'banks', key: 'banks' },
    ...banks.map(bank => ({ type: 'bank', key: `bank-${bank.id}`, bank })),
  ];

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'status') return renderStatus();
    if (item.type === 'form') return renderForm();
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
        <Text style={styles.title}>Bank Customer Info</Text>
        {onBack ? <Button title="Back" onPress={onBack} /> : null}
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
  userItem: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  userName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  bankItem: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  bankName: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#2c5aa0',
  },
});
