const axios = require('axios');
const dayjs = require('dayjs');
const util = require('../util/util');

async function tool_get_group_jrj() {
    try {
        const response = await axios.post("https://gateway.jrj.com/quot-dpyt/market", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en,zh-CN;q=0.9,zh;q=0.8",
                "cache-control": "no-cache",
                "content-type": "application/json",
                "pragma": "no-cache",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "Referer": "https://summary.jrj.com.cn/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
        });
        let result = response.data?.data.indus
        return result;
    } catch (error) {
        console.error('Error fetching or processing data:', error);
        throw error;
    }
}
module.exports = {
    tool_get_group_jrj
};