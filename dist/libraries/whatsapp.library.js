import { S_WHATSAPP_NET, generateWAMessageFromContent, getContentType } from "baileys";
import { randomDelay } from "../utils/general.util.js";
import * as convertLibrary from './convert.library.js';
import { removeBold } from "../utils/general.util.js";
import { GroupController } from "../controllers/group.controller.js";
async function updatePresence(client, chatId, presence) {
    await client.presenceSubscribe(chatId);
    await randomDelay(200, 400);
    await client.sendPresenceUpdate(presence, chatId);
    await randomDelay(300, 1000);
    await client.sendPresenceUpdate('paused', chatId);
}
export function addWhatsappSuffix(userNumber) {
    const userId = userNumber.replace(/\W+/g, "") + S_WHATSAPP_NET;
    return userId;
}
export function removeWhatsappSuffix(userId) {
    const userNumber = userId.replace(S_WHATSAPP_NET, '');
    return userNumber;
}
export function removePrefix(prefix, command) {
    const commandWithoutPrefix = command.replace(prefix, '');
    return commandWithoutPrefix;
}
export function getGroupParticipantsByMetadata(group) {
    const { participants } = group;
    let groupParticipants = [];
    participants.forEach((participant) => {
        groupParticipants.push(participant.id);
    });
    return groupParticipants;
}
export function getGroupAdminsByMetadata(group) {
    const { participants } = group;
    const admins = participants.filter(user => (user.admin != null));
    let groupAdmins = [];
    admins.forEach((admin) => {
        groupAdmins.push(admin.id);
    });
    return groupAdmins;
}
export function deleteMessage(client, message, deleteQuoted) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    let deletedMessage;
    let chatId = message.key.remoteJid;
    if (!chatId)
        return;
    if (deleteQuoted) {
        deletedMessage = {
            remoteJid: message.key.remoteJid,
            fromMe: message.key.participant === ((_c = (_b = (_a = message === null || message === void 0 ? void 0 : message.message) === null || _a === void 0 ? void 0 : _a.extendedTextMessage) === null || _b === void 0 ? void 0 : _b.contextInfo) === null || _c === void 0 ? void 0 : _c.participant),
            id: (_f = (_e = (_d = message.message) === null || _d === void 0 ? void 0 : _d.extendedTextMessage) === null || _e === void 0 ? void 0 : _e.contextInfo) === null || _f === void 0 ? void 0 : _f.stanzaId,
            participant: (_j = (_h = (_g = message === null || message === void 0 ? void 0 : message.message) === null || _g === void 0 ? void 0 : _g.extendedTextMessage) === null || _h === void 0 ? void 0 : _h.contextInfo) === null || _j === void 0 ? void 0 : _j.participant
        };
    }
    else {
        deletedMessage = message.key;
    }
    return client.sendMessage(chatId, { delete: deletedMessage });
}
export function readMessage(client, chatId, sender, messageId) {
    return client.sendReceipt(chatId, sender, [messageId], 'read');
}
export function updateProfilePic(client, chatId, image) {
    return client.updateProfilePicture(chatId, image);
}
export function updateProfileStatus(client, text) {
    return client.updateProfileStatus(text);
}
export function shutdownBot(client) {
    return client.end(new Error("admin_command"));
}
export function getProfilePicUrl(client, chatId) {
    return client.profilePictureUrl(chatId, "image");
}
export function blockContact(client, userId) {
    return client.updateBlockStatus(userId, "block");
}
export function unblockContact(client, userId) {
    return client.updateBlockStatus(userId, "unblock");
}
export function getHostNumber(client) {
    var _a;
    let id = (_a = client.user) === null || _a === void 0 ? void 0 : _a.id.replace(/:[0-9]+/ism, '');
    return id || '';
}
export function getBlockedContacts(client) {
    return client.fetchBlocklist();
}
export async function sendText(client, chatId, text, options) {
    await updatePresence(client, chatId, "composing");
    return client.sendMessage(chatId, { text, linkPreview: null }, { ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
}
export function sendLinkWithPreview(client, chatId, text, options) {
    return client.sendMessage(chatId, { text }, { ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
}
export async function sendTextWithMentions(client, chatId, text, mentions, options) {
    await updatePresence(client, chatId, "composing");
    return client.sendMessage(chatId, { text, mentions }, { ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
}
export function sendSticker(client, chatId, sticker, options) {
    return client.sendMessage(chatId, { sticker }, { ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
}
export async function sendFileFromUrl(client, chatId, type, url, caption, options) {
    if (type === "imageMessage") {
        return client.sendMessage(chatId, { image: { url }, caption }, { ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
    }
    else if (type === 'videoMessage') {
        const base64Thumb = await convertLibrary.convertVideoToThumbnail('url', url);
        return client.sendMessage(chatId, { video: { url }, mimetype: options === null || options === void 0 ? void 0 : options.mimetype, caption, jpegThumbnail: base64Thumb }, { ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
    }
    else if (type === 'audioMessage') {
        return client.sendMessage(chatId, { audio: { url }, mimetype: options === null || options === void 0 ? void 0 : options.mimetype }, { ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
    }
}
export async function replyText(client, chatId, text, quoted, options) {
    await updatePresence(client, chatId, "composing");
    return client.sendMessage(chatId, { text, linkPreview: null }, { quoted, ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
}
export async function replyFile(client, chatId, type, url, caption, quoted, options) {
    if (type == "imageMessage") {
        return client.sendMessage(chatId, { image: { url }, caption }, { quoted, ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
    }
    else if (type == "videoMessage") {
        const base64Thumb = await convertLibrary.convertVideoToThumbnail('file', url);
        return client.sendMessage(chatId, { video: { url }, mimetype: options === null || options === void 0 ? void 0 : options.mimetype, caption, jpegThumbnail: base64Thumb }, { quoted, ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
    }
    else if (type == "audioMessage") {
        return client.sendMessage(chatId, { audio: { url }, mimetype: options === null || options === void 0 ? void 0 : options.mimetype }, { quoted, ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
    }
}
export async function replyFileFromUrl(client, chatId, type, url, caption, quoted, options) {
    if (type == "imageMessage") {
        return client.sendMessage(chatId, { image: { url }, caption }, { quoted, ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
    }
    else if (type == "videoMessage") {
        const base64Thumb = await convertLibrary.convertVideoToThumbnail('url', url);
        return client.sendMessage(chatId, { video: { url }, mimetype: options === null || options === void 0 ? void 0 : options.mimetype, caption, jpegThumbnail: base64Thumb }, { quoted, ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
    }
    else if (type == "audioMessage") {
        return client.sendMessage(chatId, { audio: { url }, mimetype: options === null || options === void 0 ? void 0 : options.mimetype }, { quoted, ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
    }
}
export async function replyFileFromBuffer(client, chatId, type, buffer, caption, quoted, options) {
    if (type == "videoMessage") {
        const base64Thumb = await convertLibrary.convertVideoToThumbnail('buffer', buffer);
        return client.sendMessage(chatId, { video: buffer, caption, mimetype: options === null || options === void 0 ? void 0 : options.mimetype, jpegThumbnail: base64Thumb }, { quoted, ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
    }
    else if (type == "imageMessage") {
        return client.sendMessage(chatId, { image: buffer, caption }, { quoted, ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
    }
    else if (type == "audioMessage") {
        return client.sendMessage(chatId, { audio: buffer, mimetype: options === null || options === void 0 ? void 0 : options.mimetype }, { quoted, ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
    }
}
export async function replyWithMentions(client, chatId, text, mentions, quoted, options) {
    await updatePresence(client, chatId, "composing");
    return client.sendMessage(chatId, { text, mentions }, { quoted, ephemeralExpiration: options === null || options === void 0 ? void 0 : options.expiration });
}
export function joinGroupInviteLink(client, linkGroup) {
    return client.groupAcceptInvite(linkGroup);
}
export function revokeGroupInvite(client, groupId) {
    return client.groupRevokeInvite(groupId);
}
export async function getGroupInviteLink(client, groupId) {
    let inviteCode = await client.groupInviteCode(groupId);
    return inviteCode ? `https://chat.whatsapp.com/${inviteCode}` : undefined;
}
export function leaveGroup(client, groupId) {
    return client.groupLeave(groupId);
}
export function getGroupInviteInfo(client, linkGroup) {
    return client.groupGetInviteInfo(linkGroup);
}
export function updateGroupRestriction(client, groupId, status) {
    let config = status ? "announcement" : "not_announcement";
    return client.groupSettingUpdate(groupId, config);
}
export async function getAllGroups(client) {
    let groups = await client.groupFetchAllParticipating();
    let groupsInfo = [];
    for (let [key, value] of Object.entries(groups)) {
        groupsInfo.push(value);
    }
    return groupsInfo;
}
export async function removeParticipant(client, groupId, participant) {
    const [response] = await client.groupParticipantsUpdate(groupId, [participant], "remove");
    return response;
}
export async function addParticipant(client, groupId, participant) {
    const [response] = await client.groupParticipantsUpdate(groupId, [participant], "add");
    return response;
}
export async function promoteParticipant(client, groupId, participant) {
    const [response] = await client.groupParticipantsUpdate(groupId, [participant], "promote");
    return response;
}
export async function demoteParticipant(client, groupId, participant) {
    const [response] = await client.groupParticipantsUpdate(groupId, [participant], "demote");
    return response;
}
export async function formatWAMessage(m, group, hostId, admins) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!m.message)
        return;
    const type = getContentType(m.message);
    if (!type)
        return;
    if (!isAllowedType(type))
        return;
    if (!m.message[type])
        return;
    const contextInfo = (typeof m.message[type] != "string" && m.message[type] && "contextInfo" in m.message[type]) ? m.message[type].contextInfo : undefined;
    const isQuoted = (contextInfo === null || contextInfo === void 0 ? void 0 : contextInfo.quotedMessage) ? true : false;
    const sender = (m.key.fromMe) ? hostId : m.key.participant || m.key.remoteJid;
    const body = m.message.conversation || ((_a = m.message.extendedTextMessage) === null || _a === void 0 ? void 0 : _a.text) || undefined;
    const caption = (typeof m.message[type] != "string" && m.message[type] && "caption" in m.message[type]) ? m.message[type].caption : undefined;
    const text = caption || body || '';
    const [command, ...args] = text.trim().split(" ");
    const isGroupMsg = (_c = (_b = m.key.remoteJid) === null || _b === void 0 ? void 0 : _b.includes("@g.us")) !== null && _c !== void 0 ? _c : false;
    const message_id = m.key.id;
    const t = m.messageTimestamp;
    const chat_id = m.key.remoteJid;
    const isGroupAdmin = (sender && group) ? await new GroupController().isAdmin(group.id, sender) : false;
    if (!message_id || !t || !sender || !chat_id)
        return;
    let formattedMessage = {
        message_id,
        sender,
        type: type,
        t,
        chat_id,
        expiration: (contextInfo === null || contextInfo === void 0 ? void 0 : contextInfo.expiration) || undefined,
        pushname: m.pushName || '',
        body: m.message.conversation || ((_d = m.message.extendedTextMessage) === null || _d === void 0 ? void 0 : _d.text) || '',
        caption: caption || '',
        mentioned: (contextInfo === null || contextInfo === void 0 ? void 0 : contextInfo.mentionedJid) || [],
        text_command: (args === null || args === void 0 ? void 0 : args.join(" ").trim()) || '',
        command: removeBold(command === null || command === void 0 ? void 0 : command.toLowerCase().trim()) || '',
        args,
        isQuoted,
        isGroupMsg,
        isGroupAdmin,
        isBotAdmin: admins.map(admin => admin.id).includes(sender),
        isBotOwner: ((_e = admins.find(admin => admin.owner == true)) === null || _e === void 0 ? void 0 : _e.id) == sender,
        isBotMessage: (_f = m.key.fromMe) !== null && _f !== void 0 ? _f : false,
        isBroadcast: m.key.remoteJid == "status@broadcast",
        isMedia: type != "conversation" && type != "extendedTextMessage",
        wa_message: m,
    };
    if (formattedMessage.isMedia) {
        const mimetype = (typeof m.message[type] != "string" && m.message[type] && "mimetype" in m.message[type]) ? m.message[type].mimetype : undefined;
        const url = (typeof m.message[type] != "string" && m.message[type] && "url" in m.message[type]) ? m.message[type].url : undefined;
        const seconds = (typeof m.message[type] != "string" && m.message[type] && "seconds" in m.message[type]) ? m.message[type].seconds : undefined;
        const file_length = (typeof m.message[type] != "string" && m.message[type] && "fileLength" in m.message[type]) ? m.message[type].fileLength : undefined;
        if (!mimetype || !url || !file_length)
            return;
        formattedMessage.media = {
            mimetype,
            url,
            seconds: seconds || undefined,
            file_length
        };
    }
    if (formattedMessage.isQuoted) {
        const quotedMessage = contextInfo === null || contextInfo === void 0 ? void 0 : contextInfo.quotedMessage;
        if (!quotedMessage)
            return;
        const typeQuoted = getContentType(quotedMessage);
        const senderQuoted = contextInfo.participant || contextInfo.remoteJid;
        if (!typeQuoted || !senderQuoted)
            return;
        const captionQuoted = (typeof quotedMessage[typeQuoted] != "string" && quotedMessage[typeQuoted] && "caption" in quotedMessage[typeQuoted]) ? quotedMessage[typeQuoted].caption : undefined;
        formattedMessage.quotedMessage = {
            type: typeQuoted,
            sender: senderQuoted,
            body: quotedMessage.conversation || ((_g = quotedMessage.extendedTextMessage) === null || _g === void 0 ? void 0 : _g.text) || '',
            caption: captionQuoted || '',
            isMedia: typeQuoted != "conversation" && typeQuoted != "extendedTextMessage",
            wa_message: generateWAMessageFromContent(formattedMessage.chat_id, quotedMessage, { userJid: senderQuoted })
        };
        if ((_h = formattedMessage.quotedMessage) === null || _h === void 0 ? void 0 : _h.isMedia) {
            const urlQuoted = (typeof quotedMessage[typeQuoted] != "string" && quotedMessage[typeQuoted] && "url" in quotedMessage[typeQuoted]) ? quotedMessage[typeQuoted].url : undefined;
            const mimetypeQuoted = (typeof quotedMessage[typeQuoted] != "string" && quotedMessage[typeQuoted] && "mimetype" in quotedMessage[typeQuoted]) ? quotedMessage[typeQuoted].mimetype : undefined;
            const fileLengthQuoted = (typeof quotedMessage[typeQuoted] != "string" && quotedMessage[typeQuoted] && "fileLength" in quotedMessage[typeQuoted]) ? quotedMessage[typeQuoted].fileLength : undefined;
            const secondsQuoted = (typeof quotedMessage[typeQuoted] != "string" && quotedMessage[typeQuoted] && "seconds" in quotedMessage[typeQuoted]) ? quotedMessage[typeQuoted].seconds : undefined;
            if (!urlQuoted || !mimetypeQuoted || !fileLengthQuoted)
                return;
            formattedMessage.quotedMessage.media = {
                url: urlQuoted,
                mimetype: mimetypeQuoted,
                file_length: fileLengthQuoted,
                seconds: secondsQuoted || undefined,
            };
        }
    }
    return formattedMessage;
}
function isAllowedType(type) {
    const allowedTypes = [
        "conversation",
        "extendedTextMessage",
        "audioMessage",
        "imageMessage",
        "audioMessage",
        "documentMessage",
        "stickerMessage",
        "videoMessage",
    ];
    return allowedTypes.includes(type);
}
