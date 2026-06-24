'use strict';

const axios = require('axios');
const Stock = require('../models/stock');
const crypto = require('crypto');

function hashIP(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {

      try {

        let { stock, like } = req.query;

        const ip = req.ip;
        const hashedIP = hashIP(ip);

        let stocks = Array.isArray(stock) ? stock : [stock];

        let results = [];

        for (let s of stocks) {

          s = s.toUpperCase();

          // 🔧 MOCK de precio (temporal)
          const result = await axios.get(
            `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${s}/quote`
          );
          console.log("RESULTADO API:", result.data);

          const price = result.data.price || result.data.latestPrice;

          let doc = await Stock.findOne({ stock: s });

          if (!doc) {
            doc = new Stock({
              stock: s,
              likes: 0,
              ips: []
            });
          }

          if (like === 'true') {
            if (!doc.ips.includes(hashedIP)) {
              doc.likes += 1;
              doc.ips.push(hashedIP);
            }
          }

          await doc.save();

          results.push({
            stock: s,
            price: price,
            likes: doc.likes
          });

        }

        if (results.length === 1) {
          return res.json({
            stockData: results[0]
          });
        }

        const rel1 = results[0].likes - results[1].likes;
        const rel2 = results[1].likes - results[0].likes;

        return res.json({
          stockData: [
            {
              stock: results[0].stock,
              price: results[0].price,
              rel_likes: rel1
            },
            {
              stock: results[1].stock,
              price: results[1].price,
              rel_likes: rel2
            }
          ]
        });

      } catch (err) {
        console.error(err);
        res.json({ error: 'error en servidor' });
      }

    });

};