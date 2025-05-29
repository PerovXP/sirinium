module.exports = {
    getCallMethodUpdateObject: (method, params = []) => {
        return {
            type: "callMethod",
            payload: {
                id: (Math.random() + 1).toString(36).substring(8),
                method: method,
                params: params
            }
        }
    },

    getXsrfToken: async (response) => {
        const cookies = response.headers.getSetCookie();

        return cookies[0].match(/XSRF-TOKEN=([0-9a-zA-Z%]+);/)[1];
    },

    getSessionToken: async (response) => {
        const cookies = response.headers.getSetCookie();

        return cookies[1].match(/raspisanie_universitet_sirius_session=([0-9a-zA-Z%]+);/)[1];
    },

    getWireToken: async (body) => {
        const wireTokenRegex = body.match(/window.livewire_token = '([0-9A-Za-z]+)';/);

        return wireTokenRegex[1];
    },

    parseInitialData: async (body) => {
        console.log('Ответ сервера:', body);

        const initialDataAttribute = body.match(/wire:initial-data="(.+)"/);
        const initialDataRawString = initialDataAttribute[1].replaceAll("&quot;", "\"");

        return JSON.parse(initialDataRawString);
    },

    getArrayOfEvents: async (data) => {
        return data.serverMemo.data.events ? Object.values(data.serverMemo.data.events).flat() : [];
    }
};