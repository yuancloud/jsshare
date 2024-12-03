const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///

async function stockKcbRenewal() {
    const url = "http://query.sse.com.cn/statusAction.do";
    const params = new URLSearchParams({
        'isPagination': 'true',
        'sqlId': 'SH_XM_LB',
        'pageHelp.pageSize': '20',
        'offerType': '',
        'commitiResult': '',
        'registeResult': '',
        'province': '',
        'csrcCode': '',
        'currStatus': '',
        'order': 'updateDate|desc,stockAuditNum|desc',
        'keyword': '',
        'auditApplyDateBegin': '',
        'auditApplyDateEnd': '',
        'pageHelp.pageNo': '1',
        'pageHelp.beginPage': '1',
        'pageHelp.endPage': '1',
        '_': '1649322742207'
    });
    const headers = {
        'Host': 'query.sse.com.cn',
        'Pragma': 'no-cache',
        'Referer': 'http://kcb.sse.com.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36'
    };

    for (let page = 1; page < 37; page++) {
        console.log(page);
        // 更新参数中的页面信息
        params.set('pageHelp.pageNo', page.toString());
        params.set('pageHelp.beginPage', page.toString());
        params.set('pageHelp.endPage', page.toString());

        try {
            const response = await axios.get(url, { params, headers });
            const dataJson = response.data;
            const tempDf = dataJson.result; // 假设dataJson.result可以直接作为我们的"DataFrame"
            
            // 处理tempDf中的字段
            console.log(tempDf);

            // 仅获取第一页的数据后退出循环
            break;
        } catch (error) {
            console.error(`Error fetching data for page ${page}:`, error);
        }
    }
}

// 注意：此函数是异步的，因此如果要调用它，你需要确保正确处理异步操作。
module.exports = {
    stock_kcb_renewal : stock_kcb_renewal,
};