import { BotService } from "../services/bot.service.js";
export class BotController {
    constructor() {
        this.botService = new BotService();
    }
    startBot(hostNumber) {
        return this.botService.startBot(hostNumber);
    }
    getBot() {
        return this.botService.getBot();
    }
    setName(name) {
        return this.botService.setNameBot(name);
    }
    setAuthorSticker(name) {
        return this.botService.setAuthorSticker(name);
    }
    setPackSticker(name) {
        return this.botService.setPackSticker(name);
    }
    setPrefix(prefix) {
        return this.botService.setPrefix(prefix);
    }
    storeMessageOnCache(message, messageCache) {
        return this.botService.storeMessageOnCache(message, messageCache);
    }
    getMessageFromCache(messageId, messageCache) {
        return this.botService.getMessageFromCache(messageId, messageCache);
    }
    incrementExecutedCommands() {
        return this.botService.incrementExecutedCommands();
    }
    // Recursos do BOT
    // Auto-Sticker PV
    setAutosticker(status) {
        return this.botService.setAutosticker(status);
    }
    // Modo admin
    setAdminMode(status) {
        return this.botService.setAdminMode(status);
    }
    // Comandos no PV
    setCommandsPv(status) {
        return this.botService.setCommandsPv(status);
    }
    // Taxa de comandos
    setCommandRate(status = true, maxCommandsMinute = 5, blockTime = 60) {
        return this.botService.setCommandRate(status, maxCommandsMinute, blockTime);
    }
    hasExceededCommandRate(botInfo, userId, isBotAdmin) {
        return this.botService.hasExceededCommandRate(botInfo, userId, isBotAdmin);
    }
    // Bloquear/Desbloquear comandos globalmente
    blockCommandsGlobally(commands) {
        return this.botService.blockCommandsGlobally(commands);
    }
    unblockCommandsGlobally(commands) {
        return this.botService.unblockCommandsGlobally(commands);
    }
    isCommandBlockedGlobally(command) {
        return this.botService.isCommandBlockedGlobally(command);
    }
}
