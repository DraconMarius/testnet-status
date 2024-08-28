export const getDB = async () => {
    const fetchURL = '/api/getDB'
    try {
        const response = await fetch(fetchURL);

        // console.log(response);
        if (!response.ok) throw new Error('transaction fetch error');

        const data = await response.json();

        return data;

    } catch (err) {
        console.error(`Failed to fetch DB`, err)
    }
};