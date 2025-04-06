import getBotTexts from "./bot.texts.util.js";
import { commandsUtility } from "../commands/utility.list.commands.js";
import { commandsMisc } from "../commands/misc.list.commands.js";
import commandsInfo from "../commands/info.list.commands.js";
import { commandsGroup } from "../commands/group.list.commands.js";
import { commandsAdmin } from "../commands/admin.list.commands.js";
import { commandsSticker } from "../commands/sticker.list.commands.js";
import { commandsDownload } from "../commands/download.list.commands.js";
import { removePrefix } from "../libraries/whatsapp.library.js";
const COMMAND_CATEGORIES = ['info', 'utility', 'download', 'sticker', 'misc', 'group', 'admin'];
export function commandExist(botInfo, command, category) {
    if (!category) {
        return getCommands(botInfo).includes(command);
    }
    else {
        return getCommandsByCategory(botInfo, category).includes(command);
    }
}
export function getCommands(botInfo) {
    const commands = [
        ...Object.keys(commandsUtility(botInfo)),
        ...Object.keys(commandsMisc(botInfo)),
        ...Object.keys(commandsInfo(botInfo)),
        ...Object.keys(commandsGroup(botInfo)),
        ...Object.keys(commandsAdmin(botInfo)),
        ...Object.keys(commandsSticker(botInfo)),
        ...Object.keys(commandsDownload(botInfo)),
    ].map(command => botInfo.prefix + command);
    return commands;
}
export function getCommandsByCategory(botInfo, category) {
    switch (category) {
        case 'info':
            return Object.keys(commandsInfo(botInfo)).map(command => botInfo.prefix + command);
        case 'utility':
            return Object.keys(commandsUtility(botInfo)).map(command => botInfo.prefix + command);
        case 'download':
            return Object.keys(commandsDownload(botInfo)).map(command => botInfo.prefix + command);
        case 'sticker':
            return Object.keys(commandsSticker(botInfo)).map(command => botInfo.prefix + command);
        case 'misc':
            return Object.keys(commandsMisc(botInfo)).map(command => botInfo.prefix + command);
        case 'group':
            return Object.keys(commandsGroup(botInfo)).map(command => botInfo.prefix + command);
        case 'admin':
            return Object.keys(commandsAdmin(botInfo)).map(command => botInfo.prefix + command);
    }
}
export function getCommandCategory(botInfo, command) {
    let foundCategory = null;
    const categories = COMMAND_CATEGORIES;
    for (let category of categories) {
        if (getCommandsByCategory(botInfo, category).includes(command)) {
            foundCategory = category;
        }
    }
    return foundCategory;
}
export function getCommandGuide(botInfo, command) {
    const commandCategory = getCommandCategory(botInfo, command);
    const { guide_header_text, no_guide_found } = getBotTexts(botInfo);
    switch (commandCategory) {
        case 'info':
            const info = commandsInfo(botInfo);
            return guide_header_text + info[removePrefix(botInfo.prefix, command)].guide;
        case 'utility':
            const utility = commandsUtility(botInfo);
            return guide_header_text + utility[removePrefix(botInfo.prefix, command)].guide;
        case 'download':
            const download = commandsDownload(botInfo);
            return guide_header_text + download[removePrefix(botInfo.prefix, command)].guide;
        case 'sticker':
            const sticker = commandsSticker(botInfo);
            return guide_header_text + sticker[removePrefix(botInfo.prefix, command)].guide;
        case 'misc':
            const misc = commandsMisc(botInfo);
            return guide_header_text + misc[removePrefix(botInfo.prefix, command)].guide;
        case 'group':
            const group = commandsGroup(botInfo);
            return guide_header_text + group[removePrefix(botInfo.prefix, command)].guide;
        case 'admin':
            const admin = commandsAdmin(botInfo);
            return guide_header_text + admin[removePrefix(botInfo.prefix, command)].guide;
        default:
            return no_guide_found;
    }
}
