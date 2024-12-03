const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///获取 JS 文件的内容
const fs = require('fs');
const path = require('path');

/**
 * 获取 JS 文件的内容
 * @param {string} file - JS 文件名，默认为 "cninfo.js"
 * @returns {string} 文件内容
 */
function _get_file_content_ths(file = "cninfo.js") {
    const settingFilePath = get_ths_js(file); // 假设get_ths_js是一个已经定义好的函数
    const fileData = fs.readFileSync(settingFilePath, 'utf8');
    return fileData;
}
///funddb-工具-估值情绪-恐惧贪婪指数

async function index_fear_greed_funddb(symbol = "上证指数") {
    const symbolMap = {
        "上证指数": "000001.SH",
        "沪深300": "000300.SH",
    };

    const url = "https://api.jiucaishuo.com/v2/kjtl/kjtlconnect";
    const payload = {
        gu_code: symbolMap[symbol],
        type: "h5",
        version: "2.4.5",
        act_time: 1697623588394,
    };

    try {
        const response = await axios.post(url, payload);
        const dataJson = response.data;

        // 假设我们有一个方法 new_my_decode 来解码数据
        // 这里需要根据实际情况来实现或引入对应的JS解码逻辑
        const mcode = new_my_decode(dataJson); // 需要定义这个函数
        const decodedData = JSON.parse(mcode);

        const dateList = decodedData.data.xAxis.categories;
        const tlList = decodedData.data.series[0].data;
        const szList = decodedData.data.series[1].data;

        const tempData = _.zip(dateList, tlList, szList).map(([date, fear, index]) => ({
            date: dayjs(date).toDate(),
            fear: _.toNumber(fear).toFixed(2),
            index: _.toNumber(index).toFixed(2)
        }));

        return tempData;
    } catch (error) {
        console.error("Error fetching or processing the data:", error);
        throw error; // 或者返回一个错误对象
    }
}

// 注意：这里假设了new_my_decode是一个已存在的函数，用于解码从API获取的数据。
// 在实际应用中，你需要提供这个函数的具体实现或者找到相应的库来完成这个任务。
module.exports = {
    _get_file_content_ths : _get_file_content_ths,
    index_fear_greed_funddb : index_fear_greed_funddb,
};