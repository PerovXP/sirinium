![Sirinium](https://i.imgur.com/Z2vcIbf.png)
## Usage
```javascript
const sirinium = require("sirinium");

const client = new sirinium.Client();
await client.getInitialData(); // Required

const schedule = await client.getGroupSchedule("К0609-24");
```
## How it works
Module emulates user interactions with schedule. Written using reverse engineering tricks.
## License
MIT Licensed