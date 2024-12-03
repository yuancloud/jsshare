const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
const cheerio = require('cheerio');
const md5 = require('md5');
const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
}
///乐咕乐股-主板市盈率
async function get_cookie_csrf(url = "") {
    /**
     * 乐咕乐股-主板市盈率
     * https://legulegu.com/stockdata/shanghaiPE
     * @return {Object} 指定市场的市盈率数据
     */
    try {
        const response = await axios.get(url, { headers: headers });
        const $ = cheerio.load(response.data);
        const csrfTag = $('meta[name="_csrf"]');
        const csrfToken = csrfTag.attr('content');
        headers['X-CSRF-Token'] = csrfToken;
        headers.Cookie = response.headers['set-cookie'];
        return headers;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者你可以选择返回一个错误对象或默认值
    }
}

///市盈率, 市净率, 股息率数据接口
async function stock_a_indicator_lg(symbol = "000001") {
    if (symbol === "all") {
        const url = "https://legulegu.com/stocklist";
        const response = await axios.get(url, {
            headers: headers
        });
        const $ = cheerio.load(response.data);
        const node_list = $('.col-xs-6');
        const href_list = [];
        const title_list = [];

        node_list.each((index, item) => {
            const aTag = $(item).find('a');
            href_list.push(aTag.attr('href'));
            title_list.push(aTag.attr('title'));
        });

        let temp_df = title_list.map((title, index) => ({
            stock_name: title,
            short_url: href_list[index]
        }));

        temp_df = temp_df.map(item => ({
            ...item,
            code: item.short_url.split('/').pop()
        }));

        temp_df = temp_df.map(({ stock_name, code }) => ({ code, stock_name }));
        return temp_df;
    } else {
        const url = "https://legulegu.com/api/s/base-info/";
        const token = md5(dayjs().format('YYYY-MM-DD')).toString(); // 假设get_token_lg()函数已经定义
        const params = new URLSearchParams({ token, id: symbol });
        let headers_csrf = await get_cookie_csrf("https://legulegu.com/")
        const response = await axios.post(url, params, {
            headers: headers_csrf,
        });

        const temp_json = response.data;
        const columns = temp_json.data.fields;
        const items = temp_json.data.items;

        let temp_df = items.map(item => {
            let obj = {};
            columns.forEach((column, index) => {
                obj[column] = item[index];
            });
            return obj;
        });

        temp_df = temp_df.map(item => ({
            ...item,
            trade_date: dayjs(item.trade_date).format('YYYY-MM-DD')
        }));

        for (let key of Object.keys(temp_df[0])) {
            if (key !== 'trade_date') {
                temp_df = temp_df.map(item => ({
                    ...item,
                    [key]: parseFloat(item[key])
                }));
            }
        }

        temp_df.sort((a, b) => dayjs(a.trade_date).isBefore(dayjs(b.trade_date)) ? -1 : 1);


        return temp_df;
    }
}
///亿牛网-港股指标
async function stock_hk_indicator_eniu(symbol = "hk01093", indicator = "市盈率") {
    /**
     * 亿牛网-港股指标
     * https://eniu.com/gu/hk01093/roe
     * @param {string} symbol - 港股代码
     * @param {string} indicator - 需要获取的指标, 可选值为 {"港股", "市盈率", "市净率", "股息率", "ROE", "市值"}
     * @returns {Promise<Array>} 指定 symbol 和 indicator 的数据
     */
    let url;
    if (indicator === "港股") {
        url = "https://eniu.com/static/data/stock_list.json";
    } else if (indicator === "市盈率") {
        url = `https://eniu.com/chart/peh/${symbol}`;
    } else if (indicator === "市净率") {
        url = `https://eniu.com/chart/pbh/${symbol}`;
    } else if (indicator === "股息率") {
        url = `https://eniu.com/chart/dvh/${symbol}`;
    } else if (indicator === "ROE") {
        url = `https://eniu.com/chart/roeh/${symbol}`;
    } else {
        url = `https://eniu.com/chart/marketvalueh/${symbol}`;
    }

    try {
        const response = await axios.get(url, { headers: headers });
        let data = response.data;
        if (indicator === "港股") {
            // 过滤出港股的数据
            data = data.filter(item => item.stock_id.includes("hk"));
        }

        let result = []
        for (let i = 0; i < response.data.date.length; i++) {
            result.push(
                {
                    "日期": response.data.date[i],
                    "价格": response.data.price[i],
                    "市盈率": response.data.pe[i],
                }
            )
        }

        return result; // 返回JSON数据或过滤后的数据
    } catch (error) {
        console.error(`Error fetching data for ${symbol} with indicator ${indicator}:`, error);
        throw error;
    }
}

// 注意：此函数返回的是一个Promise，需要通过.then() 或 async/await 来处理结果。
module.exports = {
    stock_a_indicator_lg: stock_a_indicator_lg,
    stock_hk_indicator_eniu: stock_hk_indicator_eniu,
};