module.exports = {
	preset: 'jest-expo',
	testEnvironment: 'jsdom',
	transformIgnorePatterns: [
		'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo|expo-secure-store|@react-native-async-storage/async-storage)'
	],
	moduleNameMapper: {
		'^react-native$': 'react-native',
	},
};


