const axios = require('axios');
const util = require('../util/util.js');
const _ = require('lodash');
///新浪财经-日内分时数据
// const dayjs = require('dayjs'); // 如果需要处理日期，可以引入dayjs

async function stock_intraday_sina(symbol = 'sz000001', date = '20241111') {
    /**
     * 新浪财经-日内分时数据
     * @param {string} symbol - 股票代码
     * @param {string} date - 交易日
     * @returns {Promise<Array>} 分时数据
     */
    const urlCount = "https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_Bill.GetBillListCount";
    const params = {
        symbol: symbol,
        num: '60',
        page: '1',
        sort: 'ticktime',
        asc: '0',
        volume: '0',
        amount: '0',
        type: '0',
        day: [date.slice(0, 4), date.slice(4, 6), date.slice(6)].join('-'),
    };
    const headers = {
        Referer: `https://vip.stock.finance.sina.com.cn/quotes_service/view/cn_bill.php?symbol=${symbol}`,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
    };

    let response = await axios.get(urlCount, { params, headers });
    let totalPage = Math.ceil(parseInt(response.data) / 60);

    const urlData = "https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_Bill.GetBillList";
    let bigDf = [];

    for (let page = 1; page <= totalPage; page++) {
        params.page = page.toString();
        response = await axios.get(urlData, { params, headers });
        let tempDf = response.data;
        if (Array.isArray(tempDf)) {
            bigDf = bigDf.concat(tempDf);
        }
    }
    bigDf.forEach(item => {
        item.price = item.price.replace(/,/g, '');
        item.volume = item.volume.replace(/,/g, '');
        item.prev_price = item.prev_price.replace(/,/g, '');
    })

    return bigDf;
}

// 注意：此函数返回的是一个Promise对象，你需要使用await或.then()来获取结果。
module.exports = {
    stock_intraday_sina: stock_intraday_sina,
};