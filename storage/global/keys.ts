export const KEYS = {
	name: 'global:name',
	age: 'global:age',
	address: 'global:address',
	isMarried: 'global:isMarried',
	aboutHim: 'global:aboutHim',
	hisFamily: 'global:hisFamily',
} as const;

export type KeyName = keyof typeof KEYS;


