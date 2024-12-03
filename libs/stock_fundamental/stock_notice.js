const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-数据中心-公告大全-沪深京 A 股公告

async function stockNoticeReport(symbol = '全部', date = '20220511') {
    const url = "https://np-anotice-stock.eastmoney.com/api/security/ann";
    const reportMap = {
        "全部": "0",
        "财务报告": "1",
        "融资公告": "2",
        "风险提示": "3",
        "信息变更": "4",
        "重大事项": "5",
        "资产重组": "6",
        "持股变动": "7",
    };
    const params = new URLSearchParams({
        sr: "-1",
        page_size: "100",
        page_index: "1",
        ann_type: "A",
        client_source: "web",
        f_node: reportMap[symbol],
        s_node: "0",
        begin_time: [date.slice(0, 4), date.slice(4, 6), date.slice(6)].join('-'),
        end_time: [date.slice(0, 4), date.slice(4, 6), date.slice(6)].join('-')
    });

    let bigDf = [];
    let totalPage = 1; // 初始化总页数

    for (let page = 1; page <= totalPage; page++) {
        params.set('page_index', page.toString());

        try {
            const response = await axios.get(url, { params });
            const dataJson = response.data;
            if (page === 1) {
                totalPage = Math.ceil(dataJson.data.total_hits / 100);
            }

            const list = dataJson.data.list;
            const tempDf = list.map(item => ({
                ...item,
                ...item.columns[0],
                ...item.codes[0]
            }));

            // 删除不需要的属性
            tempDf.forEach(item => {
                delete item.codes;
                delete item.columns;
            });

            bigDf = bigDf.concat(tempDf);
        } catch (error) {
            console.error(`Error fetching page ${page}:`, error);
        }
    }

    // 重命名列
    bigDf = bigDf.map(item => ({
        代码: item.stock_code,
        名称: item.short_name,
        公告标题: item.title,
        公告类型: item.column_name,
        公告日期: dayjs(item.notice_date).format('YYYY-MM-DD'),
        网址: `https://data.eastmoney.com/notices/detail/${item.stock_code}/${item.art_code}.html`
    }));

    return bigDf;
}

// 不生成调用该方法的示例
module.exports = {
    stock_notice_report : stock_notice_report,
};