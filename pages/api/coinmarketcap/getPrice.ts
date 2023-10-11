import axios from 'axios';
import dotenv from 'dotenv';
import type { NextApiRequest, NextApiResponse } from 'next';

dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { symbol, currency } = req.query;
  console.log(req.query);
  try {
    if (symbol && currency) {
      const axiosConfig = { headers: { 'X-CMC_PRO_API_KEY': process.env.COIN_MARKET_CAP_API_KEY } };
      const prices = await axios.get(
        `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${symbol}&convert=${(
          currency as string
        ).toUpperCase()}`,
        axiosConfig
      );

      if (prices.status === 200) {
        // Get current data
        // Coinmarketcap's data is a collection of objects with "id" as its key
        const priceData = prices.data.data;

        res.status(200).json({
          message: `${symbol} conversion rates to ${currency} fetched`,
          price: priceData[symbol as string][0].quote[currency as string].price
        });
        return;
      } else throw prices;
    } else throw 'No symbol or currency';
  } catch (err) {
    console.log('Error getting price', err);
  }
  res.status(200).json({ message: 'Something went wrong', price: 0 });
  return;
}
