export async function fetchCurrency() {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (response.status === 200) {
        return response.json();
    } else {
        throw new Error('Unable to fetch data.');
    }
}