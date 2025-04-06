import DataStore from "@seald-io/nedb";
const db = new DataStore({ filename: './storage/users.db', autoload: true });
export class UserService {
    async getUser(userId) {
        const user = await db.findOneAsync({ id: userId });
        return user;
    }
    async getUsers() {
        const users = await db.findAsync({});
        return users;
    }
    async registerUser(userId, name) {
        const isRegistered = await this.isUserRegistered(userId);
        if (isRegistered) {
            return;
        }
        const user = {
            id: userId,
            name,
            commands: 0,
            receivedWelcome: false,
            owner: false,
            admin: false
        };
        return db.insertAsync(user);
    }
    async isUserRegistered(userId) {
        const user = await this.getUser(userId);
        return (user != null);
    }
    setAdmin(userId, admin) {
        return db.updateAsync({ id: userId }, { $set: { admin } });
    }
    async getAdmins() {
        const admins = await db.findAsync({ admin: true });
        return admins;
    }
    setOwner(userId) {
        return db.updateAsync({ id: userId }, { $set: { owner: true, admin: true } });
    }
    async getOwner() {
        const owner = await db.findOneAsync({ owner: true });
        return owner;
    }
    setName(userId, name) {
        return db.updateAsync({ id: userId }, { $set: { name } });
    }
    setReceivedWelcome(userId, status = true) {
        return db.updateAsync({ id: userId }, { $set: { receivedWelcome: status } });
    }
    increaseUserCommandsCount(userId) {
        return db.updateAsync({ id: userId }, { $inc: { commands: 1 } });
    }
}
