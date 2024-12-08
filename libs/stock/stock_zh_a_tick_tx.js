const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///腾讯财经-历史分笔数据
async function stock_zh_a_tick_tx_js(symbol = "sz000001") {
    let big_df = [];
    let page = 0;
    console.warn("正在下载数据，请稍等");

    while (true) {
        try {
            const url = "http://stock.gtimg.cn/data/index.php";
            const params = new URLSearchParams({
                appn: 'detail',
                action: 'data',
                c: symbol,
                p: page,
            });

            const response = await axios.get(url, { params: params, responseType: 'text' });
            const text_data = response.data;
            const start_index = text_data.indexOf("[");
            if (start_index < 0) break;
            const data = JSON.parse(`[${text_data.substring(start_index)}]`);
            const temp_df = data[0][1].split("|").map(item => item.split("/"));

            big_df = big_df.concat(temp_df);
            page += 1;
        } catch (error) {
            break;
        }
    }
    let property_map = {
        "S": "卖盘",
        "B": "买盘",
        "M": "中性盘",
    }
    let result = big_df.map(item => {
        return {
            成交时间: item[1]?.replace(/:/g, ''),
            成交价格: parseFloat(item[2]),
            价格变动: parseFloat(item[3]),
            成交量: parseInt(item[4]),
            成交金额: parseFloat(item[5]),
            性质: property_map[item[6]]
        };
    })
    return result;
}
module.exports = {
    stock_zh_a_tick_tx_js: stock_zh_a_tick_tx_js,
};