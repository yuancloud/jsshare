const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///全球指数-各国的全球指数数据
const cheerio = require('cheerio');

async function _get_global_index_area_name_code() {
    /**
     * 全球指数-各国的全球指数数据
     * https://cn.investing.com/indices/global-indices?majorIndices=on&primarySectors=on&bonds=on&additionalIndices=on&otherIndices=on&c_id=37
     * @return {Object} 国家和代码
     */
    const url = "https://cn.investing.com/indices/global-indices";
    const params = new URLSearchParams({
        majorIndices: 'on',
        primarySectors: 'on',
        bonds: 'on',
        additionalIndices: 'on',
        otherIndices: 'on'
    }).toString();
    
    try {
        const response = await axios.get(url, {
            params: params,
            headers: short_headers // 假设short_headers已经定义好
        });
        
        const $ = cheerio.load(response.data);
        const nameUrlOptionList = $('option').slice(1).toArray();
        
        const urlList = nameUrlOptionList
            .filter(item => $(item).attr('value').includes('c_id'))
            .map(item => $(item).attr('value'));
        
        const urlListCode = urlList.map(value => value.split('?')[1].split('=')[1]);
        const nameList = nameUrlOptionList
            .slice(0, urlList.length)
            .map(item => $(item).text());

        const nameCodeList = {};
        for (let i = 0; i < nameList.length; i++) {
            nameCodeList[nameList[i]] = urlListCode[i];
        }
        
        return nameCodeList;
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        throw error; // 或者返回一个空对象等其他错误处理方式
    }
}
///可获得指数数据国家对应的 URL
const cheerio = require('cheerio');

async function _get_global_country_name_url() {
    /**
     * 可获得指数数据国家对应的 URL
     * https://cn.investing.com/indices/
     * @return {Object} 国家和 URL
     */
    const url = "https://cn.investing.com/indices/";
    try {
        // 使用axios发送POST请求
        const response = await axios.post(url, {}, { headers: short_headers });
        const html = response.data;
        const $ = cheerio.load(html);

        // 查找<select>元素，并获取所有<option>子元素
        const nameUrlOptionList = $('select[name="country"] option').slice(1);  // 去掉-所有国家及地区
        const urlList = nameUrlOptionList.map((index, element) => $(element).attr('value')).get();
        const nameList = nameUrlOptionList.map((index, element) => $(element).text()).get();

        // 创建一个映射对象
        const nameCodeMapDict = {};
        nameList.forEach((name, index) => {
            nameCodeMapDict[name] = urlList[index];
        });

        return nameCodeMapDict;
    } catch (error) {
        console.error(`Error fetching or parsing the page: ${error}`);
        throw error; // 或者你可以选择处理错误的方式
    }
}
///指定 area 的所有指数和代码
const cheerio = require('cheerio');

function index_investing_global_area_index_name_code(area = "中国") {
    /**
     * 获取指定 area 的所有指数和代码
     * @param {string} area - 指定的国家或地区；由_get_global_country_name_url() 函数返回的国家或地区的名称
     * @returns {Object} - 指定 area 的所有指数和代码
     */
    const name_url_dict = _get_global_country_name_url();
    const url = `https://cn.investing.com${name_url_dict[area]}?&majorIndices=on&primarySectors=on&additionalIndices=on&otherIndices=on`;

    return axios.get(url)
        .then(response => {
            const $ = cheerio.load(response.data);
            const codeList = $('table').eq(1).find('span.alertBellGrayPlus')
                .map((i, el) => $(el).attr('data-id')).get();
            const nameList = $('.plusIconTd a').map((i, el) => $(el).text()).get();

            const nameCodeMapDict = {};
            nameList.forEach((name, index) => {
                nameCodeMapDict[name] = codeList[index];
            });
            return nameCodeMapDict;
        })
        .catch(error => {
            console.error(`Error fetching data: ${error}`);
            throw error; // 或者根据需要处理错误
        });
}

// 假设 _get_global_country_name_url 已经定义
// function _get_global_country_name_url() { ... }
///指定 area 的所有指数和 URL 地址
const cheerio = require('cheerio');

// 假设 _getGlobalCountryNameUrl 是一个已经定义好的函数
// const _getGlobalCountryNameUrl = ...;

