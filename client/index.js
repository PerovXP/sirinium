const utils = require("./utils");

class Client {
    constructor(url = "https://schedule.siriusuniversity.ru") {
        this.url = url;
        this.mainGridUrl = `${this.url}/livewire/message/main-grid`;
    }

    async getInitialData() {
        const response = await fetch(this.url, { credentials: "same-origin" });

        this.xsrfToken = await utils.getXsrfToken(response).catch((e) => {
            return new Error(`Can't get xsrf token: ${e.message}`);
        });
        this.sessionToken = await utils.getSessionToken(response).catch((e) => {
            return new Error(`Can't get session token: ${e.message}`);
        });

        const body = await response.text();

        const initialData = await utils.parseInitialData(body).catch((e) => {
            return new Error(`Can't parse initial data: ${e.message}`);
        });
        this.data = initialData;

        this.wireToken = await utils.getWireToken(body).catch((e) => {
            return new Error(`Can't get wire token: ${e.message}`);
        });

        await this.emulateResize(1920, 1080); // Redundant, but why not?

        return initialData;
    }

    async getGroupSchedule(num) {
        const data = await this.sendUpdates(
            [utils.getCallMethodUpdateObject("set", [num])]
        );

        return await utils.getArrayOfEvents(data).catch((e) => {
            return new Error(`Can't get array of events: ${e.message}`);
        });
    }

    async emulateResize(width, height) {
        const data = await this.sendUpdates([
            utils.getCallMethodUpdateObject("render"),
            utils.getCallMethodUpdateObject("$set", ["width", width]),
            utils.getCallMethodUpdateObject("$set", ["height", height]),
        ]).catch((e) => {
            return new Error(`Can't send updates: ${e.message}`);
        });

        this.data.serverMemo.data.width = data.serverMemo.data.width;
        this.data.serverMemo.data.height = data.serverMemo.data.height;
        this.data.serverMemo.checksum = data.serverMemo.checksum;

        return data;
    }

    async changeWeek(action) {
        const data = await this.sendUpdates([
            utils.getCallMethodUpdateObject(action === "add" ? "addWeek" : "minusWeek")
        ], true).catch((e) => {
            return new Error(`Can't send updates: ${e.message}`)
        });

        Object.assign(this.data.serverMemo.data, data.serverMemo.data);

        this.data.serverMemo.checksum = data.serverMemo.checksum;
        this.data.serverMemo.htmlHash = data.serverMemo.htmlHash;

        return data;
    }

    async sendUpdates(updates) {
        const request = await fetch(this.mainGridUrl, {
            method: "POST",
            credentials: "same-origin",
            headers: this.getHeaders(),
            body: JSON.stringify({
                ...this.getInitialBody(),
                updates: updates
            })
        });

        return await request.json();
    }

    getInitialBody() {
        return {
            fingerprint: this.data["fingerprint"],
            serverMemo: this.data["serverMemo"]
        };
    }

    getHeaders() {
        return {
            "Cookie": `XSRF-TOKEN=${this.xsrfToken};raspisanie_universitet_sirius_session=${this.sessionToken}`,

            "X-Livewire": "true",
            "X-Csrf-Token": this.wireToken ?? "",

            "Content-Type": "application/json"
        }
    }
}

module.exports = Client;