const axios = require('axios');
const dayjs = require('dayjs');
const util = require('../util/util.js');
/**
 * 东方财富-个股-股票信息
 * https://quote.eastmoney.com/concept/sh603777.html?from=classic
 * @param {string} symbol - 股票代码
 * @returns {Promise<Object>} - 股票信息
 */
async function stock_individual_info_em(symbol = "603777") {
    const url = "http://push2.eastmoney.com/api/qt/stock/get";
    const params = new URLSearchParams({
        ut: "fa5fd1943c7b386f172d6893dbfba10b",
        fltt: "2",
        invt: "2",
        fields: "f120,f121,f122,f174,f175,f59,f163,f43,f57,f58,f169,f170,f46,f44,f51,f168,f47,f164,f116,f60,f45,f52,f50,f48,f167,f117,f71,f161,f49,f530,f135,f136,f137,f138,f139,f141,f142,f144,f145,f147,f148,f140,f143,f146,f149,f55,f62,f162,f92,f173,f104,f105,f84,f85,f183,f184,f185,f186,f187,f188,f189,f190,f191,f192,f107,f111,f86,f177,f78,f110,f262,f263,f264,f267,f268,f255,f256,f257,f258,f127,f199,f128,f198,f259,f260,f261,f171,f277,f278,f279,f288,f152,f250,f251,f252,f253,f254,f269,f270,f271,f272,f273,f274,f275,f276,f265,f266,f289,f290,f286,f285,f292,f293,f294,f295",
        secid: `${util.get_market_number(symbol)}.${symbol}`,
        _: Date.now()
    });

    try {
        const response = await axios.get(url, {
            params,
        });
        const row = response.data?.data;
        let result = {
            "股票代码": row.f57,
            "股票简称": row.f58,
            "总股本": row.f84,
            "流通股": row.f85,
            "行业": row.f127,
            "总市值": row.f116,
            "流通市值": row.f117,
            "上市时间": row.f189

        }
        return result;
    } catch (error) {
        console.error("Error fetching stock information:", error);
        throw error;
    }
}
module.exports = {
    stock_individual_info_em: stock_individual_info_em,
};