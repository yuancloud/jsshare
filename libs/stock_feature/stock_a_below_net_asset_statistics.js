const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///破净股统计历史走势
async function stock_a_below_net_asset_statistics(symbol = "全部A股") {
    /**
     * 破净股统计历史走势
     * @param {string} symbol - 选择范围 {"全部A股", "沪深300", "上证50", "中证500"}
     * @returns {Array} - 包含破净股统计历史走势的数据
     */
    const symbolMap = {
        "全部A股": "1",
        "沪深300": "000300.XSHG",
        "上证50": "000016.SH",
        "中证500": "000905.SH",
    };
    const url = "https://legulegu.com/stockdata/below-net-asset-statistics-data";
    const params = {
        marketId: symbolMap[symbol],
        token: "325843825a2745a2a8f9b9e3355cb864",
    };

    try {
        const response = await axios.get(url, { params });
        let result = response.data.map(row => {
            row.date = dayjs(row.date).format("YYYYMMDD");
            delete row.marketId
            return row
        });
        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
module.exports = {
    stock_a_below_net_asset_statistics: stock_a_below_net_asset_statistics,
};