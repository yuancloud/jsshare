const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///https://datacenter.jin10.com/market

async function stock_js_weibo_nlp_time() {
    /**
     * https://datacenter.jin10.com/market
     * @return {Object} 特定时间表示的字典
     */
    const url = "https://datacenter-api.jin10.com/weibo/config";
    const payload = { "_": Date.now() };
    const headers = {
        "authority": "datacenter-api.jin10.com",
        "pragma": "no-cache",
        "cache-control": "no-cache",
        "accept": "*/*",
        "x-app-id": "rU6QIu7JHe2gOUeR",
        "sec-fetch-dest": "empty",
        "x-csrf-token": "",
        "x-version": "1.0.0",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.116 Safari/537.36",
        "origin": "https://datacenter.jin10.com",
        "sec-fetch-site": "same-site",
        "sec-fetch-mode": "cors",
        "referer": "https://datacenter.jin10.com/market",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8"
    };

    try {
        const response = await axios.get(url, { headers: headers, params: payload });
        return response.data.data.timescale;
    } catch (error) {
        console.error("请求出错：", error);
        throw error; // 或者根据需要处理错误
    }
}
///金十数据中心-实时监控-微博舆情报告

async function stock_js_weibo_report(time_period = "CNHOUR12") {
    /**
     * 金十数据中心-实时监控-微博舆情报告
     * https://datacenter.jin10.com/market
     * @param {string} time_period - 时间段选项: 'CNHOUR2', 'CNHOUR6', 'CNHOUR12', 'CNHOUR24', 'CNDAY7', 'CNDAY30'
     * @returns {Promise<Array>} - 指定时间段的微博舆情报告
     */
    const url = "https://datacenter-api.jin10.com/weibo/list";
    const payload = {
        timescale: time_period,
        _: Date.now()
    };
    const headers = {
        'authority': 'datacenter-api.jin10.com',
        'pragma': 'no-cache',
        'cache-control': 'no-cache',
        'accept': '*/*',
        'x-app-id': 'rU6QIu7JHe2gOUeR',
        'sec-fetch-dest': 'empty',
        'x-csrf-token': '',
        'x-version': '1.0.0',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.116 Safari/537.36',
        'origin': 'https://datacenter.jin10.com',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'referer': 'https://datacenter.jin10.com/market',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8'
    };

    try {
        const response = await axios.get(url, { params: payload, headers: headers });
        let tempData = response.data.data;
        // 将rate字段转换为数字类型
        tempData.forEach(item => {
            item.rate = parseFloat(item.rate);
        });
        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
module.exports = {
    stock_js_weibo_nlp_time: stock_js_weibo_nlp_time,
    stock_js_weibo_report: stock_js_weibo_report,
};