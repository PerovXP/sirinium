const utils = require("./utils");

class Parser {
    constructor(domain, mainGrid) {
        this.url = domain;
        this.mainGridUrl = mainGrid ?? `${this.url}/livewire/message/main-grid`;
    }

    async getInitialData() {
        const response = await fetch(this.url, { credentials: "same-origin" });

        this.xsrfToken = await utils.getXsrfToken(response);
        this.sessionToken = await utils.getSessionToken(response);

        const body = await response.text();

        const initialData = await utils.parseInitialData(body);
        this.data = initialData;

        this.wireToken = await utils.getWireToken(body);

        await this.emulateResize(1920, 1080); // Redundant, but why not?

        return initialData;
    }

    async getGroupSchedule(group) {
        const data = await this.sendUpdates(
            [utils.getCallMethodUpdateObject("set", [group])]
        );

        return await utils.getArrayOfEvents(data);
    }

    async emulateResize(width, height) {
        const data = await this.sendUpdates([
            utils.getCallMethodUpdateObject("render"),
            utils.getCallMethodUpdateObject("$set", ["width", width]),
            utils.getCallMethodUpdateObject("$set", ["height", height]),
        ]);

        this.data.serverMemo.data.width = data.serverMemo.data.width;
        this.data.serverMemo.data.height = data.serverMemo.data.height;
        this.data.serverMemo.checksum = data.serverMemo.checksum;

        return true;
    }

    async changeWeek(step) {
        const method = step > 0 ? "addWeek" : "minusWeek";
        for (let i = 0; i < Math.abs(step); i++) {
            const data = await this.sendUpdates([utils.getCallMethodUpdateObject(method)]);

            Object.assign(this.data.serverMemo.data, data.serverMemo.data);

            this.data.serverMemo.checksum = data.serverMemo.checksum;
            this.data.serverMemo.htmlHash = data.serverMemo.htmlHash;
        }

        return true;
    }

    async sendUpdates(updates) {
        const data = await fetch(this.mainGridUrl, {
            method: "POST",
            credentials: "same-origin",
            headers: this.getHeaders(),
            body: JSON.stringify({
                ...this.getInitialBody(),
                updates: updates
            })
        });

        return await data.json();
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

module.exports = Parser;