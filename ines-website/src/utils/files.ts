export const fetchJson = async (filename: string): Promise<unknown> => {
    const response = await fetch(filename)
    if (!response.ok) throw new Error('Failed to fetch JSON file')

    const json = await response.json()
    return json
}

export const fetchCSV = async (filename: string): Promise<string> => {
    const response = await fetch(filename)
    if (!response.ok) throw new Error('Failed to fetch CSV file')

    const csv = await response.text()
    return csv
}