async function indexInvestingGlobalAreaIndexNameUrl(area = "中国") {
    /**
     * 指定 area 的所有指数和 URL 地址
     * https://cn.investing.com/indices/
     * @param {string} area - 指定的国家或地区；_getGlobalCountryNameUrl() 函数返回的国家或地区的名称
     * @returns {Promise<Object>} - 指定 area 的所有指数和 URL 地址
     */
    const nameUrlDict = _getGlobalCountryNameUrl();
    const url = `https://cn.investing.com${nameUrlDict[area]}?&majorIndices=on&primarySectors=on&additionalIndices=on&otherIndices=on`;

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const codeList = [];
        const nameList = [];

        $('td.plusIconTd').each((index, element) => {
            const link = $(element).find('a');
            if (link.length > 0) {
                codeList.push(link.attr('href'));
                nameList.push(link.text());
            }
        });

        const nameCodeMapDict = {};
        for (let i = 0; i < nameList.length; i++) {
            nameCodeMapDict[nameList[i]] = codeList[i];
        }

        return nameCodeMapDict;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error;
    }
}
///具体国家或地区的从 start_date 到 end_date 期间的数据

async function index_investing_global(area = "中国", symbol = "上证指数", period = "每日", start_date = "20100101", end_date = "20211031") {
    const formatDate = (date) => date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
    const start_date_formatted = formatDate(start_date);
    const end_date_formatted = formatDate(end_date);
    const period_map = { "每日": "Daily", "每周": "Weekly", "每月": "Monthly" };
    const name_code_dict = index_investing_global_area_index_name_code(area); // 假设这个函数已经定义好了
    const url = `https://api.investing.com/api/financialdata/historical/${name_code_dict[symbol]}`;
    const params = {
        'start-date': start_date_formatted,
        'end-date': end_date_formatted,
        'time-frame': period_map[period],
        'add-missing-rows': 'false',
    };
    const headers = {
        'accept': 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'cache-control': 'no-cache',
        'domain-id': 'cn',
        'origin': 'https://cn.investing.com',
        'pragma': 'no-cache',
        'referer': 'https://cn.investing.com/',
        'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NjM2NjQ1NzUsImp0aSI6IjIyODA4MDM5MSIsImlhdCI6MTY2MzY2MDk3NSwiaXNzIjoiaW52ZXN0aW5nLmNvbSIsInVzZXJfaWQiOjIyODA4MDM5MSwicHJpbWFyeV9kb21haW5faWQiOiIxIiwiQXV0aG5TeXN0ZW1Ub2tlbiI6IiIsIkF1dGhuU2Vzc2lvblRva2VuIjoiIiwiRGV2aWNlVG9rZW4iOiIiLCJVYXBpVG9rZW4iOiJObmclMkJmMlJyUHpjeWRtdHRaell5TW1JN1pUNWliV1prTURJMVB6czlNeVUySWpVN1lEYzNjV1ZxYWlSZ1kyVjVNamRsWWpRMFptWTFQMkk4TnpCdlBEWXlQbVJrWXo4M01tQnJaMmN3TW1aaU1HVm9ZbWRtWmpBNU5UWTdhRE0lMkJOalUxTW1Cdk56VmxPbW93WUR4bGJUSWdaWGswY0daM05XZGlNamQyYnlnMk9UNSUyRlpEUSUyRllESm1hMjluTURJeFlqRmxQV0l3Wmpjd1pUVXhPenN6S3paOSIsIkF1dGhuSWQiOiIiLCJJc0RvdWJsZUVuY3J5cHRlZCI6ZmFsc2UsIkRldmljZUlkIjoiIiwiUmVmcmVzaEV4cGlyZWRBdCI6MTY2NjE4MDk3NX0.uRLTP1IG3696uxHm3Qq0D8z4o3nfsD3CaIS9cZGjsV0',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
    };

    try {
        const response = await axios.get(url, { params, headers });
        const data_json = response.data;
        let df_data = data_json.data.map(row => ({
            日期: row[3],
            收盘: row[11],
            开盘: row[12],
            高: row[13],
            低: row[14],
            交易量: row[9],
            涨跌幅: row[15],
        }));

        df_data = df_data.map(item => ({
            ...item,
            日期: dayjs(item.日期).toDate(),
            收盘: parseFloat(item.收盘),
            开盘: parseFloat(item.开盘),
            高: parseFloat(item.高),
            低: parseFloat(item.低),
            交易量: parseInt(item.交易量),
            涨跌幅: parseFloat(item.涨跌幅),
        }));

        df_data.sort((a, b) => a.日期 - b.日期);

        return df_data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
module.exports = {
    _get_global_index_area_name_code : _get_global_index_area_name_code,
    _get_global_country_name_url : _get_global_country_name_url,
    index_investing_global_area_index_name_code : index_investing_global_area_index_name_code,
    index_investing_global_area_index_name_url : index_investing_global_area_index_name_url,
    index_investing_global : index_investing_global,
};