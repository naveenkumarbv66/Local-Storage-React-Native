import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, Switch, FlatList, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { 
  userWatermelon, 
  bankWatermelon, 
  UserRecord, 
  BankRecord, 
  convertUserData, 
  parseUserData, 
  convertBankData, 
  parseBankData,
  initDatabase 
} from './index';

type Props = { onBack?: () => void };
type Screen = 'users' | 'banks';

export default function WatermelonDBScreen({ onBack }: Props) {
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('users');
  const [status, setStatus] = React.useState('');
  const [isInitialized, setIsInitialized] = React.useState(false);

  // User state
  const [userName, setUserName] = React.useState('');
  const [userAge, setUserAge] = React.useState('');
  const [userAddress, setUserAddress] = React.useState('');
  const [userIsMarried, setUserIsMarried] = React.useState(false);
  const [userAboutHim, setUserAboutHim] = React.useState('{"bio":"..."}');
  const [userHisFamily, setUserHisFamily] = React.useState('Alice,Bob');
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [users, setUsers] = React.useState<UserRecord[]>([]);

  // Bank state
  const [bankName, setBankName] = React.useState('');
  const [bankId, setBankId] = React.useState('');
  const [banks, setBanks] = React.useState<BankRecord[]>([]);

  // Initialize database
  React.useEffect(() => {
    const initializeDB = async () => {
      try {
        await initDatabase();
        setIsInitialized(true);
        setStatus('WatermelonDB initialized successfully!');
        loadUsers();
      } catch (error: any) {
        setStatus(`Error initializing WatermelonDB: ${error.message}`);
        setIsInitialized(false);
      }
    };

    initializeDB();
  }, []);

  React.useEffect(() => {
    if (currentScreen === 'banks' && isInitialized) {
      loadBanks();
    }
  }, [currentScreen, selectedUserId, isInitialized]);

  const loadUsers = async () => {
    if (!isInitialized) return;
    
    try {
      const watermelonUsers = await userWatermelon.readAll();
      setUsers(watermelonUsers.map(parseUserData));
      setStatus('Users loaded successfully!');
    } catch (error: any) {
      setStatus(`Error loading users: ${error.message}`);
    }
  };

  const loadBanks = async () => {
    if (!isInitialized) return;
    
    try {
      if (selectedUserId) {
        const watermelonBanks = await bankWatermelon.readByFilter('user_id', selectedUserId);
        setBanks(watermelonBanks.map(parseBankData));
        setStatus(`Banks for user ${selectedUserId} loaded.`);
      } else {
        setBanks([]);
        setStatus('Select a user to view banks.');
      }
    } catch (error: any) {
      setStatus(`Error loading banks: ${error.message}`);
    }
  };

  const resetUserForm = () => {
    setUserName('');
    setUserAge('');
    setUserAddress('');
    setUserIsMarried(false);
    setUserAboutHim('{"bio":"..."}');
    setUserHisFamily('Alice,Bob');
    setSelectedUserId(null);
  };

  const resetBankForm = () => {
    setBankName('');
    setBankId('');
  };

  // User CRUD
  const createUser = async () => {
    if (!isInitialized) {
      setStatus('Database not initialized.');
      return;
    }

    try {
      const newId = await userWatermelon.create(convertUserData({
        name: userName,
        age: parseInt(userAge),
        address: userAddress,
        isMarried: userIsMarried,
        aboutHim: JSON.parse(userAboutHim),
        hisFamily: userHisFamily.split(',').map(s => s.trim()),
      }));
      setStatus(`User created with ID: ${newId}`);
      resetUserForm();
      loadUsers();
    } catch (error: any) {
      setStatus(`Error creating user: ${error.message}`);
    }
  };

  const updateUser = async () => {
    if (!isInitialized) {
      setStatus('Database not initialized.');
      return;
    }

    if (!selectedUserId) {
      setStatus('Please select a user to update.');
      return;
    }

    try {
      const updated = await userWatermelon.update(selectedUserId, convertUserData({
        name: userName,
        age: parseInt(userAge),
        address: userAddress,
        isMarried: userIsMarried,
        aboutHim: JSON.parse(userAboutHim),
        hisFamily: userHisFamily.split(',').map(s => s.trim()),
      }));
      setStatus(updated ? `User ID ${selectedUserId} updated.` : `User ID ${selectedUserId} not found.`);
      resetUserForm();
      loadUsers();
    } catch (error: any) {
      setStatus(`Error updating user: ${error.message}`);
    }
  };

  const deleteUser = async (id: string) => {
    if (!isInitialized) {
      setStatus('Database not initialized.');
      return;
    }

    try {
      const deleted = await userWatermelon.delete(id);
      setStatus(deleted ? `User ID ${id} deleted.` : `User ID ${id} not found.`);
      resetUserForm();
      loadUsers();
      if (selectedUserId === id) {
        setSelectedUserId(null);
      }
    } catch (error: any) {
      setStatus(`Error deleting user: ${error.message}`);
    }
  };

  const deleteAllUsers = async () => {
    if (!isInitialized) {
      setStatus('Database not initialized.');
      return;
    }

    try {
      const deleted = await userWatermelon.deleteAll();
      setStatus(deleted ? 'All users deleted.' : 'No users to delete.');
      resetUserForm();
      loadUsers();
      setSelectedUserId(null);
    } catch (error: any) {
      setStatus(`Error deleting all users: ${error.message}`);
    }
  };

  const selectUser = (user: UserRecord) => {
    setSelectedUserId(user.id!);
    setUserName(user.name);
    setUserAge(user.age.toString());
    setUserAddress(user.address || '');
    setUserIsMarried(user.isMarried || false);
    setUserAboutHim(user.aboutHim ? JSON.stringify(user.aboutHim) : '{"bio":"..."}');
    setUserHisFamily(user.hisFamily ? (user.hisFamily as string[]).join(',') : 'Alice,Bob');
    setStatus(`User ID ${user.id} selected.`);
  };

  // Bank CRUD
  const createBank = async () => {
    if (!isInitialized) {
      setStatus('Database not initialized.');
      return;
    }

    if (!selectedUserId) {
      setStatus('Please select a user first.');
      return;
    }

    if (!bankName.trim() || !bankId.trim()) {
      setStatus('Bank Name and Bank ID cannot be empty.');
      return;
    }

    try {
      const newId = await bankWatermelon.create(convertBankData({
        bankName,
        bankId,
        userId: selectedUserId,
      }));
      setStatus(`Bank created with ID: ${newId} for User ID: ${selectedUserId}`);
      resetBankForm();
      loadBanks();
    } catch (error: any) {
      setStatus(`Error adding bank: ${error.message}`);
    }
  };

  const deleteBank = async (id: string) => {
    if (!isInitialized) {
      setStatus('Database not initialized.');
      return;
    }

    try {
      const deleted = await bankWatermelon.delete(id);
      setStatus(deleted ? `Bank ID ${id} deleted.` : `Bank ID ${id} not found.`);
      loadBanks();
    } catch (error: any) {
      setStatus(`Error deleting bank: ${error.message}`);
    }
  };

  const deleteAllBanks = async () => {
    if (!isInitialized) {
      setStatus('Database not initialized.');
      return;
    }

    try {
      const deleted = await bankWatermelon.deleteAll();
      setStatus(deleted ? 'All banks deleted.' : 'No banks to delete.');
      loadBanks();
    } catch (error: any) {
      setStatus(`Error deleting all banks: ${error.message}`);
    }
  };

  const renderUserItem = ({ item }: { item: UserRecord }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.name} (ID: {item.id})</Text>
      <Text>Age: {item.age}, Married: {item.isMarried ? 'Yes' : 'No'}</Text>
      <Text>Address: {item.address}</Text>
      <View style={styles.itemActions}>
        <Button title="Select" onPress={() => selectUser(item)} disabled={selectedUserId === item.id} />
        <Button title="Update" onPress={() => selectUser(item)} />
        <Button title="Delete" onPress={() => deleteUser(item.id!)} />
      </View>
    </View>
  );

  const renderBankItem = ({ item }: { item: BankRecord }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.bankName} (ID: {item.bankId})</Text>
      <Text>Watermelon ID: {item.id}, User ID: {item.userId}</Text>
      <View style={styles.itemActions}>
        <Button title="Delete" onPress={() => deleteBank(item.id!)} />
      </View>
    </View>
  );

  const renderUsersScreen = () => (
    <FlatList
      data={users}
      renderItem={renderUserItem}
      keyExtractor={(item) => item.id!}
      ListHeaderComponent={() => (
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>User Details {selectedUserId ? `(Selected: ${selectedUserId})` : ''}</Text>
          <View style={styles.block}>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} placeholder="John Doe" value={userName} onChangeText={setUserName} />
          </View>
          <View style={styles.block}>
            <Text style={styles.label}>Age</Text>
            <TextInput style={styles.input} placeholder="30" keyboardType="number-pad" value={userAge} onChangeText={setUserAge} />
          </View>
          <View style={styles.block}>
            <Text style={styles.label}>Address</Text>
            <TextInput style={styles.input} placeholder="123 Main St" value={userAddress} onChangeText={setUserAddress} />
          </View>
          <View style={styles.blockRow}>
            <Text style={styles.label}>Is Married</Text>
            <Switch value={userIsMarried} onValueChange={setUserIsMarried} />
          </View>
          <View style={styles.block}>
            <Text style={styles.label}>About Him (JSON)</Text>
            <TextInput style={styles.input} placeholder='{"bio":"Developer"}' value={userAboutHim} onChangeText={setUserAboutHim} />
          </View>
          <View style={styles.block}>
            <Text style={styles.label}>His Family (comma separated)</Text>
            <TextInput style={styles.input} placeholder="Alice,Bob" value={userHisFamily} onChangeText={setUserHisFamily} />
          </View>
          <View style={styles.actions}>
            <Button title="Create User" onPress={createUser} disabled={!isInitialized} />
            <Button title="Update User" onPress={updateUser} disabled={!isInitialized || !selectedUserId} />
          </View>
          <View style={styles.actions}>
            <Button title="Load All Users" onPress={loadUsers} disabled={!isInitialized} />
            <Button title="Delete All Users" onPress={deleteAllUsers} disabled={!isInitialized} />
          </View>
          <Text style={styles.resultTitle}>Users ({users.length}):</Text>
        </View>
      )}
      contentContainerStyle={styles.scrollContent}
      ListEmptyComponent={<Text style={styles.emptyMessage}>No users found.</Text>}
    />
  );

  const renderBanksScreen = () => (
    <FlatList
      data={banks}
      renderItem={renderBankItem}
      keyExtractor={(item) => item.id!}
      ListHeaderComponent={() => (
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Add Bank for User {selectedUserId || 'N/A'}</Text>
          <View style={styles.block}>
            <Text style={styles.label}>Bank Name</Text>
            <TextInput style={styles.input} placeholder="e.g., Chase Bank" value={bankName} onChangeText={setBankName} />
          </View>
          <View style={styles.block}>
            <Text style={styles.label}>Bank ID</Text>
            <TextInput style={styles.input} placeholder="e.g., CHASE001" value={bankId} onChangeText={setBankId} />
          </View>
          <View style={styles.actions}>
            <Button title="Add Bank" onPress={createBank} disabled={!isInitialized || !selectedUserId || !bankName.trim() || !bankId.trim()} />
            <Button title="Delete All Banks" onPress={deleteAllBanks} disabled={!isInitialized} />
          </View>
          <Text style={styles.resultTitle}>Banks for User {selectedUserId || 'N/A'} ({banks.length}):</Text>
        </View>
      )}
      contentContainerStyle={styles.scrollContent}
      ListEmptyComponent={<Text style={styles.emptyMessage}>No banks found for this user.</Text>}
    />
  );

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
          <Text style={styles.title}>WatermelonDB Demo</Text>
          {onBack ? <Button title="Back" onPress={onBack} /> : null}
        </View>
        <Text style={styles.statusText}>Status: {status}</Text>
        <Text style={styles.errorMessage}>WatermelonDB not available. Use a Dev Client (not Expo Go).</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>WatermelonDB Demo</Text>
        <View style={styles.headerButtons}>
          <Button title="Users" onPress={() => setCurrentScreen('users')} disabled={currentScreen === 'users'} />
          <Button title="Banks" onPress={() => setCurrentScreen('banks')} disabled={currentScreen === 'banks'} />
          {onBack ? <Button title="Back" onPress={onBack} /> : null}
        </View>
      </View>
      <Text style={styles.statusText}>Status: {status}</Text>
      {currentScreen === 'users' ? renderUsersScreen() : renderBanksScreen()}
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
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  statusText: {
    marginBottom: 12,
    color: '#555',
  },
  errorMessage: {
    textAlign: 'center',
    marginTop: 20,
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  form: {
    marginBottom: 20,
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  resultTitle: {
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  itemContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  itemName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});
