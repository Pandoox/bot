import { timestampToDate, buildText } from '../utils/general.util.js';
import moment from 'moment-timezone';
import getBotTexts from "../utils/bot.texts.util.js";
import { commandsGroup } from "../commands/group.list.commands.js";
import { commandExist, getCommandsByCategory } from "../utils/commands.util.js";
import { waLib } from "../libraries/library.js";
import DataStore from "@seald-io/nedb";
const db = {
    groups: new DataStore({ filename: './storage/groups.db', autoload: true }),
    participants: new DataStore({ filename: './storage/participants.groups.db', autoload: true })
};
export class GroupService {
    // *********************** Registra/Atualiza/Remove grupos ***********************
    async registerGroup(groupMetadata) {
        const isRegistered = await this.isRegistered(groupMetadata.id);
        if (isRegistered) {
            return;
        }
        const groupData = {
            id: groupMetadata.id,
            name: groupMetadata.subject,
            description: groupMetadata.desc,
            commands_executed: 0,
            owner: groupMetadata.owner,
            restricted: groupMetadata.announce,
            expiration: groupMetadata.ephemeralDuration,
            muted: false,
            welcome: { status: false, msg: '' },
            antifake: { status: false, allowed: [] },
            antilink: false,
            antiflood: { status: false, max_messages: 10, interval: 10 },
            autosticker: false,
            block_cmds: [],
            blacklist: [],
            word_filter: []
        };
        const newGroup = await db.groups.insertAsync(groupData);
        groupMetadata.participants.forEach(async (participant) => {
            const isAdmin = (participant.admin) ? true : false;
            await this.addParticipant(newGroup.id, participant.id, isAdmin);
        });
    }
    async syncGroups(groupsMeta) {
        //Deletando grupos em que o bot não está mais
        const currentGroups = await this.getAllGroups();
        currentGroups.forEach(async (group) => {
            if (!groupsMeta.find(groupMeta => groupMeta.id == group.id)) {
                await this.removeGroup(group.id);
            }
        });
        //Atualizando grupos em que o bot está
        for (let groupMeta of groupsMeta) {
            const isRegistered = await this.isRegistered(groupMeta.id);
            if (isRegistered) { // Se o grupo já estiver registrado sincronize os dados do grupo e os participantes.
                await db.groups.updateAsync({ id: groupMeta.id }, { $set: {
                        name: groupMeta.subject,
                        description: groupMeta.desc,
                        owner: groupMeta.owner,
                        restricted: groupMeta.announce,
                        expiration: groupMeta.ephemeralDuration
                    } });
                //Adiciona participantes no banco de dados que entraram enquanto o bot estava off.
                groupMeta.participants.forEach(async (participant) => {
                    const isAdmin = (participant.admin) ? true : false;
                    const isParticipant = await this.isParticipant(groupMeta.id, participant.id);
                    if (!isParticipant) {
                        await this.addParticipant(groupMeta.id, participant.id, isAdmin);
                    }
                    else {
                        await db.participants.updateAsync({ group_id: groupMeta.id, user_id: participant.id }, { $set: { admin: isAdmin } });
                    }
                });
                //Remove participantes do banco de dados que sairam do grupo enquanto o bot estava off.
                const currentParticipants = await this.getParticipants(groupMeta.id);
                currentParticipants.forEach(async (participant) => {
                    if (!groupMeta.participants.find(groupMetaParticipant => groupMetaParticipant.id == participant.user_id)) {
                        await this.removeParticipant(groupMeta.id, participant.user_id);
                    }
                });
            }
            else { // Se o grupo não estiver registrado, faça o registro.
                await this.registerGroup(groupMeta);
            }
        }
    }
    updatePartialGroup(group) {
        if (group.id) {
            if (group.desc) {
                return this.setDescription(group.id, group.desc);
            }
            else if (group.subject) {
                return this.setName(group.id, group.subject);
            }
            else if (group.announce) {
                return this.setRestricted(group.id, group.announce);
            }
            else if (group.ephemeralDuration) {
                return this.setExpiration(group.id, group.ephemeralDuration);
            }
        }
    }
    async getGroup(groupId) {
        const group = await db.groups.findOneAsync({ id: groupId });
        return group;
    }
    async removeGroup(groupId) {
        return db.groups.removeAsync({ id: groupId }, { multi: true });
    }
    async getAllGroups() {
        const groups = await db.groups.findAsync({});
        return groups;
    }
    async isRegistered(groupId) {
        const group = await this.getGroup(groupId);
        return (group != null);
    }
    async isRestricted(groupId) {
        const group = await this.getGroup(groupId);
        return group === null || group === void 0 ? void 0 : group.restricted;
    }
    setName(groupId, name) {
        return db.groups.updateAsync({ id: groupId }, { $set: { name } });
    }
    setRestricted(groupId, restricted) {
        return db.groups.updateAsync({ id: groupId }, { $set: { restricted } });
    }
    setExpiration(groupId, expiration) {
        return db.groups.updateAsync({ id: groupId }, { $set: { expiration } });
    }
    setDescription(groupId, description) {
        return db.groups.updateAsync({ id: groupId }, { $set: { description } });
    }
    incrementGroupCommands(groupId) {
        return db.groups.updateAsync({ id: groupId }, { $inc: { commands_executed: 1 } });
    }
    async getOwner(groupId) {
        const group = await this.getGroup(groupId);
        return group === null || group === void 0 ? void 0 : group.owner;
    }
    // ***** Participantes *****
    async addParticipant(groupId, userId, isAdmin = false) {
        const isParticipant = await this.isParticipant(groupId, userId);
        if (isParticipant) {
            return;
        }
        const participant = {
            group_id: groupId,
            user_id: userId,
            registered_since: timestampToDate(moment.now()),
            commands: 0,
            admin: isAdmin,
            msgs: 0,
            image: 0,
            audio: 0,
            sticker: 0,
            video: 0,
            text: 0,
            other: 0,
            warnings: 0,
            antiflood: {
                expire: 0,
                msgs: 0
            }
        };
        return db.participants.insertAsync(participant);
    }
    async removeParticipant(groupId, userId) {
        return db.participants.removeAsync({ group_id: groupId, user_id: userId }, {});
    }
    async addAdmin(groupId, userId) {
        const isAdmin = await this.isAdmin(groupId, userId);
        if (!isAdmin) {
            return db.participants.updateAsync({ group_id: groupId, user_id: userId }, { $set: { admin: true } });
        }
    }
    async removeAdmin(groupId, userId) {
        const isAdmin = await this.isAdmin(groupId, userId);
        if (isAdmin) {
            return db.groups.updateAsync({ group_id: groupId, user_id: userId }, { $set: { admin: false } });
        }
    }
    async getParticipant(groupId, userId) {
        const participant = await db.participants.findOneAsync({ group_id: groupId, user_id: userId });
        return participant;
    }
    async getParticipants(groupId) {
        const participants = await db.participants.findAsync({ group_id: groupId });
        return participants;
    }
    async getParticipantsIds(groupId) {
        const participants = await this.getParticipants(groupId);
        return participants.map(participant => participant.user_id);
    }
    async getAdmins(groupId) {
        const admins = await db.participants.findAsync({ group_id: groupId, admin: true });
        return admins;
    }
    async getAdminsIds(groupId) {
        const admins = await db.participants.findAsync({ group_id: groupId, admin: true });
        return admins.map(admin => admin.user_id);
    }
    async isParticipant(groupId, userId) {
        const participantsIds = await this.getParticipantsIds(groupId);
        return participantsIds.includes(userId);
    }
    async isAdmin(groupId, userId) {
        const adminsIds = await this.getAdminsIds(groupId);
        return adminsIds.includes(userId);
    }
    incrementParticipantActivity(groupId, userId, type, isCommand) {
        let incrementedUser = { msgs: 1 };
        if (isCommand) {
            incrementedUser.commands = 1;
        }
        switch (type) {
            case "conversation":
            case "extendedTextMessage":
                incrementedUser.text = 1;
                break;
            case "imageMessage":
                incrementedUser.image = 1;
                break;
            case "videoMessage":
                incrementedUser.video = 1;
                break;
            case "stickerMessage":
                incrementedUser.sticker = 1;
                break;
            case "audioMessage":
                incrementedUser.audio = 1;
                break;
            case "documentMessage":
                incrementedUser.other = 1;
                break;
        }
        return db.participants.updateAsync({ group_id: groupId, user_id: userId }, { $inc: incrementedUser });
    }
    async getParticipantActivityLowerThan(group, num) {
        const inactives = await db.participants.findAsync({ group_id: group.id, msgs: { $lt: num } }).sort({ msgs: -1 });
        return inactives;
    }
    async getParticipantsActivityRanking(group, qty) {
        let participantsLeaderboard = await db.participants.findAsync({ group_id: group.id }).sort({ msgs: -1 });
        const qty_leaderboard = (qty > participantsLeaderboard.length) ? participantsLeaderboard.length : qty;
        return participantsLeaderboard.splice(0, qty_leaderboard);
    }
    addWarning(groupId, userId) {
        return db.participants.updateAsync({ group_id: groupId, user_id: userId }, { $inc: { warnings: 1 } });
    }
    removeWarning(groupId, userId, currentWarnings) {
        return db.participants.updateAsync({ group_id: groupId, user_id: userId }, { $set: { warnings: --currentWarnings } });
    }
    removeParticipantsWarnings(groupId) {
        return db.participants.updateAsync({ group_id: groupId }, { $set: { warnings: 0 } });
    }
    // *********************** RECURSOS DO GRUPO ***********************
    // ***** FILTRO DE PALAVRAS *****
    addWordFilter(groupId, word) {
        return db.groups.updateAsync({ id: groupId }, { $push: { word_filter: word } });
    }
    removeWordFilter(groupId, word) {
        return db.groups.updateAsync({ id: groupId }, { $pull: { word_filter: word } });
    }
    // ***** BEM-VINDO *****
    setWelcome(groupId, status, msg) {
        return db.groups.updateAsync({ id: groupId }, { $set: { "welcome.status": status, "welcome.msg": msg } });
    }
    getWelcomeMessage(group, botInfo, userId) {
        const botTexts = getBotTexts(botInfo);
        const custom_message = (group.welcome.msg != "") ? group.welcome.msg + "\n\n" : "";
        const message_welcome = buildText(botTexts.group_welcome_message, waLib.removeWhatsappSuffix(userId), group.name, custom_message);
        return message_welcome;
    }
    // ***** ANTI-FAKE *****
    setAntifake(groupId, status, allowed) {
        return db.groups.updateAsync({ id: groupId }, { $set: { "antifake.status": status, "antifake.allowed": allowed } });
    }
    isNumberFake(group, userId) {
        const allowedPrefixes = group.antifake.allowed;
        for (let numberPrefix of allowedPrefixes) {
            if (userId.startsWith(numberPrefix)) {
                return false;
            }
        }
        return true;
    }
    // ***** MUTAR GRUPO *****
    setMuted(groupId, status) {
        return db.groups.updateAsync({ id: groupId }, { $set: { muted: status } });
    }
    // ***** ANTI-LINK *****
    setAntilink(groupId, status) {
        return db.groups.updateAsync({ id: groupId }, { $set: { antilink: status } });
    }
    // ***** AUTO-STICKER *****
    setAutosticker(groupId, status) {
        return db.groups.updateAsync({ id: groupId }, { $set: { autosticker: status } });
    }
    // ***** ANTI-FLOOD *****
    async setAntiFlood(groupId, status, maxMessages, interval) {
        return db.groups.updateAsync({ id: groupId }, { $set: { 'antiflood.status': status, 'antiflood.max_messages': maxMessages, 'antiflood.interval': interval } });
    }
    async hasExpiredMessages(group, participant, currentTimestamp) {
        if (group && currentTimestamp > participant.antiflood.expire) {
            const expireTimestamp = currentTimestamp + (group === null || group === void 0 ? void 0 : group.antiflood.interval);
            await db.participants.updateAsync({ group_id: group.id, user_id: participant.user_id }, { $set: { 'antiflood.expire': expireTimestamp, 'antiflood.msgs': 1 } });
            return true;
        }
        else {
            await db.participants.updateAsync({ group_id: group.id, user_id: participant.user_id }, { $inc: { 'antiflood.msgs': 1 } });
            return false;
        }
    }
    async isFlood(group, userId, isGroupAdmin) {
        const currentTimestamp = Math.round(moment.now() / 1000);
        const participant = await this.getParticipant(group.id, userId);
        let isFlood = false;
        if (!participant || isGroupAdmin || !group.antiflood.status) {
            return false;
        }
        const hasExpiredMessages = await this.hasExpiredMessages(group, participant, currentTimestamp);
        if (!hasExpiredMessages && participant.antiflood.msgs >= group.antiflood.max_messages) {
            isFlood = true;
        }
        else {
            isFlood = false;
        }
        return isFlood;
    }
    // ***** LISTA-NEGRA *****
    async getBlackList(groupId) {
        const group = await this.getGroup(groupId);
        return (group === null || group === void 0 ? void 0 : group.blacklist) || [];
    }
    addBlackList(groupId, userId) {
        return db.groups.updateAsync({ id: groupId }, { $push: { blacklist: userId } });
    }
    removeBlackList(groupId, userId) {
        return db.groups.updateAsync({ id: groupId }, { $pull: { blacklist: userId } });
    }
    async isBlackListed(groupId, userId) {
        const list = await this.getBlackList(groupId);
        return list.includes(userId);
    }
    // ***** BLOQUEAR/DESBLOQUEAR COMANDOS *****
    async blockCommands(group, commands, botInfo) {
        const { prefix } = botInfo;
        const groupCommands = commandsGroup(botInfo);
        let blockedCommands = [];
        let blockResponse = groupCommands.bcmd.msgs.reply_title;
        let categories = ['sticker', 'utility', 'download', 'misc'];
        if (commands[0] == 'variado') {
            commands[0] = 'misc';
        }
        else if (commands[0] == 'utilidade') {
            commands[0] = 'utility';
        }
        if (categories.includes(commands[0])) {
            commands = getCommandsByCategory(botInfo, commands[0]);
        }
        for (let command of commands) {
            if (commandExist(botInfo, command, 'utility') || commandExist(botInfo, command, 'misc') || commandExist(botInfo, command, 'sticker') || commandExist(botInfo, command, 'download')) {
                if (group.block_cmds.includes(waLib.removePrefix(prefix, command))) {
                    blockResponse += buildText(groupCommands.bcmd.msgs.reply_item_already_blocked, command);
                }
                else {
                    blockedCommands.push(waLib.removePrefix(prefix, command));
                    blockResponse += buildText(groupCommands.bcmd.msgs.reply_item_blocked, command);
                }
            }
            else if (commandExist(botInfo, command, 'group') || commandExist(botInfo, command, 'admin') || commandExist(botInfo, command, 'info')) {
                blockResponse += buildText(groupCommands.bcmd.msgs.reply_item_error, command);
            }
            else {
                blockResponse += buildText(groupCommands.bcmd.msgs.reply_item_not_exist, command);
            }
        }
        if (blockedCommands.length != 0) {
            await db.groups.updateAsync({ id: group.id }, { $push: { block_cmds: { $each: blockedCommands } } });
        }
        return blockResponse;
    }
    async unblockCommand(group, commands, botInfo) {
        const groupCommands = commandsGroup(botInfo);
        const { prefix } = botInfo;
        let unblockedCommands = [];
        let unblockResponse = groupCommands.dcmd.msgs.reply_title;
        let categories = ['all', 'sticker', 'utility', 'download', 'misc'];
        if (commands[0] == 'todos') {
            commands[0] = 'all';
        }
        else if (commands[0] == 'utilidade') {
            commands[0] = 'utility';
        }
        else if (commands[0] == 'variado') {
            commands[0] = 'misc';
        }
        if (categories.includes(commands[0])) {
            if (commands[0] === 'all') {
                commands = group.block_cmds.map(command => prefix + command);
            }
            else {
                commands = getCommandsByCategory(botInfo, commands[0]);
            }
        }
        for (let command of commands) {
            if (group.block_cmds.includes(waLib.removePrefix(prefix, command))) {
                unblockedCommands.push(waLib.removePrefix(prefix, command));
                unblockResponse += buildText(groupCommands.dcmd.msgs.reply_item_unblocked, command);
            }
            else {
                unblockResponse += buildText(groupCommands.dcmd.msgs.reply_item_not_blocked, command);
            }
        }
        if (unblockedCommands.length != 0) {
            await db.groups.updateAsync({ id: group.id }, { $pull: { block_cmds: { $in: unblockedCommands } } });
        }
        return unblockResponse;
    }
    isBlockedCommand(group, command, botInfo) {
        const { prefix } = botInfo;
        return group.block_cmds.includes(waLib.removePrefix(prefix, command));
    }
}
