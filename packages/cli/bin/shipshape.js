#!/usr/bin/env node
'use strict';

/*
 * shipshape: CLI for the Shipshape Data public API.
 * Keyless, read-only. Try: npx shipshape-data readiness
 */

const readline = require('node:readline');
const { ShipshapeClient } = require('../lib/client.js');

const argv = process.argv.slice(2);
const flags = { json: false, base: undefined, category: undefined, limit: undefined };
const args = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--json') flags.json = true;
  else if (a === '--api') flags.base = argv[++i];
  else if (a === '--category') flags.category = argv[++i];
  else if (a === '--limit') flags.limit = argv[++i];
  else if (a === '--help' || a === '-h') args.unshift('help');
  else if (a === '--version' || a === '-v') args.unshift('version');
  else args.push(a);
}
const cmd = args.shift() || 'help';
const client = new ShipshapeClient({ base: flags.base });

const pink = (s) => (process.stdout.isTTY ? '\x1b[95m' + s + '\x1b[0m' : s);
const bold = (s) => (process.stdout.isTTY ? '\x1b[1m' + s + '\x1b[0m' : s);
const dim = (s) => (process.stdout.isTTY ? '\x1b[2m' + s + '\x1b[0m' : s);
const out = (data) => console.log(JSON.stringify(data, null, 2));

const HELP = `${bold('shipshape')} : the Shipshape Data CLI (keyless, read-only)

  shipshape services [slug]        the 13 services, or one
  shipshape industries             the 6 industry pages
  shipshape cases [slug]           the 3 case studies with real outcomes
  shipshape search <query>         search 169 guides on data and AI
                                   [--category <name>] [--limit <n>]
  shipshape categories             the seven resource categories
  shipshape ask <question>         ranked answers from the site's content
  shipshape readiness              take the 16-question AI readiness assessment
  shipshape score <a1,a2,...>      score answers directly (16 option indices 0-4,
                                   or 15 point values 1-5)
  shipshape contact                how to reach the team

  --json                           raw JSON output for scripts and agents
  --api <base>                     API base (default https://shipshapedata.com/api)

Docs: https://shipshapedata.com/developers/  Spec: https://shipshapedata.com/openapi.json
MCP:  https://shipshapedata.com/mcp and https://shipshapedata.com/mcp/docs`;

function printResult(r) {
  console.log('');
  console.log(bold('AI readiness: ' + r.score + '/100') + '  ' + pink(r.band.name));
  console.log('');
  for (const [key, p] of Object.entries(r.pillars)) {
    const bar = '#'.repeat(Math.round(p.average * 4)).padEnd(20, '.');
    console.log('  ' + p.title.padEnd(20) + ' [' + bar + '] ' + p.average.toFixed(2) + (key === r.weakestPillar ? pink('  <- weakest') : ''));
  }
  console.log('');
  for (const line of r.band.guidance) console.log('  ' + line + '\n');
  const weak = r.pillars[r.weakestPillar];
  if (weak && weak.advice) console.log('  ' + bold('Where to start: ') + weak.advice + '\n');
  console.log(dim('  Interactive version: https://shipshapedata.com/ai-readiness/  Talk to us: hello@shipshapedata.com'));
}

async function readiness() {
  const q = await client.readinessQuestions();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const askOne = (prompt) => new Promise((res) => rl.question(prompt, res));
  const answers = [];
  let n = 0;
  const total = q.sections.reduce((a, s) => a + s.questions.length, 0);
  console.log(bold('\nShipshape Data AI readiness assessment') + dim(' (' + total + ' questions, about three minutes)\n'));
  for (const section of q.sections) {
    console.log(pink('\n' + section.title) + dim('  ' + section.desc));
    for (const question of section.questions) {
      n++;
      console.log('\n' + bold(n + '. ' + question.q) + (question.scored ? '' : dim('  (context only, not scored)')));
      question.opts.forEach((o, i) => console.log('   ' + (i + 1) + ') ' + o));
      let pick;
      for (;;) {
        const raw = (await askOne('   your answer [1-' + question.opts.length + ']: ')).trim();
        pick = parseInt(raw, 10);
        if (pick >= 1 && pick <= question.opts.length) break;
        console.log(dim('   a number between 1 and ' + question.opts.length + ', please'));
      }
      answers.push(pick - 1);
    }
  }
  rl.close();
  const r = await client.scoreReadiness(answers);
  if (flags.json) return out(r);
  printResult(r);
}

(async () => {
  try {
    switch (cmd) {
      case 'help': console.log(HELP); break;
      case 'version': console.log(require('../package.json').version); break;
      case 'services': {
        const r = await client.services(args[0]);
        if (flags.json || args[0]) return out(r);
        for (const s of r.services) console.log(bold(s.slug.padEnd(28)) + ' ' + s.name + '\n' + ' '.repeat(29) + dim(s.url));
        break;
      }
      case 'industries': out(await client.industries()); break;
      case 'cases': out(await client.caseStudies(args[0])); break;
      case 'categories': out(await client.resourceCategories()); break;
      case 'search': {
        if (!args.length) { console.error('usage: shipshape search <query>'); process.exit(2); }
        const r = await client.searchResources(args.join(' '), { category: flags.category, limit: flags.limit || 5 });
        if (flags.json) return out(r);
        if (!r.results.length) return console.log('No matches. Try broader terms, or: shipshape categories');
        for (const hit of r.results) {
          console.log(bold(hit.title) + dim('  [' + hit.category + ']'));
          console.log('  ' + hit.description);
          console.log('  ' + pink(hit.url) + dim('  (markdown: ' + hit.url + 'index.md)') + '\n');
        }
        break;
      }
      case 'ask': {
        if (!args.length) { console.error('usage: shipshape ask <question>'); process.exit(2); }
        const r = await client.ask(args.join(' '));
        if (flags.json) return out(r);
        for (const hit of r.results) console.log(bold(hit.name) + '\n  ' + hit.description.split(' Answers:')[0] + '\n  ' + pink(hit.url) + '\n');
        break;
      }
      case 'readiness': await readiness(); break;
      case 'score': {
        if (!args[0]) { console.error('usage: shipshape score 3,2,1,3,2,3,2,3,3,2,2,3,3,3,4,3'); process.exit(2); }
        const answers = args[0].split(',').map((x) => parseInt(x.trim(), 10));
        const r = await client.scoreReadiness(answers);
        if (flags.json) return out(r);
        printResult(r);
        break;
      }
      case 'contact': out(await client.contact()); break;
      default:
        console.error('Unknown command: ' + cmd + '\n');
        console.log(HELP);
        process.exit(2);
    }
  } catch (err) {
    console.error(err.message || String(err));
    process.exit(1);
  }
})();
