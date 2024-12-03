const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-数据中心-现货与股票

async function futuresSpotStock(symbol = "能源") {
    /**
     * 东方财富网-数据中心-现货与股票
     * https://data.eastmoney.com/ifdata/xhgp.html
     * @param {string} symbol - choice of {'能源', '化工', '塑料', '纺织', '有色', '钢铁', '建材', '农副'}
     * @return {Object[]} 现货与股票上下游对应数据
     */
    const mapDict = {
        "能源": 0,
        "化工": 1,
        "塑料": 2,
        "纺织": 3,
        "有色": 4,
        "钢铁": 5,
        "建材": 6,
        "农副": 7,
    };

    const url = "https://data.eastmoney.com/ifdata/xhgp.html";
    const headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Host": "data.eastmoney.com",
        "Pragma": "no-cache",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36"
    };

    try {
        const response = await axios.get(url, { headers });
        const dataText = response.data;
        const pagedataStart = dataText.indexOf("pagedata");
        const pagedataEnd = dataText.indexOf("/newstatic/js/common/emdataview.js");
        let tempJson = JSON.parse(dataText.substring(pagedataStart, pagedataEnd).replace(/pagedata\s*=\s*/, '').trim());

        const dateList = Object.values(tempJson.dates);
        tempJson = tempJson.datas;
        const tempArray = tempJson[mapDict[symbol]];
        const tempDf = tempArray.list;

        const xyyhList = _.map(tempDf, item => item.xyyhs.length ? item.xyyhs.map(innerItem => innerItem.name).join(", ") : "-");
        const scsList = _.map(tempDf, item => item.scss.length ? item.scss.map(innerItem => innerItem.name).join(", ") : "-");

        const dfColumns = [
            "商品名称",
            ...dateList,
            "最新价格",
            "近半年涨跌幅",
            "生产商",
            "下游用户"
        ];

        // 更新 DataFrame 列值
        for (let i = 0; i < tempDf.length; i++) {
            tempDf[i].scss = scsList[i];
            tempDf[i].xyyhs = xyyhList[i];
        }

        // 将日期列转换为数值类型
        const numericColumns = [...dateList, "最新价格", "近半年涨跌幅"];
        for (const col of numericColumns) {
            for (let i = 0; i < tempDf.length; i++) {
                tempDf[i][col] = Number(tempDf[i][col]) || null;
            }
        }

        return { columns: dfColumns, data: tempDf };
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error;
    }
}
module.exports = {
    futures_spot_stock: futures_spot_stock,
};