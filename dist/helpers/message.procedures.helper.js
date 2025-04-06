import { UserController } from "../controllers/user.controller.js";
import getBotTexts from "../utils/bot.texts.util.js";
import { GroupController } from "../controllers/group.controller.js";
import { buildText, removeFormatting } from "../utils/general.util.js";
import { BotController } from "../controllers/bot.controller.js";
import { waLib } from "../libraries/library.js";
const userController = new UserController();
const botController = new BotController();
const groupController = new GroupController();
export async function isUserBlocked(client, message) {
    const blockedContacts = await waLib.getBlockedContacts(client);
    return blockedContacts.includes(message.sender);
}
export async function isOwnerRegister(client, botInfo, message) {
    const admins = await userController.getAdmins();
    const botTexts = getBotTexts(botInfo);
    if (!admins.length && message.command == `${botInfo.prefix}admin`) {
        await userController.registerOwner(message.sender);
        await waLib.replyText(client, message.chat_id, botTexts.admin_registered, message.wa_message, { expiration: message.expiration });
        return true;
    }
    return false;
}
export async function incrementParticipantActivity(message, isCommand) {
    await groupController.incrementParticipantActivity(message.chat_id, message.sender, message.type, isCommand);
}
export async function incrementUserCommandsCount(message) {
    await userController.increaseUserCommandsCount(message.sender);
}
export function incrementBotCommandsCount() {
    botController.incrementExecutedCommands();
}
export async function incrementGroupCommandsCount(group) {
    await groupController.incrementGroupCommands(group.id);
}
export function isIgnoredByPvAllowed(botInfo, message) {
    return (!message.isBotAdmin && !botInfo.commands_pv);
}
export function isIgnoredByGroupMuted(group, message) {
    return (group.muted && !message.isGroupAdmin);
}
export function isIgnoredByAdminMode(bot, message) {
    return (bot.admin_mode && !message.isBotAdmin);
}
export async function isBotLimitedByGroupRestricted(group, botInfo) {
    const isBotGroupAdmin = await groupController.isAdmin(group.id, botInfo.host_number);
    return (group.restricted && !isBotGroupAdmin);
}
export async function sendPrivateWelcome(client, botInfo, message) {
    const botTexts = getBotTexts(botInfo);
    const user = await userController.getUser(message.sender);
    if (user && !user.receivedWelcome) {
        const replyText = buildText(botTexts.new_user, botInfo.name, message.pushname);
        await waLib.sendText(client, message.chat_id, replyText, { expiration: message.expiration });
        await userController.setReceivedWelcome(user.id, true);
    }
}
export async function readUserMessage(client, message) {
    await waLib.readMessage(client, message.chat_id, message.sender, message.message_id);
}
export async function updateUserName(message) {
    if (message.pushname) {
        await userController.setName(message.sender, message.pushname);
    }
}
export async function isUserLimitedByCommandRate(client, botInfo, message) {
    if (botInfo.command_rate.status) {
        const isLimited = await botController.hasExceededCommandRate(botInfo, message.sender, message.isBotAdmin);
        if (isLimited) {
            const botTexts = getBotTexts(botInfo);
            const replyText = buildText(botTexts.command_rate_limited_message, botInfo.command_rate.block_time);
            await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
            return true;
        }
    }
    return false;
}
export async function isCommandBlockedGlobally(client, botInfo, message) {
    const commandBlocked = botController.isCommandBlockedGlobally(message.command);
    const botTexts = getBotTexts(botInfo);
    if (commandBlocked && !message.isBotAdmin) {
        const replyText = buildText(botTexts.globally_blocked_command, message.command);
        await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
        return true;
    }
    return false;
}
export async function isCommandBlockedGroup(client, group, botInfo, message) {
    const commandBlocked = groupController.isBlockedCommand(group, message.command, botInfo);
    const botTexts = getBotTexts(botInfo);
    if (commandBlocked && !message.isGroupAdmin) {
        const replyText = buildText(botTexts.group_blocked_command, message.command);
        await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
        return true;
    }
    return false;
}
export async function isDetectedByWordFilter(client, botInfo, group, message) {
    const { isGroupAdmin, body, caption } = message;
    const groupAdmins = await groupController.getAdminsIds(group.id);
    const isBotAdmin = groupAdmins.includes(botInfo.host_number);
    const userText = body || caption;
    const userTextNoFormatting = removeFormatting(userText);
    const userWords = userTextNoFormatting.split(' ');
    const wordsFiltered = userWords.filter(userWord => group.word_filter.includes(removeFormatting(userWord.toLowerCase())) == true);
    if (wordsFiltered.length && isBotAdmin && !isGroupAdmin) {
        await waLib.deleteMessage(client, message.wa_message, false);
        return true;
    }
    return false;
}
export async function isDetectedByAntiLink(client, botInfo, group, message) {
    const botTexts = getBotTexts(botInfo);
    const { body, caption, isGroupAdmin } = message;
    const userText = body || caption;
    const groupAdmins = await groupController.getAdminsIds(group.id);
    const isBotAdmin = groupAdmins.includes(botInfo.host_number);
    if (group.antilink && !isBotAdmin) {
        await groupController.setAntiLink(group.id, false);
    }
    else if (group.antilink && !isGroupAdmin) {
        const isUrl = userText.match(new RegExp(/(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/img));
        if (isUrl) {
            const replyText = buildText(botTexts.detected_link, waLib.removeWhatsappSuffix(message.sender));
            await waLib.sendTextWithMentions(client, message.chat_id, replyText, [message.sender], { expiration: message.expiration });
            await waLib.deleteMessage(client, message.wa_message, false);
            return true;
        }
    }
    return false;
}
export async function isDetectedByAntiFlood(client, botInfo, group, message) {
    const botTexts = getBotTexts(botInfo);
    const isDetectedByAntiFlood = await groupController.isFlood(group, message.sender, message.isGroupAdmin);
    if (isDetectedByAntiFlood) {
        const replyText = buildText(botTexts.antiflood_ban_messages, waLib.removeWhatsappSuffix(message.sender), botInfo.name);
        await waLib.removeParticipant(client, message.chat_id, message.sender);
        await waLib.sendTextWithMentions(client, message.chat_id, replyText, [message.sender], { expiration: message.expiration });
        return true;
    }
    return false;
}
