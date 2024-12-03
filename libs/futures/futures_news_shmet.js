const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///上海金属网-快讯
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

async function futuresNewsShmet(symbol = "全部") {
    const url = "https://www.shmet.com/api/rest/news/queryNewsflashList";
    let payload;
    if (symbol === "全部") {
        payload = { currentPage: 1, pageSize: 100 };
    } else {
        const symbolMap = {
            "要闻": "0",
            "VIP": "100",
            "财经": "999",
            "铜": "1002",
            "铝": "1003",
            "铅": "1005",
            "锌": "1004",
            "镍": "1006",
            "锡": "1007",
            "贵金属": "1008",
            "小金属": "1009",
        };
        payload = {
            currentPage: 1,
            pageSize: 1000,
            content: "",
            flashTag: symbolMap[symbol],
        };
    }

    try {
        const response = await axios.post(url, payload);
        const dataJson = response.data;
        const tempData = dataJson.data.dataList.map(item => ({
            发布时间: item[3],
            内容: item[5],
        }));

        // 转换发布时间为Asia/Shanghai时区的时间
        tempData.forEach(item => {
            item.发布时间 = dayjs(item.发布时间).tz("Asia/Shanghai").format();
        });

        // 按发布时间排序
        tempData.sort((a, b) => a.发布时间.localeCompare(b.发布时间));

        return tempData;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error; // 或者你可以选择如何处理错误
    }
}
module.exports = {
    futures_news_shmet : futures_news_shmet,
};