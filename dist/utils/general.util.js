import moment from "moment-timezone";
import chalk from 'chalk';
import path from 'node:path';
import fs from 'fs-extra';
import getBotTexts from "./bot.texts.util.js";
import { tmpdir } from "node:os";
import crypto from 'node:crypto';
export function messageErrorCommandUsage(botInfo, message) {
    const botTexts = getBotTexts(botInfo);
    return buildText(botTexts.error_command_usage, message.command, message.command);
}
export function messageErrorCommand(botInfo, command, reason) {
    const botTexts = getBotTexts();
    return buildText(botTexts.error_command, command, reason);
}
export function getCurrentBotVersion() {
    return JSON.parse(fs.readFileSync(path.resolve('package.json'), { encoding: 'utf-8' })).version;
}
export function colorText(text, color) {
    return !color ? chalk.green(text) : chalk.hex(color)(text);
}
export function buildText(text, ...params) {
    for (let i = 0; i < params.length; i++) {
        text = text.replace(`{p${i + 1}}`, params[i]);
    }
    return text;
}
export function timestampToDate(timestamp) {
    return moment(timestamp).format('DD/MM/YYYY HH:mm:ss');
}
export function formatSeconds(seconds) {
    return moment(seconds * 1000).format('mm:ss');
}
export function currentDate() {
    return moment(Date.now()).format('DD/MM/YYYY HH:mm:ss');
}
export function getResponseTime(timestamp) {
    let responseTime = ((moment.now() / 1000) - timestamp).toFixed(2);
    return responseTime;
}
export function showCommandConsole(isGroup, categoryName, command, hexColor, messageTimestamp, pushName, groupName) {
    let formattedMessageTimestamp = timestampToDate(messageTimestamp * 1000);
    let responseTimeSeconds = getResponseTime(messageTimestamp);
    if (!pushName)
        pushName = "DESCONHECIDO";
    if (!groupName)
        groupName = "DESCONHECIDO";
    if (isGroup) {
        console.log('\x1b[1;31m~\x1b[1;37m>', colorText(`[${categoryName}]`, hexColor), formattedMessageTimestamp, colorText(command), 'de', colorText(pushName), 'em', colorText(groupName), `(${colorText(`${responseTimeSeconds}s`)})`);
    }
    else {
        console.log('\x1b[1;31m~\x1b[1;37m>', colorText(`[${categoryName}]`, hexColor), formattedMessageTimestamp, colorText(command), 'de', colorText(pushName), `(${colorText(`${responseTimeSeconds}s`)})`);
    }
}
export function uppercaseFirst(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
export function removeBold(text) {
    return text.replace(/\*/gm, "").trim();
}
export function removeFormatting(text) {
    return text.replace(/(_)|(\*)|(~)|(```)/g, "").trim();
}
export function randomDelay(ms_min, ms_max) {
    return new Promise((resolve, reject) => {
        let randomDelayMs = Math.floor(Math.random() * (ms_max - ms_min + 1)) + ms_min;
        setTimeout(async () => {
            resolve();
        }, randomDelayMs);
    });
}
export function showConsoleError(err, error_type) {
    console.error(colorText(`[${error_type}]`, "#d63e3e"), err.message);
}
export function showConsoleLibraryError(err, error_type) {
    console.error(colorText(`[${error_type}]`, "#d63e3e"), err.message);
}
export function getRandomFilename(ext) {
    return `${Math.floor(Math.random() * 10000)}.${ext}`;
}
export function getTempPath(ext) {
    if (!fs.existsSync(path.join(tmpdir(), 'lbot-whatsapp'))) {
        fs.mkdirSync(path.join(tmpdir(), 'lbot-whatsapp'));
    }
    return path.join(tmpdir(), 'lbot-whatsapp', `${crypto.randomBytes(20).toString('hex')}.${ext}`);
}
