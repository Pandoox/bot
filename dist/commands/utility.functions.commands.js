import { downloadMediaMessage } from "baileys";
import { buildText, messageErrorCommandUsage } from "../utils/general.util.js";
import { waLib, imageLib, audioLib, utilityLib, aiLib, convertLib } from "../libraries/library.js";
import { commandsUtility } from "./utility.list.commands.js";
export async function iaCommand(client, botInfo, message, group) {
    const utilityCommands = commandsUtility(botInfo);
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    const aiResponse = await aiLib.questionAI(message.text_command);
    if (!aiResponse) {
        throw new Error(utilityCommands.ia.msgs.error_not_found);
    }
    const replyText = buildText(utilityCommands.ia.msgs.reply, aiResponse);
    await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function criarimgCommand(client, botInfo, message, group) {
    const utilityCommands = commandsUtility(botInfo);
    if (!message.args.length)
        throw new Error(messageErrorCommandUsage(botInfo, message));
    const waitText = utilityCommands.criarimg.msgs.wait;
    await waLib.replyText(client, message.chat_id, waitText, message.wa_message, { expiration: message.expiration });
    const aiResponse = await aiLib.imageAI(message.text_command);
    if (!aiResponse) {
        throw new Error(utilityCommands.criarimg.msgs.error_not_found);
    }
    await waLib.replyFileFromUrl(client, message.chat_id, 'imageMessage', aiResponse, '', message.wa_message, { expiration: message.expiration });
}
export async function steamverdeCommand(client, botInfo, message, group) {
    const utilityCommands = commandsUtility(botInfo);
    const LIMIT_RESULTS = 20;
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    let gamesList = await utilityLib.searchGame(message.text_command.trim());
    if (!gamesList.length) {
        throw new Error(utilityCommands.steamverde.msgs.error_not_found);
    }
    gamesList = gamesList.length > LIMIT_RESULTS ? gamesList.splice(0, LIMIT_RESULTS) : gamesList;
    let replyText = utilityCommands.steamverde.msgs.reply_title;
    gamesList.forEach((game) => {
        let gamesUrl = game.uris.map((uri) => {
            if (uri.includes('magnet')) {
                return buildText(utilityCommands.steamverde.msgs.link_torrent, uri.split("&dn")[0]);
            }
            else {
                return buildText(utilityCommands.steamverde.msgs.link_direct, uri);
            }
        });
        replyText += buildText(utilityCommands.steamverde.msgs.reply_item, game.title, game.uploader, game.uploadDate, gamesUrl.join(""), game.fileSize.replace('\n', ''));
    });
    await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function animesCommand(client, botInfo, message, group) {
    const utilityCommands = commandsUtility(botInfo);
    const animes = await utilityLib.animeReleases();
    let replyText = utilityCommands.animes.msgs.reply_title;
    animes.forEach((anime) => {
        replyText += buildText(utilityCommands.animes.msgs.reply_item, anime.name.trim(), anime.episode, anime.url);
    });
    await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function mangasCommand(client, botInfo, message, group) {
    const utilityCommands = commandsUtility(botInfo);
    const mangas = await utilityLib.mangaReleases();
    let replyText = utilityCommands.mangas.msgs.reply_title;
    mangas.forEach((manga) => {
        replyText += buildText(utilityCommands.mangas.msgs.reply_item, manga.name.trim(), manga.chapter, manga.url);
    });
    await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function brasileiraoCommand(client, botInfo, message, group) {
    const utilityCommands = commandsUtility(botInfo);
    let seriesSupported = ['A', 'B'];
    let serieSelected;
    if (!message.args.length) {
        serieSelected = 'A';
    }
    else {
        if (!seriesSupported.includes(message.text_command.toUpperCase())) {
            throw new Error(messageErrorCommandUsage(botInfo, message));
        }
        serieSelected = message.text_command.toUpperCase();
    }
    const { tabela: table, rodadas: rounds } = await utilityLib.brasileiraoTable(serieSelected);
    if (!rounds) {
        throw new Error(utilityCommands.brasileirao.msgs.error_rounds_not_found);
    }
    const [round] = rounds.filter(round => round.rodada_atual === true);
    const { partidas: matches } = round;
    let replyText = buildText(utilityCommands.brasileirao.msgs.reply_title, serieSelected);
    replyText += utilityCommands.brasileirao.msgs.reply_table_title;
    table.forEach(team => {
        replyText += buildText(utilityCommands.brasileirao.msgs.reply_table_item, team.posicao, team.nome, team.pontos, team.jogos, team.vitorias);
    });
    replyText += "\n" + utilityCommands.brasileirao.msgs.reply_round_title;
    matches.forEach(match => {
        replyText += buildText(utilityCommands.brasileirao.msgs.reply_match_item, match.time_casa, match.time_fora, match.data, match.local, match.gols_casa ? match.resultado_texto : '---');
    });
    await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function encurtarCommand(client, botInfo, message, group) {
    const utilityCommands = commandsUtility(botInfo);
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    const url = await utilityLib.shortenUrl(message.text_command);
    if (!url) {
        throw new Error(utilityCommands.encurtar.msgs.error);
    }
    await waLib.replyText(client, message.chat_id, buildText(utilityCommands.encurtar.msgs.reply, url), message.wa_message, { expiration: message.expiration });
}
export async function upimgCommand(client, botInfo, message, group) {
    var _a, _b;
    const utilityCommands = commandsUtility(botInfo);
    if (((_a = message.quotedMessage) === null || _a === void 0 ? void 0 : _a.type) !== 'imageMessage' && message.type !== 'imageMessage') {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    let imageBuffer;
    if (message.isQuoted && ((_b = message.quotedMessage) === null || _b === void 0 ? void 0 : _b.wa_message)) {
        imageBuffer = await downloadMediaMessage(message.quotedMessage.wa_message, 'buffer', {});
    }
    else {
        imageBuffer = await downloadMediaMessage(message.wa_message, 'buffer', {});
    }
    let imageUrl = await imageLib.uploadImage(imageBuffer);
    await waLib.replyText(client, message.chat_id, buildText(utilityCommands.upimg.msgs.reply, imageUrl), message.wa_message, { expiration: message.expiration });
}
export async function filmesCommand(client, botInfo, message, group) {
    const utilityCommands = commandsUtility(botInfo);
    let movieTrendings = await utilityLib.moviedbTrendings("movie");
    await waLib.replyText(client, message.chat_id, buildText(utilityCommands.filmes.msgs.reply, movieTrendings), message.wa_message, { expiration: message.expiration });
}
export async function seriesCommand(client, botInfo, message, group) {
    const utilityCommands = commandsUtility(botInfo);
    let movieTrendings = await utilityLib.moviedbTrendings("tv");
    await waLib.replyText(client, message.chat_id, buildText(utilityCommands.series.msgs.reply, movieTrendings), message.wa_message, { expiration: message.expiration });
}
export async function rbgCommand(client, botInfo, message, group) {
    var _a, _b;
    const utilityCommands = commandsUtility(botInfo);
    if (!message.isMedia && !message.isQuoted) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    let messageData = {
        type: (message.isMedia) ? message.type : (_a = message.quotedMessage) === null || _a === void 0 ? void 0 : _a.type,
        wa_message: (message.isQuoted) ? (_b = message.quotedMessage) === null || _b === void 0 ? void 0 : _b.wa_message : message.wa_message
    };
    if (!messageData.type || !messageData.wa_message) {
        throw new Error(utilityCommands.rbg.msgs.error_message);
    }
    else if (messageData.type != "imageMessage") {
        throw new Error(utilityCommands.rbg.msgs.error_only_image);
    }
    await waLib.replyText(client, message.chat_id, utilityCommands.rbg.msgs.wait, message.wa_message, { expiration: message.expiration });
    let imageBuffer = await downloadMediaMessage(messageData.wa_message, "buffer", {});
    let replyImageBuffer = await imageLib.removeBackground(imageBuffer);
    await waLib.replyFileFromBuffer(client, message.chat_id, 'imageMessage', replyImageBuffer, '', message.wa_message, { expiration: message.expiration });
}
export async function tabelaCommand(client, botInfo, message, group) {
    const utilityCommands = commandsUtility(botInfo);
    const replyText = await utilityLib.symbolsASCI();
    await waLib.replyText(client, message.chat_id, buildText(utilityCommands.tabela.msgs.reply, replyText), message.wa_message, { expiration: message.expiration });
}
export async function letraCommand(client, botInfo, message, group) {
    const utilityCommands = commandsUtility(botInfo);
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    const musicLyrics = await utilityLib.musicLyrics(message.text_command);
    if (!musicLyrics) {
        throw new Error(utilityCommands.letra.msgs.error_not_found);
    }
    const replyText = buildText(utilityCommands.letra.msgs.reply, musicLyrics.title, musicLyrics.artist, musicLyrics.lyrics);
    await waLib.replyFile(client, message.chat_id, 'imageMessage', musicLyrics.image, replyText, message.wa_message, { expiration: message.expiration });
}
export async function ouvirCommand(client, botInfo, message, group) {
    var _a, _b, _c, _d, _e;
    const utilityCommands = commandsUtility(botInfo);
    if (!message.isQuoted || ((_a = message.quotedMessage) === null || _a === void 0 ? void 0 : _a.type) != 'audioMessage') {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    else if (((_c = (_b = message.quotedMessage) === null || _b === void 0 ? void 0 : _b.media) === null || _c === void 0 ? void 0 : _c.seconds) && ((_e = (_d = message.quotedMessage) === null || _d === void 0 ? void 0 : _d.media) === null || _e === void 0 ? void 0 : _e.seconds) > 90) {
        throw new Error(utilityCommands.ouvir.msgs.error_audio_limit);
    }
    let audioBuffer = await downloadMediaMessage(message.quotedMessage.wa_message, "buffer", {});
    let replyText = await audioLib.audioTranscription(audioBuffer);
    await waLib.replyText(client, message.chat_id, buildText(utilityCommands.ouvir.msgs.reply, replyText), message.quotedMessage.wa_message, { expiration: message.expiration });
}
export async function audioCommand(client, botInfo, message, group) {
    var _a;
    const supportedEffects = ['estourar', 'x2', 'reverso', 'grave', 'agudo', 'volume'];
    if (!message.args.length || !supportedEffects.includes(message.text_command.trim().toLowerCase()) || !message.isQuoted || ((_a = message.quotedMessage) === null || _a === void 0 ? void 0 : _a.type) != "audioMessage") {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    const effectSelected = message.text_command.trim().toLowerCase();
    const audioBuffer = await downloadMediaMessage(message.quotedMessage.wa_message, "buffer", {});
    const replyAudioBuffer = await audioLib.audioModified(audioBuffer, effectSelected);
    await waLib.replyFileFromBuffer(client, message.chat_id, 'audioMessage', replyAudioBuffer, '', message.wa_message, { expiration: message.expiration, mimetype: 'audio/mpeg' });
}
export async function traduzCommand(client, botInfo, message, group) {
    var _a, _b;
    const utilityCommands = commandsUtility(botInfo);
    const languageSupported = ["pt", "es", "en", "ja", "it", "ru", "ko"];
    let languageTranslation;
    let textTranslation;
    if (message.isQuoted && (((_a = message.quotedMessage) === null || _a === void 0 ? void 0 : _a.type) == 'conversation' || ((_b = message.quotedMessage) === null || _b === void 0 ? void 0 : _b.type) == 'extendedTextMessage')) {
        if (!message.args.length) {
            throw new Error(messageErrorCommandUsage(botInfo, message));
        }
        languageTranslation = message.args[0];
        textTranslation = message.quotedMessage.body || message.quotedMessage.caption;
    }
    else if (!message.isQuoted && (message.type == 'conversation' || message.type == 'extendedTextMessage')) {
        if (message.args.length < 2) {
            throw new Error(messageErrorCommandUsage(botInfo, message));
        }
        [languageTranslation, ...textTranslation] = message.args;
        textTranslation = textTranslation.join(" ");
    }
    else {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    if (!languageSupported.includes(languageTranslation)) {
        throw new Error(utilityCommands.traduz.msgs.error);
    }
    const replyTranslation = await utilityLib.translationGoogle(textTranslation, languageTranslation);
    const replyText = buildText(utilityCommands.traduz.msgs.reply, textTranslation, replyTranslation);
    await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function vozCommand(client, botInfo, message, group) {
    var _a, _b;
    const utilityCommands = commandsUtility(botInfo);
    const languageSupported = ["pt", 'en', 'ja', 'es', 'it', 'ru', 'ko', 'sv'];
    let languageVoice;
    let textVoice;
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    else if (message.isQuoted && (((_a = message.quotedMessage) === null || _a === void 0 ? void 0 : _a.type) == 'extendedTextMessage' || ((_b = message.quotedMessage) === null || _b === void 0 ? void 0 : _b.type) == 'conversation')) {
        languageVoice = message.args[0];
        textVoice = message.quotedMessage.body || message.quotedMessage.caption;
    }
    else {
        [languageVoice, ...textVoice] = message.args;
        textVoice = textVoice.join(" ");
    }
    if (!languageSupported.includes(languageVoice)) {
        throw new Error(utilityCommands.voz.msgs.error_not_supported);
    }
    else if (!textVoice) {
        throw new Error(utilityCommands.voz.msgs.error_text);
    }
    else if (textVoice.length > 500) {
        throw new Error(utilityCommands.voz.msgs.error_text_long);
    }
    const replyAudioBuffer = await audioLib.textToVoice(languageVoice, textVoice);
    await waLib.replyFileFromBuffer(client, message.chat_id, 'audioMessage', replyAudioBuffer, '', message.wa_message, { expiration: message.expiration, mimetype: 'audio/mpeg' });
}
export async function noticiasCommand(client, botInfo, message, group) {
    const utilityCommands = commandsUtility(botInfo);
    const newsList = await utilityLib.newsGoogle();
    let replyText = utilityCommands.noticias.msgs.reply_title;
    for (let news of newsList) {
        replyText += buildText(utilityCommands.noticias.msgs.reply_item, news.title, news.author, news.published, news.url);
    }
    await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function calcCommand(client, botInfo, message, group) {
    const utilityCommands = commandsUtility(botInfo);
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    const calcResult = await utilityLib.calcExpression(message.text_command);
    if (!calcResult) {
        throw new Error(utilityCommands.calc.msgs.error_invalid_result);
    }
    const replyText = buildText(utilityCommands.calc.msgs.reply, calcResult);
    await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function pesquisaCommand(client, botInfo, message, group) {
    const utilityCommands = commandsUtility(botInfo);
    if (!message.args.length)
        throw new Error(messageErrorCommandUsage(botInfo, message));
    let webSearchList = await utilityLib.webSearchGoogle(message.text_command);
    let replyText = buildText(utilityCommands.pesquisa.msgs.reply_title, message.text_command);
    if (!webSearchList.length) {
        throw new Error(utilityCommands.pesquisa.msgs.error_not_found);
    }
    for (let search of webSearchList) {
        replyText += buildText(utilityCommands.pesquisa.msgs.reply_item, search.title, search.url);
    }
    await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function moedaCommand(client, botInfo, message, group) {
    const utilityCommands = commandsUtility(botInfo);
    const supportedCurrencies = ["dolar", "iene", "euro", "real"];
    if (message.args.length != 2) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    let [currencySelected, valueSelected] = message.args;
    if (!supportedCurrencies.includes(currencySelected)) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    else if (isNaN(parseInt(valueSelected))) {
        throw new Error(utilityCommands.moeda.msgs.error_invalid_value);
    }
    let convertData = await utilityLib.convertCurrency(currencySelected, parseInt(valueSelected));
    let replyText = buildText(utilityCommands.moeda.msgs.reply_title, convertData.currency, convertData.value);
    for (let convert of convertData.convertion) {
        replyText += buildText(utilityCommands.moeda.msgs.reply_item, convert.convertion_name, convert.value_converted_formatted, convert.currency, convert.updated);
    }
    await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function climaCommand(client, botInfo, message, group) {
    const utilityCommands = commandsUtility(botInfo);
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    let wheatherResult = await utilityLib.wheatherInfo(message.text_command);
    let replyText = buildText(utilityCommands.clima.msgs.reply, message.text_command, wheatherResult.location.name, wheatherResult.location.region, wheatherResult.location.country, wheatherResult.location.current_time, wheatherResult.current.temp, wheatherResult.current.feelslike, wheatherResult.current.condition, wheatherResult.current.wind, wheatherResult.current.humidity, wheatherResult.current.cloud);
    wheatherResult.forecast.forEach((forecast) => {
        replyText += buildText(utilityCommands.clima.msgs.reply_forecast, forecast.day, forecast.max, forecast.min, forecast.condition, forecast.max_wind, forecast.chance_rain, forecast.chance_snow, forecast.uv);
    });
    await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function dddCommand(client, botInfo, message, group) {
    var _a, _b;
    const utilityCommands = commandsUtility(botInfo);
    let dddSelected;
    if (message.isQuoted) {
        let internationalCode = (_a = message.quotedMessage) === null || _a === void 0 ? void 0 : _a.sender.slice(0, 2);
        if (internationalCode != "55") {
            throw new Error(utilityCommands.ddd.msgs.error);
        }
        dddSelected = (_b = message.quotedMessage) === null || _b === void 0 ? void 0 : _b.sender.slice(2, 4);
    }
    else if (message.args.length) {
        dddSelected = message.text_command;
    }
    if (!dddSelected) {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    let dddResult = await utilityLib.infoDDD(dddSelected);
    if (!dddResult) {
        throw new Error(utilityCommands.ddd.msgs.error_not_found);
    }
    const replyText = buildText(utilityCommands.ddd.msgs.reply, dddResult.state, dddResult.region);
    await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function qualmusicaCommand(client, botInfo, message, group) {
    var _a, _b;
    const utilityCommands = commandsUtility(botInfo);
    const messageType = message.isQuoted ? (_a = message.quotedMessage) === null || _a === void 0 ? void 0 : _a.type : message.type;
    if (messageType != "videoMessage" && messageType != "audioMessage") {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    const messageData = message.isQuoted ? (_b = message.quotedMessage) === null || _b === void 0 ? void 0 : _b.wa_message : message.wa_message;
    if (!messageData) {
        throw new Error(utilityCommands.qualmusica.msgs.error_message);
    }
    const messageMediaBuffer = await downloadMediaMessage(messageData, "buffer", {});
    await waLib.replyText(client, message.chat_id, utilityCommands.qualmusica.msgs.wait, message.wa_message, { expiration: message.expiration });
    const musicResult = await audioLib.musicRecognition(messageMediaBuffer);
    if (!musicResult) {
        throw new Error(utilityCommands.qualmusica.msgs.error_not_found);
    }
    const replyText = buildText(utilityCommands.qualmusica.msgs.reply, musicResult.title, musicResult.producer, musicResult.duration, musicResult.release_date, musicResult.album, musicResult.artists);
    await waLib.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function qualanimeCommand(client, botInfo, message, group) {
    var _a, _b;
    const utilityCommands = commandsUtility(botInfo);
    const messageData = {
        type: (message.isQuoted) ? (_a = message.quotedMessage) === null || _a === void 0 ? void 0 : _a.type : message.type,
        message: (message.isQuoted) ? (_b = message.quotedMessage) === null || _b === void 0 ? void 0 : _b.wa_message : message.wa_message
    };
    if (messageData.type != "imageMessage") {
        throw new Error(messageErrorCommandUsage(botInfo, message));
    }
    else if (!messageData.message) {
        throw new Error(utilityCommands.qualanime.msgs.error_message);
    }
    await waLib.replyText(client, message.chat_id, utilityCommands.qualanime.msgs.wait, message.wa_message, { expiration: message.expiration });
    const imageBuffer = await downloadMediaMessage(messageData.message, "buffer", {});
    const animeInfo = await imageLib.animeRecognition(imageBuffer);
    if (!animeInfo) {
        throw new Error(utilityCommands.qualanime.msgs.error_not_found);
    }
    else if (animeInfo.similarity < 87) {
        throw new Error(utilityCommands.qualanime.msgs.error_similarity);
    }
    const videoBuffer = await convertLib.convertVideoToWhatsApp('url', animeInfo.preview_url);
    const replyText = buildText(utilityCommands.qualanime.msgs.reply, animeInfo.title, animeInfo.episode || "---", animeInfo.initial_time, animeInfo.final_time, animeInfo.similarity, animeInfo.preview_url);
    await waLib.replyFileFromBuffer(client, message.chat_id, 'videoMessage', videoBuffer, replyText, message.wa_message, { expiration: message.expiration, mimetype: 'video/mp4' });
}
