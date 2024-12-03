const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///期货所对应板块的 URL
const cheerio = require('cheerio');

async function getSectorSymbolNameUrl() {
    /**
     * 获取期货所对应板块的 URL
     * @return {Object} - 包含板块名称及其对应的URL
     */
    const url = "https://cn.investing.com/commodities/";
    try {
        const res = await axios.get(url, { headers: shortHeaders });
        const $ = cheerio.load(res.data);
        const nameUrlOptionList = $('.linkTitle');  // 去掉-所有国家及地区
        const urlList = nameUrlOptionList.map((_, item) => $(item).find('a').attr('href')).get();
        const nameList = nameUrlOptionList.map((_, item) => $(item).text()).get();
        const nameCodeMapDict = {};
        nameList.forEach((name, index) => {
            nameCodeMapDict[name] = urlList[index];
        });
        return nameCodeMapDict;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者根据需要处理错误
    }
}

// 注意：shortHeaders 需要在调用此函数前定义。
///参考网页: https://cn.investing.com/commodities/
const cheerio = require('cheerio');

async function futuresGlobalCommodityNameUrlMap(sector = '能源') {
  /**
   * 参考网页: https://cn.investing.com/commodities/
   * 获取选择板块对应的: 具体期货品种的 url 地址
   * @param {string} sector - 板块, 对应 get_global_country_name_url 品种名称
   * @returns {Promise<Object>} - 名称-URL映射
   */
  const nameUrlDict = await getSectorSymbolNameUrl(); // 假设这是一个异步函数，返回一个Promise
  const url = `https://cn.investing.com${nameUrlDict[sector]}`;
  try {
    const res = await axios.get(url, { headers: shortHeaders });
    const $ = cheerio.load(res.data);
    const urlList = $('.plusIconTd a').map((index, element) => $(element).attr('href').split('?')[0]).get();
    const nameList = $('.plusIconTd a').map((index, element) => $(element).text()).get();
    const nameCodeMapDict = {};
    nameList.forEach((name, index) => {
      nameCodeMapDict[name] = urlList[index];
    });
    return nameCodeMapDict;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw error; // 或者你可以选择在这里处理错误而不是抛出
  }
}

// 注意：这里假设有一个名为shortHeaders的对象用于设置请求头。
// 同样，getSectorSymbolNameUrl()需要被定义为一个返回Promise的函数。
///国际大宗商品的历史量价数据
const cheerio = require('cheerio');

async function futuresGlobalCommodityHist(sector = '能源', symbol = '伦敦布伦特原油', startDate = '20000101', endDate = '20191017') {
    const start_date = [startDate.slice(0, 4), startDate.slice(4, 6), startDate.slice(6)].join('/');
    const end_date = [endDate.slice(0, 4), endDate.slice(4, 6), endDate.slice(6)].join('/');

    // 假设有一个函数来获取name和url映射
    const nameCodeDict = await futuresGlobalCommodityNameUrlMap(sector);
    const tempUrl = `https://cn.investing.com/${nameCodeDict[symbol]}-historical-data`;

    try {
        const { data: res } = await axios.post(tempUrl, {}, { headers: shortHeaders });
        const $ = cheerio.load(res);
        const title = $('h2.float_lang_base_1').text();

        const data = $(':contains("window.histDataExcessInfo")').text().trim();
        const paraData = data.match(/\d+/g);

        const payload = {
            curr_id: paraData[0],
            smlID: paraData[1],
            header: title,
            st_date: start_date,
            end_date: end_date,
            interval_sec: 'Daily',
            sort_col: 'date',
            sort_ord: 'DESC',
            action: 'historical_data',
        };

        const url = 'https://cn.investing.com/instruments/HistoricalDataAjax';
        const { data: r } = await axios.post(url, new URLSearchParams(payload), { headers: longHeaders });

        const $table = cheerio.load(r)('table');
        const tempDf = [];
        $table.find('tr').each((i, el) => {
            const tds = $(el).find('td');
            if (tds.length > 0) {
                tempDf.push({
                    日期: dayjs($(tds[0]).text(), 'YYYY年MM月DD日').toDate(),
                    开盘: parseFloat($(tds[1]).text()),
                    最高: parseFloat($(tds[2]).text()),
                    最低: parseFloat($(tds[3]).text()),
                    收盘: parseFloat($(tds[4]).text()),
                    交易量: $(tds[5]).text(),
                    涨跌幅: $(tds[6]).text()
                });
            }
        });

        // 处理交易量
        for (let row of tempDf) {
            if (row.交易量.includes('-')) {
                row.交易量 = 0;
            } else if (row.交易量.includes('B')) {
                row.交易量 = parseFloat(row.交易量.replace('B', '')) * 1000000000;
            } else if (row.交易量.includes('M')) {
                row.交易量 = parseFloat(row.交易量.replace('M', '')) * 1000000;
            } else if (row.交易量.includes('K')) {
                row.交易量 = parseFloat(row.交易量.replace('K', '')) * 1000;
            } else {
                row.交易量 = parseFloat(row.交易量);
            }

            // 处理涨跌幅
            row.涨跌幅 = parseFloat(row.涨跌幅.replace('%', '')) / 100;
        }

        // 排序
        tempDf.sort((a, b) => b.日期 - a.日期);

        return tempDf;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// 注意：这里假设了存在一个名为futuresGlobalCommodityNameUrlMap的函数，它返回一个包含名称和URL映射的对象。
// 你还需要定义shortHeaders和longHeaders这两个对象，它们应该包含请求所需的头部信息。
module.exports = {
    get_sector_symbol_name_url : get_sector_symbol_name_url,
    futures_global_commodity_name_url_map : futures_global_commodity_name_url_map,
    futures_global_commodity_hist : futures_global_commodity_hist,
};