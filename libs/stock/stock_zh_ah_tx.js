const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///腾讯财经-港股-AH-总页数

async function _get_zh_stock_ah_page_count() {
    /**
     * 腾讯财经-港股-AH-总页数
     * https://stockapp.finance.qq.com/mstats/#mod=list&id=hk_ah&module=HK&type=AH&sort=3&page=3&max=20
     * @return {number} 总页数
     */
    let hk_url = "http://stock.gtimg.cn/data/hk_rank.php"
    let hk_headers = {
        "Referer": "http://stockapp.finance.qq.com/mstats/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36"
    }
    let hk_payload = {
        "board": "A_H",
        "metric": "price",
        "pageSize": "20",
        "reqPage": "1",
        "order": "decs",
        "var_name": "list_data"
    }
    hk_payload.reqPage = 1;
    try {
        const response = await axios.get(hk_url, {
            params: hk_payload, responseType: 'text',
            headers: hk_headers
        });

        // 假设response.data是整个响应体，这里提取JSON部分
        const text = response.data;
        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}') + 1;
        const dataJsonStr = text.substring(startIndex, endIndex);
        const dataJson = JSON.parse(dataJsonStr);

        return dataJson.data.page_count;
    } catch (error) {
        console.error('Error fetching page count:', error);
        throw error; // 或者根据错误类型做其他处理
    }
}
///腾讯财经-港股-AH-实时行情
async function stock_zh_ah_spot() {
    let big_df = [];
    const page_count = await _get_zh_stock_ah_page_count();
    for (let i = 0; i < page_count; i++) {
        try {
            const response = await axios.get("http://stock.gtimg.cn/data/hk_rank.php", {
                params: {
                    "board": "A_H",
                    "metric": "price",
                    "pageSize": "20",
                    "reqPage": "1",
                    "order": "decs",
                    "var_name": "list_data",
                    "reqPage": i
                }, headers: {
                    "Referer": "http://stockapp.finance.qq.com/mstats/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36"
                }, responseType: 'text',
            });
            const data_json = JSON.parse(
                response.data.substring(response.data.indexOf('{'), response.data.lastIndexOf('}') + 1)
            );
            // 将页面数据添加到big_df
            big_df = big_df.concat(data_json.data.page_data);
        } catch (error) {
            console.error(`Error fetching data for page ${i}:`, error);
        }
    }

    let result = big_df.map(record => {
        let items = record.split("~");
        return {
            代码: items[0],
            名称: items[1],
            最新价: parseFloat(items[3]),
            涨跌幅: parseFloat(items[4]),
            涨跌额: parseFloat(items[5]),
            买入: parseFloat(items[6]),
            卖出: parseFloat(items[7]),
            成交量: parseFloat(items[8]),
            成交额: parseFloat(items[9]),
            今开: parseFloat(items[10]),
            昨收: parseFloat(items[11]),
            最高: parseFloat(items[12]),
            最低: parseFloat(items[13]),
        }
    })

    return result;
}

///腾讯财经-港股-AH-股票历史行情
async function stock_zh_ah_daily(symbol = "02318", startYear = "2019", endYear = "2024", adjust = "qfq") {
    const bigData = [];
    for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
        try {
            let response;
            if (adjust === "") {
                response = await axios.get("http://web.ifzq.gtimg.cn/appstock/app/kline/kline", {
                    params: {
                        "_var": `kline_day${adjust}${year}`,
                        "param": `hk${symbol},day,${year}-01-01,${parseInt(year) + 1}-12-31,640,`,
                        "r": Math.random().toString()
                    },
                    headers: {
                        "Accept": "*/*",
                        "Accept-Encoding": "gzip, deflate",
                        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                        "Cache-Control": "no-cache",
                        "Connection": "keep-alive",
                        "Host": "web.ifzq.gtimg.cn",
                        "Pragma": "no-cache",
                        "Referer": "http://gu.qq.com/hk01033/gp",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36",
                    }, responseType: 'text',
                });
            } else {
                response = await axios.get("https://web.ifzq.gtimg.cn/appstock/app/hkfqkline/get", {
                    params: {
                        "_var": `kline_day${adjust}${year}`,
                        "param": `hk${symbol},day,${year}-01-01,${parseInt(year) + 1}-12-31,640,${adjust}`,
                        "r": Math.random().toString()
                    },
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36"
                    }, responseType: 'text',
                });
            }

            const dataText = response.data;
            const jsonStart = dataText.indexOf("{");
            const jsonEnd = dataText.lastIndexOf("}") + 1;
            const dataJson = JSON.parse(dataText.substring(jsonStart, jsonEnd));

            let tempData;
            if (adjust === "") {
                tempData = dataJson.data[`hk${symbol}`].day;
            } else {
                tempData = dataJson.data[`hk${symbol}`][`${adjust}day`];
            }
            let result = tempData.map(row => ({
                "日期": row[0]?.replace(/-/g, ''),
                "开盘": parseFloat(row[1]),
                "收盘": parseFloat(row[2]),
                "最高": parseFloat(row[3]),
                "最低": parseFloat(row[4]),
                "成交量": parseFloat(row[5]),
            }))
            return result;
        } catch (error) {
            console.error(`Error fetching data for year ${year}:`, error);
            continue;
        }
    }

    // 处理日期格式
    bigData.forEach((row) => {
        row.日期 = dayjs(row.日期).toDate();
    });

    return bigData;
}
module.exports = {
    stock_zh_ah_spot: stock_zh_ah_spot,
    stock_zh_ah_daily: stock_zh_ah_daily,
};