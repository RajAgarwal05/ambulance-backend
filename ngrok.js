const { spawn } = require("child_process");

const ngrok = spawn("ngrok", ["http", "4000", "--region=ap"], {
  stdio: "inherit",
  shell: false
});

ngrok.on("close", (code) => {
  console.log(`Ngrok stopped with code ${code}`);
});