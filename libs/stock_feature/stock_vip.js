const util = require('../util/util.js');
const axios = require('axios');
//龙虎榜 游资买卖明细
async function stock_getNewOneStockInfo_vip(date = '20240221', symbol = '000001') {
    let param_date = util.parseDate(date).fstr("YYYYMMDD");
    try {
        const url = 'https://applhb.longhuvip.com/w1/api/index.php?apiv=w38&PhoneOSNew=1&VerSion=5.16.0.0';

        const headers = {
            'Host': 'applhb.longhuvip.com',
            'Connection': 'keep-alive',
            'sec-ch-ua': '"Not A(Brand";v="99", "Android WebView";v="121", "Chromium";v="121"',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'sec-ch-ua-mobile': '?1',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 14; 2206123SC Build/UKQ1.231003.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/121.0.6167.180 Mobile Safari/537.36;kaipanla 5.16.0.0',
            'sec-ch-ua-platform': '"Android"',
            'Origin': 'https://apppage.longhuvip.com',
            'X-Requested-With': 'com.aiyu.kaipanla',
            'Sec-Fetch-Site': 'same-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://apppage.longhuvip.com/',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        };

        const data = new URLSearchParams({
            c: 'Stock',
            a: 'GetNewOneStockInfo',
            Type: '0',
            Time: param_date,
            StockID: symbol,
            DeviceID: 'f9eda184a48565f2',
        });

        const response = await axios.post(url, data, {
            headers
        });
        return response.data?.List || [];

    } catch (error) {
        console.error('Error fetching stock info:', error.message);
    }
}

module.exports = {
    stock_getNewOneStockInfo_vip,
}