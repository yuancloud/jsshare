const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///财新网-财新数据通
async function stock_news_main_cx() {
    /**
     * 财新网-财新数据通
     * https://cxdata.caixin.com/pc/
     * @returns {Array} 特定时间表示的对象数组
     */

    const url = "https://cxdata.caixin.com/api/dataplus/sjtPc/jxNews";
    const params = new URLSearchParams({
        pageNum: "1",
        pageSize: "20000",
        showLabels: "true"
    });

    try {
        const response = await axios.get(url, { params: params });
        const result = response.data.data.data;

        result.forEach(item => {
            delete item.id;
            if (!item.pic) {
                delete item.pic;
            }
            item.pubTime = dayjs(item.pubTime).format()
        });

        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // 或者返回一个空数组或其他错误处理方式
    }
}
module.exports = {
    stock_news_main_cx: stock_news_main_cx,
};