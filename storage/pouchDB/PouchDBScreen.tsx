import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, Switch, FlatList, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { 
  userPouch, 
  bankPouch, 
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

export default function PouchDBScreen({ onBack }: Props) {
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

  // Initialize PouchDB
  React.useEffect(() => {
    const initializeDB = async () => {
      try {
        await initDatabase();
        setIsInitialized(true);
        setStatus('PouchDB initialized successfully! (Using mock in Expo Go - use Dev Client for real PouchDB)');
        loadUsers();
      } catch (error: any) {
        setStatus(`PouchDB initialization failed: ${error.message}. This is expected in Expo Go. Use a Dev Client for full functionality.`);
        setIsInitialized(false);
      }
    };
    initializeDB();
  }, []);

  const loadUsers = async () => {
    if (!isInitialized) return;
    try {
      const pouchUsers = await userPouch.instance.readAll();
      const parsedUsers = pouchUsers.map((user, index) => {
        try {
          return parseUserData(user);
        } catch (parseError: any) {
          console.warn(`Failed to parse user at index ${index}:`, user, parseError);
          // Return a safe fallback user
          return {
            ...user,
            aboutHim: null,
            hisFamily: null,
          } as UserRecord;
        }
      });
      setUsers(parsedUsers as UserRecord[]);
      setStatus('Users loaded successfully!');
    } catch (error: any) {
      setStatus(`Error loading users: ${error.message}`);
    }
  };

  const loadBanks = async () => {
    if (!isInitialized) return;
    try {
      if (selectedUserId) {
        const pouchBanks = await bankPouch.instance.readByFilter({ userId: selectedUserId });
        setBanks(pouchBanks.map(parseBankData));
        setStatus(`Banks for user ${selectedUserId} loaded.`);
      } else {
        setBanks([]);
        setStatus('Select a user to view banks.');
      }
    } catch (error: any) {
      setStatus(`Error loading banks: ${error.message}`);
    }
  };

  React.useEffect(() => {
    if (currentScreen === 'banks') {
      loadBanks();
    }
  }, [currentScreen, selectedUserId, isInitialized]);

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
      setStatus('PouchDB not initialized.');
      return;
    }
    try {
      // Parse JSON fields safely
      let parsedAboutHim = null;
      let parsedHisFamily = null;
      
      try {
        parsedAboutHim = JSON.parse(userAboutHim);
      } catch (error) {
        console.warn('Invalid JSON in aboutHim field, using as string:', userAboutHim);
        parsedAboutHim = userAboutHim;
      }
      
      try {
        parsedHisFamily = userHisFamily.split(',').map(s => s.trim());
      } catch (error) {
        console.warn('Error parsing hisFamily field:', userHisFamily);
        parsedHisFamily = [userHisFamily];
      }

      const newId = await userPouch.instance.create(convertUserData({
        name: userName,
        age: parseInt(userAge),
        address: userAddress,
        isMarried: userIsMarried,
        aboutHim: parsedAboutHim,
        hisFamily: parsedHisFamily,
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
      setStatus('PouchDB not initialized.');
      return;
    }
    if (!selectedUserId) {
      setStatus('Please select a user to update.');
      return;
    }
    try {
      // Parse JSON fields safely for update
      let parsedAboutHim = null;
      let parsedHisFamily = null;
      
      try {
        parsedAboutHim = JSON.parse(userAboutHim);
      } catch (error) {
        console.warn('Invalid JSON in aboutHim field, using as string:', userAboutHim);
        parsedAboutHim = userAboutHim;
      }
      
      try {
        parsedHisFamily = userHisFamily.split(',').map(s => s.trim());
      } catch (error) {
        console.warn('Error parsing hisFamily field:', userHisFamily);
        parsedHisFamily = [userHisFamily];
      }

      const updated = await userPouch.instance.update(selectedUserId, {
        name: userName,
        age: parseInt(userAge),
        address: userAddress,
        isMarried: userIsMarried,
        aboutHim: parsedAboutHim,
        hisFamily: parsedHisFamily,
      });
      setStatus(updated ? `User ID ${selectedUserId} updated.` : `User ID ${selectedUserId} not found.`);
      resetUserForm();
      loadUsers();
    } catch (error: any) {
      setStatus(`Error updating user: ${error.message}`);
    }
  };

  const deleteUser = async (id: string) => {
    if (!isInitialized) {
      setStatus('PouchDB not initialized.');
      return;
    }
    try {
      const deleted = await userPouch.instance.delete(id);
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
      setStatus('PouchDB not initialized.');
      return;
    }
    try {
      const deleted = await userPouch.instance.deleteAll();
      setStatus(deleted ? 'All users deleted.' : 'No users to delete.');
      resetUserForm();
      loadUsers();
      setSelectedUserId(null);
    } catch (error: any) {
      setStatus(`Error deleting all users: ${error.message}`);
    }
  };

  const clearCorruptedData = async () => {
    if (!isInitialized) {
      setStatus('PouchDB not initialized.');
      return;
    }
    try {
      // Clear all data to remove any corrupted entries
      await userPouch.instance.deleteAll();
      await bankPouch.instance.deleteAll();
      setStatus('All data cleared. This should resolve any JSON parsing issues.');
      resetUserForm();
      loadUsers();
      setSelectedUserId(null);
    } catch (error: any) {
      setStatus(`Error clearing data: ${error.message}`);
    }
  };

  const selectUser = (user: UserRecord) => {
    setSelectedUserId(user._id!);
    setUserName(user.name);
    setUserAge(user.age.toString());
    setUserAddress(user.address || '');
    setUserIsMarried(user.isMarried || false);
    
    // Handle aboutHim field safely
    try {
      if (user.aboutHim) {
        if (typeof user.aboutHim === 'string') {
          setUserAboutHim(user.aboutHim);
        } else {
          setUserAboutHim(JSON.stringify(user.aboutHim));
        }
      } else {
        setUserAboutHim('{"bio":"..."}');
      }
    } catch (error) {
      console.warn('Error handling aboutHim field:', error);
      setUserAboutHim('{"bio":"..."}');
    }
    
    // Handle hisFamily field safely
    try {
      if (user.hisFamily) {
        if (Array.isArray(user.hisFamily)) {
          setUserHisFamily(user.hisFamily.join(','));
        } else if (typeof user.hisFamily === 'string') {
          setUserHisFamily(user.hisFamily);
        } else {
          setUserHisFamily('Alice,Bob');
        }
      } else {
        setUserHisFamily('Alice,Bob');
      }
    } catch (error) {
      console.warn('Error handling hisFamily field:', error);
      setUserHisFamily('Alice,Bob');
    }
    
    setStatus(`User ID ${user._id} selected.`);
  };

  // Bank CRUD
  const createBank = async () => {
    if (!isInitialized) {
      setStatus('PouchDB not initialized.');
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
      const newId = await bankPouch.instance.create(convertBankData({
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
      setStatus('PouchDB not initialized.');
      return;
    }
    try {
      const deleted = await bankPouch.instance.delete(id);
      setStatus(deleted ? `Bank ID ${id} deleted.` : `Bank ID ${id} not found.`);
      loadBanks();
    } catch (error: any) {
      setStatus(`Error deleting bank: ${error.message}`);
    }
  };

  const deleteAllBanks = async () => {
    if (!isInitialized) {
      setStatus('PouchDB not initialized.');
      return;
    }
    try {
      const deleted = await bankPouch.instance.deleteAll();
      setStatus(deleted ? 'All banks deleted.' : 'No banks to delete.');
      loadBanks();
    } catch (error: any) {
      setStatus(`Error deleting all banks: ${error.message}`);
    }
  };

  const renderUserItem = ({ item }: { item: UserRecord }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.name} (ID: {item._id})</Text>
      <Text>Age: {item.age}, Married: {item.isMarried ? 'Yes' : 'No'}</Text>
      <Text>Address: {item.address}</Text>
      <View style={styles.itemActions}>
        <Button title="Select" onPress={() => selectUser(item)} disabled={selectedUserId === item._id} />
        <Button title="Update" onPress={() => selectUser(item)} />
        <Button title="Delete" onPress={() => deleteUser(item._id!)} />
      </View>
    </View>
  );

  const renderBankItem = ({ item }: { item: BankRecord }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.bankName} (ID: {item.bankId})</Text>
      <Text>PouchDB ID: {item._id}, User ID: {item.userId}</Text>
      <View style={styles.itemActions}>
        <Button title="Delete" onPress={() => deleteBank(item._id!)} />
      </View>
    </View>
  );

  const renderUsersScreen = () => (
    <FlatList
      data={users}
      renderItem={renderUserItem}
      keyExtractor={(item) => item._id!}
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
          <View style={styles.actions}>
            <Button title="Clear Corrupted Data" onPress={clearCorruptedData} disabled={!isInitialized} color="#ff6b6b" />
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
      keyExtractor={(item) => item._id!}
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
          <Text style={styles.title}>PouchDB Demo</Text>
          {onBack ? <Button title="Back" onPress={onBack} /> : null}
        </View>
        <Text style={styles.statusText}>Status: {status}</Text>
        <Text style={styles.loadingText}>Initializing PouchDB...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>PouchDB Demo</Text>
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
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
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
