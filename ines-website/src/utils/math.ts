export function sort (arr: string[], isNum: boolean): string[] {
    return arr.sort((a, b) => {
        if (isNum) {
            const [numA, numB] = [Number(a), Number(b)]
            return Number(numA) - Number(numB)
        } else {
            return a.localeCompare(b)
        }
    })
}

export function sortBy (arr: { [key: string]: unknown }[], keyName: string, isNum: boolean): { [key: string]: unknown }[] {
    return arr.sort((a, b) => {
        if (isNum) {
            const [numA, numB] = [Number(a[keyName]), Number(b[keyName])]
            return Number(numA) - Number(numB)
        } else {
            return (a[keyName] as string).localeCompare(b[keyName] as string)
        }
    })
}
