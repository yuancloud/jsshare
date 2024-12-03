const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-行情中心-美股市场-粉单市场

async function stock_us_pink_spot_em() {
    const url = "https://23.push2.eastmoney.com/api/qt/clist/get";
    const params = {
        pn: "1",
        pz: "2000",
        po: "1",
        np: "1",
        ut: "bd1d9ddb04089700cf9c27f6f7426281",
        fltt: "2",
        invt: "2",
        fid: "f3",
        fs: "m:153",
        fields: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152",
        _: "1631271634231"
    };

    try {
        const response = await axios.get(url, { params });
        const records = response.data.data.diff;

        let result = records.map((record, index) => ({
            "最新价": record.f2,
            "涨跌幅": record.f3,
            "涨跌额": record.f4,
            "编码": record.f13 + '.' + record.f12,
            "名称": record.f14,
            "最高价": record.f15,
            "最低价": record.f16,
            "开盘价": record.f17,
            "昨收价": record.f18,
            "总市值": record.f20,
            "市盈率": record.f115
        }))

        return result;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch data from the API");
    }
}
module.exports = {
    stock_us_pink_spot_em: stock_us_pink_spot_em,
};