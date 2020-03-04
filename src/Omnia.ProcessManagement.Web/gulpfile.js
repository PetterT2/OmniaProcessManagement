// trigger ts
require("ts-node").register({
    transpileOnly: true,
    typeCheck: false,
    files: false
});

require("@omnia/tooling").init();
require("./client/packages/task");
