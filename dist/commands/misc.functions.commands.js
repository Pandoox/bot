import { waLib, miscLib } from "../libraries/library.js";
import { buildText, messageErrorCommandUsage, uppercaseFirst } from "../utils/general.util.js";
import getBotTexts from "../utils/bot.texts.util.js";
import { commandsMisc } from "./misc.list.commands.js";
import { GroupController } from "../controllers/group.controller.js";
export async function sorteioCommand(client, botInfo, message, group) {
    const miscCommands = commandsMisc(botInfo);
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    const chosenNumber = Number(message.text_command);
    if (!chosenNumber || chosenNumber <= 1) {
        throw new Error(miscCommands.sorteio.msgs.error_invalid_value);
    }
    const randomNumber = Math.floor(Math.random() * chosenNumber) + 1;
    const replyText = buildText(miscCommands.sorteio.msgs.reply, randomNumber);
    await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function sorteiomembroCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const miscCommands = commandsMisc(botInfo);
    const botTexts = getBotTexts(botInfo);
    if (!message.isGroupMsg || !group) {
        throw new Error(botTexts.permission.group);
    }
    const currentParticipantsIds = await groupController.getParticipantsIds(group.id);
    const randomParticipant = currentParticipantsIds[Math.floor(Math.random() * currentParticipantsIds.length)];
    const replyText = buildText(miscCommands.sorteiomembro.msgs.reply, waLib.removeWhatsappSuffix(randomParticipant));
    await waLib.replyWithMentions(client, message.chat_id, replyText, [randomParticipant], message.wa_message, { expiration: message.expiration });
}
export async function mascoteCommand(client, botInfo, message, group) {
    const miscCommands = commandsMisc(botInfo);
    const PIC_URL = "https://i.imgur.com/mVwa7q4.png";
    await waLib.replyFileFromUrl(client, message.chat_id, 'imageMessage', PIC_URL, 'WhatsApp Jr.', message.wa_message, { expiration: message.expiration });
}
/*
export async function simiCommand(client: WASocket, botInfo: Bot, message: Message, group? : Group){
    const miscCommands = commandsMisc(botInfo)

    if (!message.args.length) throw new Error(messageErrorCommandUsage(botInfo, message))

    const simiResult = await miscLib.simSimi(message.text_command)
    const replyText = buildText(miscCommands.simi.msgs.reply, timestampToDate(Date.now()), simiResult)
    await waLib.replyText(client, message.chat_id, replyText, message.wa_message, {expiration: message.expiration})
}*/
export async function viadometroCommand(client, botInfo, message, group) {
    var _a;
    const miscCommands = commandsMisc(botInfo);
    const botTexts = getBotTexts(botInfo);
    if (!message.isGroupMsg) {
        throw new Error(botTexts.permission.group);
    }
    else if (!message.isQuoted && !message.mentioned.length) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    else if (message.mentioned.length > 1) {
        throw new Error(miscCommands.viadometro.msgs.error_mention);
    }
    const randomNumber = Math.floor(Math.random() * 100);
    const messageToReply = (message.quotedMessage && message.mentioned.length != 1) ? (_a = message.quotedMessage) === null || _a === void 0 ? void 0 : _a.wa_message : message.wa_message;
    const replyText = buildText(miscCommands.viadometro.msgs.reply, randomNumber);
    await waLib.replyText(client, message.chat_id, replyText, messageToReply, { expiration: message.expiration });
}
export async function detectorCommand(client, botInfo, message, group) {
    var _a;
    const miscCommands = commandsMisc(botInfo);
    const botTexts = getBotTexts(botInfo);
    if (!message.isGroupMsg) {
        throw new Error(botTexts.permission.group);
    }
    else if (!message.isQuoted) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    const quotedMessage = (_a = message.quotedMessage) === null || _a === void 0 ? void 0 : _a.wa_message;
    if (!quotedMessage) {
        throw new Error(miscCommands.detector.msgs.error_message);
    }
    const truthMachineResult = miscLib.truthMachine();
    const waitReply = miscCommands.detector.msgs.wait;
    await waLib.replyFileFromUrl(client, message.chat_id, 'imageMessage', truthMachineResult.calibration_url, waitReply, quotedMessage, { expiration: message.expiration });
    await waLib.replyFileFromUrl(client, message.chat_id, 'imageMessage', truthMachineResult.result_url, '', quotedMessage, { expiration: message.expiration });
}
export async function roletarussaCommand(client, botInfo, message, group) {
    const miscCommands = commandsMisc(botInfo);
    const bulletPosition = Math.floor(Math.random() * 6) + 1;
    const currentPosition = Math.floor(Math.random() * 6) + 1;
    const hasShooted = (bulletPosition == currentPosition);
    let replyText;
    if (hasShooted) {
        replyText = miscCommands.roletarussa.msgs.reply_dead;
    }
    else {
        replyText = miscCommands.roletarussa.msgs.reply_alive;
    }
    await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function casalCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    const miscCommands = commandsMisc(botInfo);
    const botTexts = getBotTexts(botInfo);
    if (!message.isGroupMsg || !group) {
        throw new Error(botTexts.permission.group);
    }
    let currentParticipantsIds = await groupController.getParticipantsIds(group.id);
    if (currentParticipantsIds && currentParticipantsIds.length < 2) {
        throw new Error(miscCommands.casal.msgs.error);
    }
    let randomIndex = Math.floor(Math.random() * currentParticipantsIds.length);
    let chosenParticipant1 = currentParticipantsIds[randomIndex];
    currentParticipantsIds.splice(randomIndex, 1);
    randomIndex = Math.floor(Math.random() * currentParticipantsIds.length);
    let chosenParticipant2 = currentParticipantsIds[randomIndex];
    let replyText = buildText(miscCommands.casal.msgs.reply, waLib.removeWhatsappSuffix(chosenParticipant1), waLib.removeWhatsappSuffix(chosenParticipant2));
    await waLib.sendTextWithMentions(client, message.chat_id, replyText, [chosenParticipant1, chosenParticipant2], { expiration: message.expiration });
}
export async function caracoroaCommand(client, botInfo, message, group) {
    const miscCommands = commandsMisc(botInfo);
    const validChoices = ['cara', 'coroa'];
    const userChoice = message.text_command.toLowerCase();
    if (!message.args.length || !validChoices.includes(userChoice)) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    const flipCoinInfo = miscLib.flipCoin();
    const waitText = miscCommands.caracoroa.msgs.wait;
    await waLib.replyText(client, message.chat_id, waitText, message.wa_message, { expiration: message.expiration });
    const isUserVictory = flipCoinInfo.chosen_side == userChoice;
    let replyText;
    if (isUserVictory) {
        replyText = buildText(miscCommands.caracoroa.msgs.reply_victory, uppercaseFirst(flipCoinInfo.chosen_side));
    }
    else {
        replyText = buildText(miscCommands.caracoroa.msgs.reply_defeat, uppercaseFirst(flipCoinInfo.chosen_side));
    }
    await waLib.replyFileFromUrl(client, message.chat_id, 'imageMessage', flipCoinInfo.image_coin_url, replyText, message.wa_message, { expiration: message.expiration });
}
export async function pptCommand(client, botInfo, message, group) {
    const miscCommands = commandsMisc(botInfo);
    const validChoices = ["pedra", "papel", "tesoura"];
    const userChoice = message.text_command.toLocaleLowerCase();
    const randomIndex = Math.floor(Math.random() * validChoices.length);
    if (!message.args.length || !validChoices.includes(userChoice)) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    let botChoice = validChoices[randomIndex];
    let botIconChoice;
    let userIconChoice;
    let isUserVictory;
    if (botChoice == "pedra") {
        botIconChoice = "✊";
        if (userChoice == "pedra")
            userIconChoice = "✊";
        else if (userChoice == "tesoura")
            isUserVictory = false, userIconChoice = "✌️";
        else
            isUserVictory = true, userIconChoice = "✋";
    }
    else if (botChoice == "papel") {
        botIconChoice = "✋";
        if (userChoice == "pedra")
            isUserVictory = false, userIconChoice = "✊";
        else if (userChoice == "tesoura")
            isUserVictory = true, userIconChoice = "✌️";
        else
            userIconChoice = "✋";
    }
    else {
        botIconChoice = "✌️";
        if (userChoice == "pedra")
            isUserVictory = true, userIconChoice = "✊";
        else if (userChoice == "tesoura")
            userIconChoice = "✌️";
        else
            isUserVictory = false, userIconChoice = "✋";
    }
    let replyText;
    if (isUserVictory === true) {
        replyText = buildText(miscCommands.ppt.msgs.reply_victory, userIconChoice, botIconChoice);
    }
    else if (isUserVictory === false) {
        replyText = buildText(miscCommands.ppt.msgs.reply_defeat, userIconChoice, botIconChoice);
    }
    else {
        replyText = buildText(miscCommands.ppt.msgs.reply_draw, userIconChoice, botIconChoice);
    }
    await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function gadometroCommand(client, botInfo, message, group) {
    var _a;
    const miscCommands = commandsMisc(botInfo);
    const botTexts = getBotTexts(botInfo);
    if (!message.isGroupMsg || !group) {
        throw new Error(botTexts.permission.group);
    }
    else if (!message.isQuoted && !message.mentioned.length) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    else if (message.mentioned.length > 1) {
        throw new Error(miscCommands.gadometro.msgs.error_mention);
    }
    const randomNumber = Math.floor(Math.random() * 100);
    const messageToReply = (message.quotedMessage && message.mentioned.length != 1) ? (_a = message.quotedMessage) === null || _a === void 0 ? void 0 : _a.wa_message : message.wa_message;
    const replyText = buildText(miscCommands.gadometro.msgs.reply, randomNumber);
    await waLib.replyText(client, message.chat_id, replyText, messageToReply, { expiration: message.expiration });
}
export async function bafometroCommand(client, botInfo, message, group) {
    var _a;
    const miscCommands = commandsMisc(botInfo);
    const botTexts = getBotTexts(botInfo);
    if (!message.isGroupMsg || !group) {
        throw new Error(botTexts.permission.group);
    }
    else if (!message.isQuoted && !message.mentioned.length) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    else if (message.mentioned.length > 1) {
        throw new Error(miscCommands.bafometro.msgs.error_mention);
    }
    const randomNumber = Math.floor(Math.random() * 100);
    const messageToReply = (message.quotedMessage && message.mentioned.length != 1) ? (_a = message.quotedMessage) === null || _a === void 0 ? void 0 : _a.wa_message : message.wa_message;
    const replyText = buildText(miscCommands.bafometro.msgs.reply, randomNumber);
    await waLib.replyText(client, message.chat_id, replyText, messageToReply, { expiration: message.expiration });
}
export async function top5Command(client, botInfo, message, group) {
    const groupController = new GroupController();
    const miscCommands = commandsMisc(botInfo);
    const botTexts = getBotTexts(botInfo);
    if (!message.isGroupMsg || !group) {
        throw new Error(botTexts.permission.group);
    }
    else if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    let rankingTheme = message.text_command;
    let currentParticipantsIds = await groupController.getParticipantsIds(group.id);
    if (currentParticipantsIds.length < 5) {
        throw new Error(miscCommands.top5.msgs.error_members);
    }
    let replyText = buildText(miscCommands.top5.msgs.reply_title, rankingTheme);
    let mentionList = [];
    for (let i = 1; i <= 5; i++) {
        let icon;
        switch (i) {
            case 1:
                icon = '🥇';
                break;
            case 2:
                icon = '🥈';
                break;
            case 3:
                icon = '🥉';
                break;
            default:
                icon = '';
        }
        let randomIndex = Math.floor(Math.random() * currentParticipantsIds.length);
        let chosenParticipant = currentParticipantsIds[randomIndex];
        replyText += buildText(miscCommands.top5.msgs.reply_item, icon, i, waLib.removeWhatsappSuffix(chosenParticipant));
        mentionList.push(chosenParticipant);
        currentParticipantsIds.splice(currentParticipantsIds.indexOf(chosenParticipant, 1));
    }
    await waLib.sendTextWithMentions(client, message.chat_id, replyText, mentionList, { expiration: message.expiration });
}
export async function parCommand(client, botInfo, message, group) {
    const miscCommands = commandsMisc(botInfo);
    const botTexts = getBotTexts(botInfo);
    if (!message.isGroupMsg || !group) {
        throw new Error(botTexts.permission.group);
    }
    else if (message.mentioned.length !== 2) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    const randomNumber = Math.floor(Math.random() * 100);
    let replyText = buildText(miscCommands.par.msgs.reply, waLib.removeWhatsappSuffix(message.mentioned[0]), waLib.removeWhatsappSuffix(message.mentioned[1]), randomNumber);
    await waLib.sendTextWithMentions(client, message.chat_id, replyText, message.mentioned, { expiration: message.expiration });
}
export async function chanceCommand(client, botInfo, message, group) {
    var _a;
    const miscCommands = commandsMisc(botInfo);
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    const randomNumber = Math.floor(Math.random() * 100);
    const replyText = buildText(miscCommands.chance.msgs.reply, randomNumber, message.text_command);
    const messageToReply = (message.isQuoted && message.quotedMessage) ? (_a = message.quotedMessage) === null || _a === void 0 ? void 0 : _a.wa_message : message.wa_message;
    await waLib.replyText(client, message.chat_id, replyText, messageToReply, { expiration: message.expiration });
}
export async function fraseCommand(client, botInfo, message, group) {
    const miscCommands = commandsMisc(botInfo);
    const phraseResult = await miscLib.funnyRandomPhrases();
    const replyText = buildText(miscCommands.frase.msgs.reply, phraseResult.text);
    await waLib.replyFileFromUrl(client, message.chat_id, 'imageMessage', phraseResult.image_url, replyText, message.wa_message, { expiration: message.expiration });
}
