const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///科创板报告的页数
async function _stock_zh_kcb_report_em_page() {
    /**
     * 获取科创板报告的页数
     * @returns {Promise<number>} 科创板报告的页数
     */
    const url = "https://np-anotice-stock.eastmoney.com/api/security/ann";
    const params = new URLSearchParams({
        sr: "-1",
        page_size: "100",
        page_index: "1",
        ann_type: "KCB",
        client_source: "web",
        f_node: "0",
        s_node: "0"
    });

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        const pageNum = Math.ceil(parseInt(dataJson.data.total_hits) / parseInt(dataJson.data.page_size));
        return pageNum;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者可以返回一个默认值或错误码
    }
}
///科创板报告内容

async function stock_zh_kcb_report_em(from_page = 1, to_page = 100) {
    const url = "https://np-anotice-stock.eastmoney.com/api/security/ann";
    let total_page = await _stock_zh_kcb_report_em_page(); // 假设这个函数已经被定义且返回总页数
    if (to_page >= total_page) to_page = total_page;

    let big_df = [];
    for (let i = from_page; i <= to_page; i++) {
        const params = new URLSearchParams({
            sr: "-1",
            page_size: "100",
            page_index: i,
            ann_type: "KCB",
            client_source: "web",
            f_node: "0",
            s_node: "0"
        });

        try {
            const response = await axios.get(url, { params: params });
            const records = response.data?.data.list;

            const temp_df = records.map(item => ({
                代码: item.codes[0].stock_code,
                名称: item.codes[0].short_name,
                公告标题: item.title,
                公告类型: item.columns[0].column_name,
                公告日期: dayjs(item.notice_date).format('YYYYMMDD'),
                公告代码: item.art_code
            })
            );

            big_df = big_df.concat(temp_df);
        } catch (error) {
            console.error(`Error fetching page ${i}:`, error);
        }
    }

    return big_df;
}
module.exports = {
    stock_zh_kcb_report_em: stock_zh_kcb_report_em,
};