const axios = require('axios');
const dayjs = require('dayjs');
///乐咕乐股-创新高、新低的股票数量
async function stock_a_high_low_statistics(symbol = "all") {
    /**
     * 乐咕乐股-创新高、新低的股票数量
     * https://www.legulegu.com/stockdata/high-low-statistics
     * @param {string} symbol - choice of {"all", "sz50", "hs300", "zz500"}
     * @returns {Promise<Object[]>} 创新高、新低的股票数量
     */
    const url = `https://www.legulegu.com/stockdata/member-ship/get-high-low-statistics/${symbol}`;
    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)Chrome/114.0.0.0 Safari/537.36"
            }
        });
        let dataJson = response.data;

        // 将原始数据转换为适当的格式
        let tempData = dataJson.map(item => ({
            date: dayjs(item.date).format('YYYY-MM-DD'),
            close: parseFloat(item.close),
            high20: parseFloat(item.high20),
            low20: parseFloat(item.low20),
            high60: parseFloat(item.high60),
            low60: parseFloat(item.low60),
            high120: parseFloat(item.high120),
            low120: parseFloat(item.low120)
        }));
        let result = tempData.sort((a, b) => a.date - b.date);
        return result;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error;
    }
}
module.exports = {
    stock_a_high_low_statistics: stock_a_high_low_statistics,
};