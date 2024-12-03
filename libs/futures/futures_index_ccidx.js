const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///中证商品指数-商品指数-日频率
const XLSX = require('xlsx');

async function futuresIndexCcidx(symbol = "中证商品期货指数") {
    const futuresIndexMap = {
        "中证商品期货指数": "100001.CCI",
        "中证商品期货价格指数": "000001.CCI",
    };

    const url = "http://www.ccidx.com/front/ajax_downZSHQ.do";
    const params = { indexCode: futuresIndexMap[symbol] };

    try {
        const response = await axios.get(url, { params, responseType: 'arraybuffer' });
        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 将工作表转换为JSON格式
        let tempData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // 设置列名
        const columns = [
            "日期", "指数代码", "指数中文全称", "指数中文简称", "指数英文全称", "指数英文简称",
            "开盘", "最高", "最低", "收盘", "结算", "涨跌", "涨跌幅"
        ];
        tempData.shift();  // 移除第一行（原头信息）
        tempData = tempData.map(row => _.zipObject(columns, row));

        // 转换特定字段类型
        tempData.forEach(item => {
            item.日期 = dayjs(item.日期).toDate();
            ["开盘", "最高", "最低", "收盘", "结算", "涨跌", "涨跌幅"].forEach(key => {
                item[key] = parseFloat(item[key]);
            });
        });

        // 排序与重置索引
        tempData = _.sortBy(tempData, ['日期']);
        tempData = tempData.map((item, index) => ({ ...item, index }));

        return tempData;
    } catch (error) {
        console.error("Error fetching or processing data:", error);
        throw error;
    }
}
///中证商品指数-商品指数-分时数据
// 如果需要处理日期时间，可以引入dayjs
// 
async function futuresIndexMinCcidx(symbol = "中证监控油脂油料期货指数") {
    const futuresIndexMap = {
        "中证商品期货指数": ["100001.CCI", "0"],
        "中证商品期货价格指数": ["000001.CCI", "1"],
        "中证监控油脂油料期货指数": ["606005.CCI", "2"],
        "中证监控软商品期货指数": ["606008.CCI", "3"],
        "中证监控能化期货指数": ["606010.CCI", "4"],
        "中证监控钢铁期货指数": ["606011.CCI", "5"],
    };

    const url = "http://www.ccidx.com/cscidx/csciAction/loadTimeData";
    const params = { r: "0.08644997232349438" };
    const payload = {
        indexCode: futuresIndexMap[symbol][0],
        indexType: futuresIndexMap[symbol][1],
        pointer: "all",
    };
    const headers = {
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Content-Length": "44",
        "Connection": "keep-alive",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Host": "www.ccidx.com",
        "Origin": "http://www.ccidx.com",
        "Pragma": "no-cache",
        "Proxy-Connection": "keep-alive",
        "Referer": "http://www.ccidx.com/cscidx/quote1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest"
    };

    try {
        const response = await axios.post(url, new URLSearchParams(payload).toString(), { params, headers });
        const dataJson = response.data;
        const tempData = [dataJson.dataMap.axisList, dataJson.dataMap.lineList].reduce((acc, cur, i) => {
            cur.forEach((item, j) => {
                if (!acc[j]) acc[j] = [];
                acc[j][i] = item;
            });
            return acc;
        }, []);

        // 将数据转换为对象数组
        const result = tempData.map(item => ({
            datetime: item[0],
            value: parseFloat(item[1]) || null
        }));

        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

// 不生成调用改方法的示例
module.exports = {
    futures_index_ccidx: futures_index_ccidx,
    futures_index_min_ccidx: futures_index_min_ccidx,
};