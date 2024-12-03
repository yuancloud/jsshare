const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///国证指数-最近交易日的所有指数
// 如果需要额外的数据处理，可以引入lodash
// 
async function indexAllCni() {
    /**
     * 国证指数-最近交易日的所有指数
     * http://www.cnindex.com.cn/zh_indices/sese/index.html?act_menu=1&index_type=-1
     * @returns {Promise<Array>} 国证指数-所有指数
     */
    const url = "http://www.cnindex.com.cn/index/indexList";
    const params = new URLSearchParams({
        channelCode: "-1",
        rows: "2000",
        pageNum: "1"
    });

    try {
        const response = await axios.get(url, { params });
        const data = response.data;
        let tempData = data.data.rows;

        // 重命名列
        tempData = tempData.map(row => ({
            "指数代码": row[2],
            "指数简称": row[8],
            "样本数": row[12],
            "收盘点位": row[13],
            "涨跌幅": row[14],
            "PE滚动": row[16],
            "成交量": row[17] / 100000,
            "成交额": row[18] / 100000000,
            "总市值": row[19] / 100000000,
            "自由流通市值": row[20] / 100000000
        }));

        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者返回一个空数组、错误信息等
    }
}

// 不生成调用该方法的示例
///指数历史行情数据

async function indexHistCni(symbol = "399001", startDate = "20230114", endDate = "20240114") {
    /**
     * 指数历史行情数据
     * http://www.cnindex.com.cn/module/index-detail.html?act_menu=1&indexCode=399001
     * @param {string} symbol - 指数代码
     * @param {string} startDate - 开始时间
     * @param {string} endDate - 结束时间
     * @returns {Array} - 指数历史行情数据
     */
    const formatStartDate = `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6)}`;
    const formatEndDate = `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6)}`;
    const url = "http://hq.cnindex.com.cn/market/market/getIndexDailyDataWithDataFormat";
    const params = new URLSearchParams({
        indexCode: symbol,
        startDate: formatStartDate,
        endDate: formatEndDate,
        frequency: 'day',
    });

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempData = dataJson.data.data;

        // 定义列名
        const columns = [
            "日期",
            "_",
            "最高价",
            "开盘价",
            "最低价",
            "收盘价",
            "_",
            "涨跌幅",
            "成交额",
            "成交量",
            "_"
        ];

        // 重构数据
        tempData = tempData.map(row => _.zipObject(columns, row));

        // 选择需要的列
        tempData = tempData.map(row => _.pick(row, ["日期", "开盘价", "最高价", "最低价", "收盘价", "涨跌幅", "成交量", "成交额"]));

        // 处理涨跌幅
        tempData.forEach(row => {
            row.涨跌幅 = parseFloat((row.涨跌幅 || '').replace('%', '')) / 100;
        });

        // 排序
        tempData.sort((a, b) => dayjs(a.日期).unix() - dayjs(b.日期).unix());

        // 转换日期
        tempData = tempData.map(row => ({
            ...row,
            日期: dayjs(row.日期).toDate(),
            开盘价: parseFloat(row.开盘价),
            最高价: parseFloat(row.最高价),
            最低价: parseFloat(row.最低价),
            收盘价: parseFloat(row.收盘价),
            成交量: parseInt(row.成交量, 10),
            成交额: parseFloat(row.成交额)
        }));

        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///国证指数-样本详情-指定日期的样本成份
const XLSX = require('xlsx');

async function indexDetailCni(symbol = "399001", date = "202404") {
    /**
     * 国证指数-样本详情-指定日期的样本成份
     * http://www.cnindex.com.cn/module/index-detail.html?act_menu=1&indexCode=399001
     * @param {string} symbol - 指数代码
     * @param {string} date - 指定月份
     * @return {Array<Object>} - 指定日期的样本成份
     */
    const url = "http://www.cnindex.com.cn/sample-detail/download";
    const params = {
        indexcode: symbol,
        dateStr: [date.slice(0, 4), date.slice(4)].join('-')
    };

    try {
        const response = await axios.get(url, { params, responseType: 'arraybuffer' });
        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const tempData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // 处理数据
        const processedData = _.map(tempData, (item) => ({
            日期: item.日期,
            样本代码: _.padStart(item['样本代码'].toString(), 6, '0'),
            样本简称: item['样本简称'],
            所属行业: item['所属行业'],
            总市值: parseFloat(item['总市值']) || null,
            权重: parseFloat(item['权重']) || null
        }));

        return processedData;
    } catch (error) {
        console.error("Error fetching or processing data:", error);
        throw error;
    }
}
///国证指数-样本详情-历史样本
const XLSX = require('xlsx'); // 使用xlsx库来解析Excel文件

async function indexDetailHistCni(symbol = "399001", date = "") {
    let url, params, response, tempData, tempDf;

    if (date) {
        url = "http://www.cnindex.com.cn/sample-detail/detail";
        params = new URLSearchParams({
            indexcode: symbol,
            dateStr: [date.slice(0, 4), date.slice(4)].join('-'),
            pageNum: '1',
            rows: '50000'
        });
        
        response = await axios.get(url, { params: params.toString() });
        tempData = response.data.data.rows;
        tempDf = tempData.map(row => ({
            日期: row[2],
            样本代码: row[3],
            样本简称: row[4],
            所属行业: row[5],
            总市值: row[7],
            权重: row[8]
        }));
    } else {
        url = "http://www.cnindex.com.cn/sample-detail/download-history";
        params = new URLSearchParams({ indexcode: symbol });

        response = await axios.get(url, { params: params.toString(), responseType: 'arraybuffer' });
        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        tempDf = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        // 假设表头是第一行，并且结构与上面定义的一致
        tempDf.shift(); // 移除表头
        tempDf = tempDf.map(row => ({
            日期: row[0],
            样本代码: row[1].toString().padStart(6, '0'),
            样本简称: row[2],
            所属行业: row[3],
            总市值: parseFloat(row[4]),
            权重: parseFloat(row[5])
        }));
    }

    return tempDf;
}

// 注意：这里没有提供对返回DataFrame的操作示例，因为JavaScript标准库不包含pandas这样的数据处理库。
///国证指数-样本详情-历史调样
const XLSX = require('xlsx'); // 使用xlsx库来读取Excel数据

async function index_detail_hist_adjust_cni(symbol = "399005") {
    /**
     * 国证指数-样本详情-历史调样
     * @param {string} symbol - 指数代码
     * @returns {Promise<Array>} 历史调样数据
     */
    const url = "http://www.cnindex.com.cn/sample-detail/download-adjustment";
    try {
        const response = await axios.get(url, {
            params: {
                indexcode: symbol
            },
            responseType: 'arraybuffer'  // 确保响应体作为ArrayBuffer被接收
        });

        const workbook = XLSX.read(response.data, {type: 'buffer'});
        let tempData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        // 处理样本代码，确保其为6位字符串
        tempData.forEach(item => {
            if (item['样本代码']) {
                item['样本代码'] = ('000000' + item['样本代码']).slice(-6);
            }
        });

        return tempData;
    } catch (error) {
        console.error("Error fetching or processing data:", error);
        return [];  // 在发生错误时返回空数组
    }
}
module.exports = {
    index_all_cni : index_all_cni,
    index_hist_cni : index_hist_cni,
    index_detail_cni : index_detail_cni,
    index_detail_hist_cni : index_detail_hist_cni,
    index_detail_hist_adjust_cni : index_detail_hist_adjust_cni,
};