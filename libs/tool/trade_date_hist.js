const axios = require('axios');
const dayjs = require('dayjs');
const util = require('../util/util');

async function tool_trade_date_hist_sina() {
    const url = "https://finance.sina.com.cn/realstock/company/klc_td_sh.txt";
    try {
        const response = await axios.get(url);
        let str = response.data.split("=")[1].split(";")[0].replace(/"/g, "");
        let records = util.hk_js_decode(str)
        let result = records.map(e => ({ trade_date: dayjs(e).format('YYYYMMDD') }));
        return result;
    } catch (error) {
        console.error('Error fetching or processing data:', error);
        throw error;
    }
}
module.exports = {
    tool_trade_date_hist_sina: tool_trade_date_hist_sina,
};