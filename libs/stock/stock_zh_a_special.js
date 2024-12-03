const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-行情中心-沪深个股-风险警示板
async function stock_zh_a_st_em() {
    const url = 'http://40.push2.eastmoney.com/api/qt/clist/get';
    const params = {
        pn: '1',
        pz: '2000',
        po: '1',
        np: '1',
        ut: 'bd1d9ddb04089700cf9c27f6f7426281',
        fltt: '2',
        invt: '2',
        fid: 'f3',
        fs: 'm:0 f:4,m:1 f:4',
        fields: 'f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
        _: '1631107510188'
    };

    try {
        const response = await axios.get(url, { params });
        const records = response.data?.data.diff;
        // 重命名列名
        let result = records.map((record) => ({
            '最新价': record.f2,
            '涨跌幅': record.f3,
            '涨跌额': record.f4,
            '成交量': record.f5,
            '成交额': record.f6,
            '振幅': record.f7,
            '换手率': record.f8,
            '市盈率-动态': record.f9,
            '量比': record.f10,
            '代码': record.f12,
            '名称': record.f14,
            '最高': record.f15,
            '最低': record.f16,
            '今开': record.f17,
            '昨收': record.f18,
            '市净率': record.f23
        }));

        return result;
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        throw error;
    }
}
///东方财富网-行情中心-沪深个股-新股

async function stock_zh_a_new_em() {
    const url = 'http://40.push2.eastmoney.com/api/qt/clist/get';
    const params = new URLSearchParams({
        pn: '1',
        pz: '2000',
        po: '1',
        np: '1',
        ut: 'bd1d9ddb04089700cf9c27f6f7426281',
        fltt: '2',
        invt: '2',
        fid: 'f26',
        fs: 'm:0 f:8,m:1 f:8',
        fields: 'f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
        _: '1631107510188'
    });

    try {
        const response = await axios.get(url, { params });
        const records = response.data?.data.diff;
        let result = records.map((item, index) => ({
            序号: index + 1,
            最新价: item.f2,
            涨跌幅: item.f3,
            涨跌额: item.f4,
            成交量: item.f5,
            成交额: item.f6,
            振幅: item.f7,
            换手率: item.f8,
            市盈率动态: item.f9,
            量比: item.f10,
            代码: item.f12,
            名称: item.f14,
            最高: item.f15,
            最低: item.f16,
            今开: item.f17,
            昨收: item.f18,
            市净率: item.f23
        }));

        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
///东方财富网-行情中心-沪深个股-两网及退市

async function stock_zh_a_stop_em() {
    const url = 'http://40.push2.eastmoney.com/api/qt/clist/get';
    const params = new URLSearchParams({
        'pn': '1',
        'pz': '2000',
        'po': '1',
        'np': '1',
        'ut': 'bd1d9ddb04089700cf9c27f6f7426281',
        'fltt': '2',
        'invt': '2',
        'fid': 'f3',
        'fs': 'm:0 s:3',
        'fields': 'f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
        '_': '1631107510188',
    });

    try {
        const response = await axios.get(url, { params });
        const records = response.data?.data.diff;
        let temp_df = records.map((item, index) => ({
            '序号': index + 1,
            '最新价': item.f2,
            '涨跌幅': item.f3,
            '涨跌额': item.f4,
            '成交量': item.f5,
            '成交额': item.f6,
            '振幅': item.f7,
            '换手率': item.f8,
            '市盈率-动态': item.f9,
            '量比': item.f10,
            '代码': item.f12,
            '名称': item.f14,
            '最高': item.f15,
            '最低': item.f16,
            '今开': item.f17,
            '昨收': item.f18,
            '市净率': item.f23,
        }));

        return temp_df;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
///新浪财经-行情中心-沪深股市-次新股
async function stock_zh_a_new() {
    const urlCount = "http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeStockCount";
    const paramsCount = { node: 'new_stock' };

    try {
        const responseCount = await axios.get(urlCount, { params: paramsCount });
        const totalPage = Math.ceil(parseInt(responseCount.data) / 80);

        const urlData = "http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData";
        let bigArray = [];

        for (let page = 1; page <= totalPage; page++) {
            const paramsData = {
                page: String(page),
                num: "80",
                sort: "symbol",
                asc: "1",
                node: "new_stock",
                symbol: "",
                _s_r_a: "page"
            };

            const responseData = await axios.get(urlData, { params: paramsData, responseType: 'text' });
            const dataJson = JSON.parse(responseData.data.replace(/\'/g, '"'));
            bigArray = bigArray.concat(dataJson);
        }
        let result = bigArray.forEach((item, index) => {
            item.buy = parseFloat(item.buy);
            item.sell = parseFloat(item.sell);
            item.high = parseFloat(item.high);
            item.low = parseFloat(item.low);
            item.open = parseFloat(item.open);
            item.settlement = parseFloat(item.settlement);
            item.trade = parseFloat(item.trade);
        })
        return result;
    } catch (error) {
        console.error("Error fetching or processing data:", error);
        throw error;
    }
}

// 注意：此函数返回的是一个Promise，调用时需要使用await或.then方法。
module.exports = {
    stock_zh_a_st_em: stock_zh_a_st_em,
    stock_zh_a_new_em: stock_zh_a_new_em,
    stock_zh_a_stop_em: stock_zh_a_stop_em,
    stock_zh_a_new: stock_zh_a_new,
};