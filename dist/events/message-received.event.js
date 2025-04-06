import { getContentType } from 'baileys';
import { showConsoleError } from '../utils/general.util.js';
import { UserController } from '../controllers/user.controller.js';
import { handleGroupMessage, handlePrivateMessage } from '../helpers/message.handler.helper.js';
import { GroupController } from '../controllers/group.controller.js';
import { BotController } from '../controllers/bot.controller.js';
import { waLib } from '../libraries/library.js';
import { commandInvoker } from '../helpers/command.invoker.helper.js';
export async function messageReceived(client, messages, botInfo, messageCache) {
    try {
        if (!messages.messages[0].message) {
            return;
        }
        const contentType = getContentType(messages.messages[0].message);
        if (!contentType) {
            return;
        }
        else if (messages.messages[0].key.fromMe) {
            new BotController().storeMessageOnCache(messages.messages[0], messageCache);
        }
        switch (messages.type) {
            case 'notify':
                const userController = new UserController();
                const groupController = new GroupController();
                const admins = await userController.getAdmins();
                const idChat = messages.messages[0].key.remoteJid;
                const isGroupMsg = idChat === null || idChat === void 0 ? void 0 : idChat.includes("@g.us");
                const group = (isGroupMsg && idChat) ? await groupController.getGroup(idChat) : null;
                let message = await waLib.formatWAMessage(messages.messages[0], group, botInfo.host_number, admins);
                if (message) {
                    await userController.registerUser(message.sender, message.pushname);
                    let callCommand;
                    if (!isGroupMsg) {
                        callCommand = await handlePrivateMessage(client, botInfo, message);
                        if (callCommand) {
                            await commandInvoker(client, botInfo, message, null);
                        }
                    }
                    else if (group) {
                        callCommand = await handleGroupMessage(client, group, botInfo, message);
                        if (callCommand) {
                            await commandInvoker(client, botInfo, message, group);
                        }
                    }
                }
                break;
        }
    }
    catch (err) {
        showConsoleError(err, "MESSAGES.UPSERT");
    }
}
