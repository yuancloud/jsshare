const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富-个股人气榜-飙升榜

async function stock_hot_up_em() {
    const url1 = "https://emappdata.eastmoney.com/stockrank/getAllHisRcList";
    const payload = {
        appId: "appId01",
        globalId: "786e4c21-70dc-435a-93bb-38",
        marketType: "",
        pageNo: 1,
        pageSize: 100,
    };

    try {
        const response1 = await axios.post(url1, payload);
        const records_rank = response1.data.data;

        const secids = records_rank.map(row => {
            let item = row.sc;
            return (item.includes("SZ") ? "0" : "1") + "." + item.substring(2);
        }).join(",") + "?v=08926209912590994";
        const params = {
            ut: "f057cbcbce2a86e2866ab8877db1d059",
            fltt: "2",
            invt: "2",
            fields: "f14,f3,f12,f2",
            secids: secids,
        };

        const url2 = "https://push2.eastmoney.com/api/qt/ulist.np/get";
        const response2 = await axios.get(url2, { params });
        const result = _.map(response2.data.data.diff, (diffItem, index) => ({
            最新价: diffItem.f2,
            涨跌幅: diffItem.f3,
            代码: diffItem.f12,
            股票名称: diffItem.f14,
            当前排名: records_rank.find(f => f.sc.endsWith(diffItem.f12)).rk,
            排名较昨日变动: records_rank.find(f => f.sc.endsWith(diffItem.f12)).hrc
        }));

        return result
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error; // 或者您可以选择其他方式处理错误
    }
}
module.exports = {
    stock_hot_up_em: stock_hot_up_em,
};