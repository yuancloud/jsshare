const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///新浪财经-商品现货价格指数

async function spotGoods(symbol = "波罗的海干散货指数") {
    /**
     * 新浪财经-商品现货价格指数
     * http://finance.sina.com.cn/futuremarket/spotprice.shtml#titlePos_0
     * @param {string} symbol - 可选值为 {"波罗的海干散货指数", "钢坯价格指数", "澳大利亚粉矿价格"}
     * @returns {Promise<Array>} 商品现货价格指数列表
     */
    const url = "http://stock.finance.sina.com.cn/futures/api/openapi.php/GoodsIndexService.get_goods_index";
    const symbolUrlDict = {
        "波罗的海干散货指数": "BDI",
        "钢坯价格指数": "GP",
        "澳大利亚粉矿价格": "PB",
    };
    
    const params = new URLSearchParams({
        symbol: symbolUrlDict[symbol],
        table: '0'
    });

    try {
        const response = await axios.get(url, { params: params.toString(), responseType: 'json' });
        const dataJson = response.data;
        
        let tempData = _.get(dataJson, 'result.data.data', []);
        tempData = tempData.map(item => ({
            日期: dayjs(item.opendate, 'YYYY-MM-DD').toDate(),
            指数: parseFloat(item.price) || null,
            涨跌额: parseFloat(item.zde) || null,
            涨跌幅: parseFloat(item.zdf) || null
        }));
        
        return tempData;
    } catch (error) {
        console.error(`Error fetching goods index for ${symbol}:`, error);
        throw error; // 或者返回一个空数组或其他错误处理逻辑
    }
}
module.exports = {
    spot_goods : spot_goods,
};