// healthcheck – fragt eine URL ab, bis sie mit 2xx antwortet
const fs = require('node:fs');

const url = process.env.INPUT_URL;
const versuche = Number(process.env.INPUT_VERSUCHE || '10');

async function main() {
  for (let i = 1; i <= versuche; i++) {
    try {
      const res = await fetch(url);
      const text = (await res.text()).trim();
      console.log(`Versuch ${i}: ${res.status} ${text}`);
      if (res.ok) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `antwort=${text}\n`);
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${url} antwortet: ${text}\n`);
        return;
      }
    } catch (err) {
      console.log(`Versuch ${i}: ${err.cause?.code || err.message}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.log(`::error title=healthcheck::${url} antwortet nicht nach ${versuche} Versuchen`);
  process.exitCode = 1;
}

main();
