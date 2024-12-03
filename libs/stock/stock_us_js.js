const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///美股目标价 or 港股目标价

async function stock_price_js(symbol = "us") {
    /**
     * 美股目标价 or 港股目标价
     * https://www.ushknews.com/report.html
     * @param {string} symbol - choice of {"us", "hk"}
     * @returns {Array<Object>} - 美股目标价 or 港股目标价
     */
    const url = "https://calendar-api.ushknews.com/getWebTargetPriceList";
    const params = {
        limit: '20',
        category: symbol,
    };
    const headers = {
        "accept": "application/json, text/plain, */*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        "origin": "https://www.ushknews.com",
        "pragma": "no-cache",
        "referer": "https://www.ushknews.com/",
        "sec-ch-ua": '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
        "x-app-id": "BNsiR9uq7yfW0LVz",
        "x-version": "1.0.0",
    };

    try {
        const response = await axios.get(url, { params, headers });
        const records = response.data?.data.list;
        let temp_df = records.map(record => ({
            // "_": record.id,
            // "_": record.indicator_id,
            "评级": record.latest_rating,
            // "_": record.previous_rating,
            "最新目标价": record.latest_target_price,
            "先前目标价": record.previous_target_price,
            "机构名称": record.institution,
            "日期": record.pub_time,
            // "_": record.status,
            "个股名称": record.name,
            // "_": record.us,
            // "_": record.hk,
        }));

        return temp_df;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
module.exports = {
    stock_price_js: stock_price_js,
};