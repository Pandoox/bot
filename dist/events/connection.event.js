import { DisconnectReason } from 'baileys';
import { Boom } from '@hapi/boom';
import fs from "fs-extra";
import dotenv from 'dotenv';
import { BotController } from '../controllers/bot.controller.js';
import { buildText, showConsoleError, getCurrentBotVersion, colorText } from '../utils/general.util.js';
import getBotTexts from '../utils/bot.texts.util.js';
import { UserController } from '../controllers/user.controller.js';
import { waLib } from '../libraries/library.js';
import qrcode from 'qrcode-terminal';
import readline from 'readline/promises';
export async function connectionQr(client, connectionState) {
    const botTexts = getBotTexts();
    const { qr } = connectionState;
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const answerMethod = await rl.question(botTexts.input_connection_method);
    if (answerMethod == '2') {
        const answerNumber = await rl.question(botTexts.input_phone_number);
        const code = await client.requestPairingCode(answerNumber.replace(/\W+/g, ""));
        console.log('[CÓDIGO DE PAREAMENTO]', colorText(buildText(botTexts.show_pairing_code, code)));
    }
    else {
        if (qr) {
            await new Promise(resolve => {
                qrcode.generate(qr, { small: true }, (qrcode) => {
                    console.log(qrcode);
                    resolve();
                });
            });
        }
    }
}
export async function connectionOpen(client) {
    try {
        const botTexts = getBotTexts();
        const botController = new BotController();
        console.log(buildText(botTexts.starting, getCurrentBotVersion()));
        dotenv.config();
        botController.startBot(waLib.getHostNumber(client));
        console.log("[BOT]", colorText(botTexts.bot_data));
        await checkOwnerRegister();
    }
    catch (err) {
        showConsoleError(err, "CONNECTION");
        client.end(new Error("fatal_error"));
    }
}
export function connectionClose(connectionState) {
    var _a, _b, _c;
    try {
        const botTexts = getBotTexts();
        const { lastDisconnect } = connectionState;
        let needReconnect = false;
        const errorCode = (new Boom(lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error)).output.statusCode;
        if (((_a = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.message) == "admin_command") {
            showConsoleError(new Error(botTexts.disconnected.command), 'CONNECTION');
        }
        else if (((_b = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _b === void 0 ? void 0 : _b.message) == "fatal_error") {
            showConsoleError(new Error(botTexts.disconnected.fatal_error), 'CONNECTION');
        }
        else {
            needReconnect = true;
            if (errorCode == (DisconnectReason === null || DisconnectReason === void 0 ? void 0 : DisconnectReason.loggedOut)) {
                fs.rmSync("session", { recursive: true, force: true });
                showConsoleError(new Error(botTexts.disconnected.logout), 'CONNECTION');
            }
            else if (errorCode == 405) {
                fs.rmSync("session", { recursive: true, force: true });
            }
            else if (errorCode == (DisconnectReason === null || DisconnectReason === void 0 ? void 0 : DisconnectReason.restartRequired)) {
                showConsoleError(new Error(botTexts.disconnected.restart), 'CONNECTION');
            }
            else {
                showConsoleError(new Error(buildText(botTexts.disconnected.bad_connection, errorCode.toString(), (_c = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _c === void 0 ? void 0 : _c.message)), 'CONNECTION');
            }
        }
        return needReconnect;
    }
    catch (_d) {
        return false;
    }
}
async function checkOwnerRegister() {
    const owner = await new UserController().getOwner();
    if (!owner) {
        console.log("[DONO]", colorText("O número do DONO ainda não foi configurado, digite !admin para cadastrar seu número como dono do bot.", "#d63e3e"));
    }
    else {
        console.log("[DONO]", colorText("✓ Número do DONO configurado."));
    }
}
