const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///transform a date string to datetime.date object
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

function convertDate(date) {
    /**
     * 将日期字符串转换为 Date 对象
     * @param {string} date - 例如 2016-01-01, 20160101 或 2016/01/01
     * @return {Date|null} 返回一个 Date 对象（如 2016-01-01）或者 null
     */
    if (date instanceof Date) {
        return date;
    } else if (typeof date === 'string') {
        // 使用 dayjs 的 customParseFormat 插件来尝试解析多种日期格式
        const parsedDate = dayjs(date, ['YYYY-MM-DD', 'YYYYMMDD', 'YYYY/MM/DD'], true);
        if (parsedDate.isValid()) {
            return parsedDate.toDate(); // 返回 JavaScript Date 对象
        }
    }
    return null;
}
///获取 JSON 配置文件的路径(从模块所在目录查找)
const path = require('path');

function get_json_path(name, module_file) {
    /**
     * 获取 JSON 配置文件的路径（从模块所在目录查找）
     * @param {string} name - 文件名
     * @param {string} module_file - 模块文件的绝对或相对路径
     * @returns {string} json_file_path - JSON配置文件的路径
     */
    const module_folder = path.dirname(path.dirname(path.resolve(module_file)));
    const module_json_path = path.join(module_folder, "file_fold", name);
    return module_json_path;
}
///获取 pickle 配置文件的路径(从模块所在目录查找)
const path = require('path');

function get_pk_path(name, moduleFile) {
    /**
     * 获取 pickle 配置文件的路径(从模块所在目录查找)
     * @param {string} name - 文件名
     * @param {string} moduleFile - 模块文件名
     * @returns {string} json_file_path - JSON文件路径
     */
    const moduleFolder = path.resolve(path.dirname(moduleFile), '..');
    const moduleJsonPath = path.join(moduleFolder, 'file_fold', name);
    return moduleJsonPath;
}
///获取交易日历至 2019 年结束, 这里的交易日历需要按年更新
const fs = require('fs');
const path = require('path');

function get_pk_path(settingFileName, currentFile) {
    // 假设get_pk_path函数返回一个基于当前文件路径的设置文件绝对路径
    // 这里只是一个示例实现，实际逻辑可能根据你的需求有所不同
    const dirName = path.dirname(currentFile);
    return path.join(dirName, settingFileName);
}

function get_pk_data(file_name) {
    /**
     * 获取交易日历至 2019 年结束, 这里的交易日历需要按年更新
     * @return: json
     */
    const setting_file_name = file_name;
    const setting_file_path = get_pk_path(setting_file_name, __filename);

    try {
        const data = fs.readFileSync(setting_file_path, 'utf8'); // 以文本模式读取文件
        return JSON.parse(data); // 将字符串解析成JSON对象
    } catch (error) {
        console.error(`Error reading or parsing the file: ${setting_file_path}`, error);
        throw error; // 或者你可以选择其他错误处理方式
    }
}
///获取交易日历, 这里的交易日历需要按年更新, 主要是从新浪获取的
const fs = require('fs');
const path = require('path');

function getCalendar() {
    /**
     * 获取交易日历, 这里的交易日历需要按年更新, 主要是从新浪获取的
     * @return {Object} 交易日历
     */
    const settingFileName = "calendar.json";
    // 假设getJsonPath函数已经定义，其功能与Python中的get_json_path相同。
    const settingFilePath = getJsonPath(settingFileName, __filename);

    try {
        const dataJson = fs.readFileSync(settingFilePath, 'utf-8');
        return JSON.parse(dataJson);
    } catch (error) {
        console.error("Error reading or parsing the calendar file:", error);
        throw error; // 或者可以根据实际情况处理错误
    }
}

// 注意：上面的getJsonPath函数需要根据实际需求自行实现，它应该返回一个基于给定文件名和当前文件位置的有效路径。
///获取前一个交易日

function lastTradingDay(day) {
    /**
     * 获取前一个交易日
     * @param {string|Date} day - 交易日，可以是"%Y%m%d"格式的字符串或Date对象
     * @return {string|Date|boolean} - 前一个交易日，与输入类型相同；如果输入的不是交易日，则返回false
     */
    const calendar = getCalendar(); // 假设此函数已定义

    if (typeof day === 'string') {
        if (!calendar.includes(day)) {
            console.log("Today is not trading day: " + day);
            return false;
        }
        let pos = calendar.indexOf(day);
        let lastDay = calendar[pos - 1];
        return lastDay;
    } else if (day instanceof Date) {
        let dStr = dayjs(day).format("YYYYMMDD");
        if (!calendar.includes(dStr)) {
            console.log("Today is not working day: " + dStr);
            return false;
        }
        let pos = calendar.indexOf(dStr);
        let lastDay = calendar[pos - 1];
        lastDay = dayjs(lastDay, "YYYYMMDD").toDate();
        return lastDay;
    }
}
///获取最新的有数据的交易日
const dayjs = require('dayjs'); // 引入dayjs库

function get_latest_data_date(day) {
    /**
     * 获取最新的有数据的交易日
     * @param {dayjs} day - 一个dayjs对象
     * @return {string} YYYYMMDD格式的字符串
     */
    const calendar = get_calendar();
    const formattedDay = day.format("YYYYMMDD");

    if (calendar.includes(formattedDay)) {
        if (day.hour() > 17 || (day.hour() === 17 && day.minute() >= 0)) {
            return formattedDay;
        } else {
            return last_trading_day(formattedDay);
        }
    } else {
        while (!calendar.includes(formattedDay)) {
            day = day.subtract(1, 'day');
            formattedDay = day.format("YYYYMMDD");  // 更新formattedDay
        }
        return formattedDay;
    }
}
module.exports = {
    convert_date: convert_date,
    get_json_path: get_json_path,
    get_pk_path: get_pk_path,
    get_pk_data: get_pk_data,
    get_calendar: get_calendar,
    last_trading_day: last_trading_day,
    get_latest_data_date: get_latest_data_date,
};