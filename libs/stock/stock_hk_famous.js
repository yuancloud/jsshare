const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-行情中心-港股市场-知名港股

async function stock_hk_famous_spot_em() {
    const url = "https://69.push2.eastmoney.com/api/qt/clist/get";
    const params = new URLSearchParams({
        pn: "1",
        pz: "2000",
        po: "1",
        np: "1",
        ut: "bd1d9ddb04089700cf9c27f6f7426281",
        fltt: "2",
        invt: "2",
        dect: "1",
        wbp2u: "|0|0|0|web",
        fid: "f3",
        fs: "b:DLMK0106",
        fields: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152",
        _: "1631271634231"
    });

    try {
        const response = await axios.get(url, { params: params });
        const records = response.data?.data.diff;

        // 重命名列
        let result = records.map((row, index) => ({
            "序号": row.f1,
            "最新价": row.f2,
            "涨跌幅": row.f3,
            "涨跌额": row.f4,
            "成交量": row.f5,
            "成交额": row.f6,
            "代码": row.f12,
            "编码": row.f13,
            "名称": row.f14,
            "最高": row.f15,
            "最低": row.f16,
            "今开": row.f17,
            "昨收": row.f18,
            "总市值": row.f20,
            "市盈率": row.f115,
        }));
        return result;
    } catch (error) {
        console.error(error);
        throw error; // 或者返回一个空数组或错误信息
    }
}
module.exports = {
    stock_hk_famous_spot_em: stock_hk_famous_spot_em,
};