const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///中国柯桥纺织指数
const { DataFrame } = require('dataframe-js');

async function index_kq_fz(symbol = "价格指数") {
    const symbolMap = {
        "价格指数": "1_1",
        "景气指数": "1_2",
        "外贸指数": "2",
    };

    const url = "http://www.kqindex.cn/flzs/table_data";
    const params = {
        category: "0",
        start: "",
        end: "",
        indexType: symbolMap[symbol],
        pageindex: "1",
        _: "1619871781413", // 这个时间戳可能需要动态生成
    };

    let bigDf = new DataFrame();
    const response = await axios.get(url, { params });
    const dataJson = response.data;
    const pageNum = dataJson.page;

    for (let page = 1; page <= pageNum; page++) {
        params.pageindex = page.toString();
        const res = await axios.get(url, { params });
        const tempData = res.data.result;
        const tempDf = new DataFrame(tempData);
        bigDf = bigDf.concat(tempDf, true); // ignore_index=True equivalent
    }

    if (symbol === "价格指数") {
        bigDf.columns = ["期次", "指数", "涨跌幅"];
        bigDf['期次'] = bigDf['期次'].map(date => dayjs(date).toDate());
        bigDf['指数'] = bigDf['指数'].map(num => Number(num) || null);
        bigDf['涨跌幅'] = bigDf['涨跌幅'].map(num => Number(num) || null);
    } else if (symbol === "景气指数") {
        bigDf.columns = ["期次", "总景气指数", "涨跌幅", "流通景气指数", "生产景气指数"];
        bigDf['总景气指数'] = bigDf['总景气指数'].map(num => Number(num) || null);
        bigDf['涨跌幅'] = bigDf['涨跌幅'].map(num => Number(num) || null);
        bigDf['流通景气指数'] = bigDf['流通景气指数'].map(num => Number(num) || null);
        bigDf['生产景气指数'] = bigDf['生产景气指数'].map(num => Number(num) || null);
    } else if (symbol === "外贸指数") {
        bigDf.columns = ["期次", "价格指数", "价格指数-涨跌幅", "景气指数", "景气指数-涨跌幅"];
        bigDf['价格指数'] = bigDf['价格指数'].map(num => Number(num) || null);
        bigDf['价格指数-涨跌幅'] = bigDf['价格指数-涨跌幅'].map(num => Number(num) || null);
        bigDf['景气指数'] = bigDf['景气指数'].map(num => Number(num) || null);
        bigDf['景气指数-涨跌幅'] = bigDf['景气指数-涨跌幅'].map(num => Number(num) || null);
    }

    // Sort by '期次' and reset index
    bigDf = bigDf.sort((a, b) => a.期次 - b.期次).resetIndex();

    return bigDf;
}
module.exports = {
    index_kq_fz : index_kq_fz,
};