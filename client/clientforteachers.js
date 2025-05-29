const parser = require("./parser");

class Teacher {
    constructor(options = {}) {
        this.options = {
            domain: options.domain ?? "https://schedule.siriusuniversity.ru/teacher",
            url: "https://schedule.siriusuniversity.ru",
        };

        this.parser = new parser(this.options.domain, "https://schedule.siriusuniversity.ru/livewire/message/teachers.teacher-main-grid");

    }

    async getSchedule(teacher){
        
        return await this.parser.getTeacherSchedule(teacher).catch((e) =>{
            throw new Error(e);
        });
    }

    async getInitialData() {
        await this.parser.getInitialData().catch((e) => {
            throw new Error("Can't get inital data: " + e);
        });

        return true;
    }
    
    async changeWeek(step) {
        if (!Number.isInteger(step) || step === 0) return;

        await this.parser.changeWeek(step).catch((e) => {
            throw new Error("Can't change week: " + e);
        });
    }

}

module.exports = Teacher;