const parser = require("./parser");

class Client {
    constructor(options = {}) {
        this.options = {
            domain: options.domain ?? "https://schedule.siriusuniversity.ru",
            mainGridUrl: options.mainGridUrl ?? undefined
        };

        this.parser = new parser(this.options.domain, this.options.mainGridUrl);
    }

    async getInitialData() {
        await this.parser.getInitialData().catch((e) => {
            throw new Error("Can't get inital data: " + e);
        });

        return true;
    }

    async getGroupSchedule(group) {
        return await this.parser.getGroupSchedule(group).catch((e) => {
            throw new Error("Can't get group schedule: " + e);
        });
    }

    async changeWeek(step) {
        if (!Number.isInteger(step) || step === 0) return;

        await this.parser.changeWeek(step).catch((e) => {
            throw new Error("Can't change week: " + e);
        });
    }
}

module.exports = Client;