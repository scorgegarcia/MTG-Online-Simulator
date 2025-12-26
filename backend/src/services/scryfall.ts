import axios from 'axios';

const BASE_URL = process.env.SCRYFALL_BASE_URL || 'https://api.scryfall.com';

export const searchCards = async (query: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/cards/search`, {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    return { data: [] };
  }
};

export const autocompleteCards = async (query: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/cards/autocomplete`, {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    return { data: [] };
  }
};

export const getCardById = async (id: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/cards/${id}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const getCardsCollection = async (identifiers: any[]) => {
    try {
        const response = await axios.post(`${BASE_URL}/cards/collection`, {
            identifiers
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching collection from Scryfall', error);
        return { data: [], not_found: [] };
    }
};
