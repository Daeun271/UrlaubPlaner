import levenshtein from 'js-levenshtein';

const cache = {};

async function fetchCountyData(code) {
    if (cache[code]) {
        return cache[code];
    }

    const r = await fetch('/recommendations/' + code.toLowerCase() + '.json');
    if (r.status !== 200) {
        throw new Error('Unable to fetch data.');
    }

    const data = await r.json();
    cache[code] = data;

    return data;
}

export async function fetchTopSights(country, city) {
    const data = await fetchCountyData(country);

    if (city === '') {
        return data.sights;
    } else {
        let minDistance = Infinity;
        let closestCityName = null;

        for (const cityName in data.cities) {
            if (levenshtein(cityName, city) < minDistance) {
                closestCityName = cityName;
                minDistance = levenshtein(cityName, city);
            }
        }

        if (minDistance > city.length * 0.35 || closestCityName === null) {
            throw new Error('City not found.');
        }

        return data.cities[closestCityName];
    }
}
