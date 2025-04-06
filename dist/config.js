import { pino } from 'pino';
import { isJidBroadcast, makeCacheableSignalKeyStore } from 'baileys';
import { BotController } from './controllers/bot.controller.js';
export default function configSocket(state, retryCache, version, messageCache) {
    const config = {
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        },
        version,
        msgRetryCounterCache: retryCache,
        defaultQueryTimeoutMs: undefined,
        syncFullHistory: false,
        logger: pino({ level: "silent" }),
        shouldIgnoreJid: jid => isJidBroadcast(jid) || (jid === null || jid === void 0 ? void 0 : jid.endsWith('@newsletter')),
        getMessage: async (key) => {
            const message = (key.id) ? new BotController().getMessageFromCache(key.id, messageCache) : undefined;
            return message;
        }
    };
    return config;
}
