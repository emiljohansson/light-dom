let idCounter: number = 0

export default (prefix: string):string => `${prefix}_${idCounter++}`
