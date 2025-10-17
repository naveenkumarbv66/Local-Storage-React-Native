import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, Switch, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { storage } from './index';

type Props = {
	onBack?: () => void;
};

export default function AsyncStorageScreen({ onBack }: Props) {
	const [strVal, setStrVal] = React.useState('');
	const [numVal, setNumVal] = React.useState('');
	const [boolVal, setBoolVal] = React.useState(false);
	const [arrVal, setArrVal] = React.useState('a,b,c');

	const [readStr, setReadStr] = React.useState<string | null>(null);
	const [readNum, setReadNum] = React.useState<number | null>(null);
	const [readBool, setReadBool] = React.useState<boolean | null>(null);
	const [readArr, setReadArr] = React.useState<string[] | null>(null);

	const writeAll = async () => {
		await storage.setString('demo:string', strVal);
		const parsedNum = Number(numVal);
		if (!Number.isNaN(parsedNum)) {
			await storage.setNumber('demo:number', parsedNum);
		}
		await storage.setBoolean('demo:boolean', boolVal);
		const arr = arrVal
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		await storage.setArray('demo:array', arr);
	};

	const readAll = async () => {
		setReadStr(await storage.getString('demo:string'));
		setReadNum(await storage.getNumber('demo:number'));
		setReadBool(await storage.getBoolean('demo:boolean'));
		setReadArr(await storage.getArray('demo:array'));
	};

	const removeAll = async () => {
		await storage.remove('demo:string');
		await storage.remove('demo:number');
		await storage.remove('demo:boolean');
		await storage.remove('demo:array');
		setReadStr(null);
		setReadNum(null);
		setReadBool(null);
		setReadArr(null);
	};

	const clear = async () => {
		await storage.clearAll();
		setReadStr(null);
		setReadNum(null);
		setReadBool(null);
		setReadArr(null);
	};

	return (
		<View style={styles.container}>
			<StatusBar style="auto" />
			<View style={styles.header}>
				<Text style={styles.title}>AsyncStorage Demo</Text>
				{onBack ? <Button title="Back" onPress={onBack} /> : null}
			</View>
			<ScrollView contentContainerStyle={styles.scroll}>
				<View style={styles.block}>
					<Text style={styles.label}>String</Text>
					<TextInput
						style={styles.input}
						placeholder="Enter a string"
						value={strVal}
						onChangeText={setStrVal}
					/>
				</View>

				<View style={styles.block}>
					<Text style={styles.label}>Number</Text>
					<TextInput
						style={styles.input}
						keyboardType="number-pad"
						placeholder="123"
						value={numVal}
						onChangeText={setNumVal}
					/>
				</View>

				<View style={styles.blockRow}>
					<Text style={styles.label}>Boolean</Text>
					<Switch value={boolVal} onValueChange={setBoolVal} />
				</View>

				<View style={styles.block}>
					<Text style={styles.label}>Array (comma separated)</Text>
					<TextInput
						style={styles.input}
						placeholder="a,b,c"
						value={arrVal}
						onChangeText={setArrVal}
					/>
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
					<Text>String: {readStr === null ? 'null' : readStr}</Text>
					<Text>Number: {readNum === null ? 'null' : String(readNum)}</Text>
					<Text>Boolean: {readBool === null ? 'null' : String(readBool)}</Text>
					<Text>Array: {readArr === null ? 'null' : `[${readArr.join(', ')}]`}</Text>
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
	scroll: {
		paddingBottom: 40,
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
	results: {
		marginTop: 8,
		paddingTop: 8,
		borderTopWidth: 1,
		borderTopColor: '#eee',
		gap: 4,
	},
	resultTitle: {
		fontWeight: '600',
		marginBottom: 4,
	},
});


