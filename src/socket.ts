import {
  makeWASocket,
  useSingleFileAuthState,
  fetchLatestBaileysVersion,
  WASocket,
  makeCacheableSignalKeyStore,
  useMobileSocket,
  DisconnectReason
} from 'baileys'

import * as fs from 'fs'
import NodeCache from 'node-cache'
import configSocket from './config.js'
import { BotController } from './controllers/bot.controller.js'
import { connectionClose, connectionOpen } from './events/connection.event.js'
import { messageReceived } from './events/message-received.event.js'
import { addedOnGroup } from './events/group-added.event.js'
import { groupParticipantsUpdated } from './events/group-participants-updated.event.js'
import { partialGroupUpdate } from './events/group-partial-update.event.js'
import { syncGroupsOnStart } from './helpers/groups.sync.helper.js'
import { executeEventQueue, queueEvent } from './helpers/events.queue.helper.js'

// Caches
const retryCache = new NodeCache()
const eventsCache = new NodeCache()
const messagesCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })

export default async function connect() {
  const authFile = './session_auth_info.json'
  const { state, saveCreds } = useSingleFileAuthState(authFile)
  const { version } = await fetchLatestBaileysVersion()

  const client: WASocket = makeWASocket({
    version,
    printQRInTerminal: false, // desativa QR
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, fs),
    },
    mobile: true, // necessário para pareamento
    browser: ['Chrome (Linux)', 'Chrome', '106.0.0.0'], // browser fake
  })

  let isBotReady = false
  eventsCache.set("events", [])

  // Evento de atualização de credenciais (salvar quando conectar)
  client.ev.on('creds.update', saveCreds)

  // Evento de pareamento
  if (!state.creds?.registered) {
    console.log("Conectando via pareamento com número...")

    const code = await client.requestPairingCode("5581999995382")
    console.log(`📱 Vá no WhatsApp > Dispositivos Conectados > e digite esse código:\n\n👉 ${code}\n`)
  }

  // Processa eventos
  client.ev.process(async (events) => {
    const botInfo = new BotController().getBot()

    if (events['connection.update']) {
      const connectionState = events['connection.update']
      const { connection, lastDisconnect } = connectionState

      if (connection === 'open') {
        connectionOpen(client)
        isBotReady = await syncGroupsOnStart(client)
        await executeEventQueue(client, eventsCache)
      }

      if (connection === 'close') {
        const shouldReconnect = connectionClose(connectionState)
        if (shouldReconnect) connect()
      }
    }

    if (events['messages.upsert']) {
      const message = events['messages.upsert']
      if (isBotReady) await messageReceived(client, message, botInfo, messagesCache)
      else queueEvent(eventsCache, "messages.upsert", message)
    }

    if (events['group-participants.update']) {
      const participantsUpdate = events['group-participants.update']
      if (isBotReady) await groupParticipantsUpdated(client, participantsUpdate, botInfo)
      else queueEvent(eventsCache, "group-participants.update", participantsUpdate)
    }

    if (events['groups.upsert']) {
      const groups = events['groups.upsert']
      if (isBotReady) await addedOnGroup(client, groups, botInfo)
      else queueEvent(eventsCache, "groups.upsert", groups)
    }

    if (events['groups.update']) {
      const groups = events['groups.update']
      if (groups.length === 1 && groups[0].participants === undefined) {
        if (isBotReady) await partialGroupUpdate(groups[0])
        else queueEvent(eventsCache, "groups.update", groups)
      }
    }
  })
}
