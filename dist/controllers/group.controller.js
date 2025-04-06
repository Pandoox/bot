import { GroupService } from "../services/group.service.js";
export class GroupController {
    constructor() {
        this.groupService = new GroupService();
    }
    // *********************** OBTER DADOS DO GRUPO ***********************
    getGroup(groupId) {
        return this.groupService.getGroup(groupId);
    }
    isRegistered(groupId) {
        return this.groupService.isRegistered(groupId);
    }
    getOwner(groupId) {
        return this.groupService.getOwner(groupId);
    }
    isRestricted(groupId) {
        return this.groupService.isRestricted(groupId);
    }
    getAllGroups() {
        return this.groupService.getAllGroups();
    }
    // *********************** REGISTRA/REMOVE/ATUALIZA GRUPOS ***********************
    registerGroup(group) {
        return this.groupService.registerGroup(group);
    }
    setNameGroup(groupId, name) {
        return this.groupService.setName(groupId, name);
    }
    setRestrictedGroup(groupId, status) {
        return this.groupService.setRestricted(groupId, status);
    }
    syncGroups(groups) {
        return this.groupService.syncGroups(groups);
    }
    updatePartialGroup(group) {
        return this.groupService.updatePartialGroup(group);
    }
    removeGroup(groupId) {
        return this.groupService.removeGroup(groupId);
    }
    incrementGroupCommands(groupId) {
        return this.groupService.incrementGroupCommands(groupId);
    }
    // *********************** PARTICIPANTES/ADMINS ***********************
    getParticipant(groupId, userId) {
        return this.groupService.getParticipant(groupId, userId);
    }
    getParticipants(groupId) {
        return this.groupService.getParticipants(groupId);
    }
    getParticipantsIds(groupId) {
        return this.groupService.getParticipantsIds(groupId);
    }
    getAdmins(groupId) {
        return this.groupService.getAdmins(groupId);
    }
    getAdminsIds(groupId) {
        return this.groupService.getAdminsIds(groupId);
    }
    isParticipant(groupId, userId) {
        return this.groupService.isParticipant(groupId, userId);
    }
    addParticipant(groupId, userId, isAdmin = false) {
        return this.groupService.addParticipant(groupId, userId, isAdmin);
    }
    addAdmin(groupId, userId) {
        return this.groupService.addAdmin(groupId, userId);
    }
    removeAdmin(groupId, userId) {
        return this.groupService.removeAdmin(groupId, userId);
    }
    isAdmin(groupId, userId) {
        return this.groupService.isAdmin(groupId, userId);
    }
    removeParticipant(groupId, userId) {
        return this.groupService.removeParticipant(groupId, userId);
    }
    getParticipantsActivityLowerThan(group, num) {
        return this.groupService.getParticipantActivityLowerThan(group, num);
    }
    getParticipantsActivityRanking(group, num) {
        return this.groupService.getParticipantsActivityRanking(group, num);
    }
    incrementParticipantActivity(groupId, userId, type, isCommand) {
        return this.groupService.incrementParticipantActivity(groupId, userId, type, isCommand);
    }
    addWarning(groupId, userId) {
        return this.groupService.addWarning(groupId, userId);
    }
    removeWarning(groupId, userId, currentWarnings) {
        return this.groupService.removeWarning(groupId, userId, currentWarnings);
    }
    removeParticipantsWarnings(groupId) {
        return this.groupService.removeParticipantsWarnings(groupId);
    }
    // *********************** Recursos do grupo ***********************
    // ***** FILTRO DE PALAVRAS *****
    addWordFilter(groupId, word) {
        return this.groupService.addWordFilter(groupId, word);
    }
    removeWordFilter(groupId, word) {
        return this.groupService.removeWordFilter(groupId, word);
    }
    // ***** BEM VINDO *****
    setWelcome(groupId, status, message = '') {
        return this.groupService.setWelcome(groupId, status, message);
    }
    getWelcomeMessage(group, botInfo, userId) {
        return this.groupService.getWelcomeMessage(group, botInfo, userId);
    }
    // ***** ANTI-LINK *****
    setAntiLink(groupId, status = true) {
        return this.groupService.setAntilink(groupId, status);
    }
    // ***** AUTO-STICKER *****
    setAutoSticker(groupId, status = true) {
        return this.groupService.setAutosticker(groupId, status);
    }
    // ***** ANTI-FAKE *****
    setAntiFake(groupId, status = true, allowed) {
        return this.groupService.setAntifake(groupId, status, allowed);
    }
    isNumberFake(group, userId) {
        return this.groupService.isNumberFake(group, userId);
    }
    // ***** MUTAR GRUPO *****
    setMuted(groupId, status = true) {
        return this.groupService.setMuted(groupId, status);
    }
    // ***** ANTI-FLOOD *****
    setAntiFlood(groupId, status = true, maxMessages = 10, interval = 10) {
        return this.groupService.setAntiFlood(groupId, status, maxMessages, interval);
    }
    isFlood(group, userId, isGroupAdmin) {
        return this.groupService.isFlood(group, userId, isGroupAdmin);
    }
    // ***** LISTA-NEGRA *****
    getBlackList(groupId) {
        return this.groupService.getBlackList(groupId);
    }
    addBlackList(groupId, userId) {
        return this.groupService.addBlackList(groupId, userId);
    }
    removeBlackList(groupId, userId) {
        return this.groupService.removeBlackList(groupId, userId);
    }
    isBlackListed(groupId, userId) {
        return this.groupService.isBlackListed(groupId, userId);
    }
    // ***** BLOQUEAR/DESBLOQUEAR COMANDOS *****
    blockCommands(group, commands, botInfo) {
        return this.groupService.blockCommands(group, commands, botInfo);
    }
    unblockCommands(group, commands, botInfo) {
        return this.groupService.unblockCommand(group, commands, botInfo);
    }
    isBlockedCommand(group, command, botInfo) {
        return this.groupService.isBlockedCommand(group, command, botInfo);
    }
}
