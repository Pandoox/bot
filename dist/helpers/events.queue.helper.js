export async function executeEventQueue(client, eventsCache) {
    const eventsQueue = eventsCache.get("events");
    for (let ev of eventsQueue) {
        client.ev.emit(ev.event, ev.data);
    }
    eventsCache.set("events", []);
}
export async function queueEvent(eventsCache, eventName, eventData) {
    let queueArray = eventsCache.get("events");
    queueArray.push({ event: eventName, data: eventData });
    eventsCache.set("events", queueArray);
}
