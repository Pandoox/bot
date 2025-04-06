import { updaterLib } from "../libraries/library.js";
import { colorText, getCurrentBotVersion } from "../utils/general.util.js";
import getBotTexts from "../utils/bot.texts.util.js";
import { BotController } from "../controllers/bot.controller.js";
import fs from 'fs-extra'
import inquirer from "inquirer"

export async function botUpdater(){
    const botTexts = getBotTexts(new BotController().getBot())
    let hasBotUpdated = false
    
    try{
        const currentVersion = getCurrentBotVersion()
        const checkUpdate = await updaterLib.checkUpdate(currentVersion)

        if (checkUpdate.latest) {
            console.log("[ATUALIZAÇÃO]", colorText(botTexts.no_update_available))
        } else if(!checkUpdate.patch_update) {
            const answer = await inquirer.prompt([{
                type: 'rawlist',
                name: 'update',
                message: botTexts.update_available_manual,
                choices: [
                    "Sim",
                    "Não"
                ]
            }])

            if(answer.update === "Sim"){
                fs.removeSync('./dist')
                fs.removeSync('./storage')
                await updaterLib.makeUpdate('./')
                console.log("[ATUALIZAÇÃO]", colorText(botTexts.bot_updated))
                hasBotUpdated = true
            }
        } else {
            console.log("[ATUALIZAÇÃO]", colorText(botTexts.update_available, '#e0e031'))
            fs.removeSync('./dist')
            await updaterLib.makeUpdate('./')
            console.log("[ATUALIZAÇÃO]", colorText(botTexts.bot_updated))
            hasBotUpdated = true
        }
        
        return hasBotUpdated
    } catch(err){
        console.log("[ATUALIZAÇÃO]", colorText(botTexts.error_check_update, '#e0e031'))
        return hasBotUpdated
    }
}