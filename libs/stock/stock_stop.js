const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-行情中心-沪深个股-两网及退市

async function stock_staq_net_stop() {
    /**
     * 东方财富网-行情中心-沪深个股-两网及退市
     * https://quote.eastmoney.com/center/gridlist.html#staq_net_board
     * @return {Object} 两网及退市
     */
    const url = "http://5.push2.eastmoney.com/api/qt/clist/get";
    const params = new URLSearchParams({
        pn: "1",
        pz: "2000",
        po: "1",
        np: "1",
        ut: "bd1d9ddb04089700cf9c27f6f7426281",
        fltt: "2",
        invt: "2",
        fid: "f3",
        fs: "m:0 s:3",
        fields: "f12,f14",
        _: "1622622663841"
    });

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempDf = _.map(dataJson.data.diff, (item) => ({
            code: item.f12,
            name: item.f14
        }));
        // 添加序号列
        return tempDf; // 返回一个对象数组
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

// 注意：此函数返回的是一个Promise，需要通过.then()或async/await来处理结果。
module.exports = {
    stock_staq_net_stop: stock_staq_net_stop,
};