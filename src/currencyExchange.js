async function fetchUsdRates() {
    const localStorageRates = localStorage.getItem('currencyRates');
    if (localStorageRates) {
        const { rates, timestamp } = JSON.parse(localStorageRates);
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            return rates;
        }
    }

    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (response.status === 200) {
        const rates = (await response.json()).rates;

        localStorage.setItem(
            'currencyRates',
            JSON.stringify({
                rates,
                timestamp: Date.now(),
            }),
        );

        return rates;
    } else {
        throw new Error('Unable to fetch data.');
    }
}

let usdRatesPromise = null;

export async function convertCurrency(amount, from, to) {
    if (!usdRatesPromise) {
        usdRatesPromise = fetchUsdRates();
    }

    const usdRates = await usdRatesPromise;

    if (from === 'USD') {
        return amount * usdRates[to];
    } else if (to === 'USD') {
        return amount / usdRates[from];
    } else {
        return (amount / usdRates[from]) * usdRates[to];
    }
}

async function cacheCurrencyRates() {
    await convertCurrency(1, 'USD', 'USD');
}

cacheCurrencyRates();

setInterval(
    () => {
        usdRatesPromise = null;
    },
    24 * 60 * 60 * 1000,
);

/*
1. fetch only once and cache it in background
2. cache in local storage and set life time of fetched data
3. optimize code complexity and memory (Decide between code complexity and speed)
Version 1
let usdRatesPromise = null;
let invUsdRates = null;

export async function convertCurrency(amount, from, to) {
    if (!usdRatesPromise) {
        usdRatesPromise = fetchUsdRates();
    }

    const usdRates = await usdRatesPromise;
    if (!invUsdRates) {
        invUsdRates = Object.fromEntries(
            Object.entries(usdRates).map(([k, v]) => [k, 1 / v])
        );
    }

    if (from === 'USD') {
        return amount * usdRates[to];
    } else if (to === 'USD') {
        return amount * invUsdRates[from];
    } else {
        return amount * invUsdRates[from] * usdRates[to];
    }
}

Version 2: it is not complicated, but it takes longer time because of division. Divide operation is pretty much slower than multiply operation
let usdRatesPromise = null;

export async function convertCurrency(amount, from, to) {
    if (!usdRatesPromise) {
        usdRatesPromise = fetchUsdRates();
    }

    const usdRates = await usdRatesPromise;

    if (from === 'USD') {
        return amount * usdRates[to];
    } else if (to === 'USD') {
        return amount / usdRates[from];
    } else {
        return amount / usdRates[from] * usdRates[to];
    }
}
4. set interval to reset usdRatesPromise for user using the app for a long time
5. Optimazation possibility: not using timestamp, but using version number for excact accuracy
*/
