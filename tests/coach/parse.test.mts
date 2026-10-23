// Coach reply parsing tests. Run with: npm run test:coach
// The model does not always format its reply the way the prompt asks; practice
// questions it wrote must still reach the practice panel.
import { parseAskReply } from '../../server/claude';

const q = (n: number) => ({
  topic: 'Kinematics',
  prompt: `A car speeds up from rest at $2\\,\\mathrm{m/s^2}$ for ${n} s. How far does it go?`,
  choices: ['4 m', '8 m', '16 m', '32 m'],
  answerIndex: 1,
  answer: '8 m',
  explanation: 'Use $x=\\frac{1}{2}at^2$.',
});
const qjson = (k: number) => JSON.stringify({ questions: Array.from({ length: k }, (_, i) => q(i + 1)) }, null, 1);
const summary = JSON.stringify({ keyIdea: 'Constant acceleration', formulas: ['$x=\\frac12 at^2$'], traps: [], nextQuestions: [], topicId: '' });
const reply = 'I made 3 questions on uniformly accelerated motion.';

const cases: [string, string, number][] = [
  ['as asked: summary then questions', `${reply}\n###SUMMARY###\n${summary}\n###QUESTIONS###\n${qjson(3)}`, 3],
  ['questions before summary', `${reply}\n###QUESTIONS###\n${qjson(3)}\n###SUMMARY###\n${summary}`, 3],
  ['decorated markers', `${reply}\n**### SUMMARY ###**\n${summary}\n\`###QUESTIONS###\`\n\`\`\`json\n${qjson(3)}\n\`\`\``, 3],
  ['questions inside the summary JSON', `${reply}\n###SUMMARY###\n${JSON.stringify({ ...JSON.parse(summary), questions: [q(1), q(2), q(3)] })}`, 3],
  ['no marker, JSON in the reply', `${reply}\n\n\`\`\`json\n${qjson(3)}\n\`\`\`\n###SUMMARY###\n${summary}`, 3],
  ['cut off in the third question', `${reply}\n###SUMMARY###\n${summary}\n###QUESTIONS###\n${qjson(3).slice(0, qjson(3).lastIndexOf('"answer"'))}`, 2],
  ['raw newlines inside strings', `${reply}\n###SUMMARY###\n${summary}\n###QUESTIONS###\n${qjson(3).replace(/\\n/g, '\n')}`, 3],
  ['ordinary answer, no questions', `Velocity is the rate of change of position.\n###SUMMARY###\n${summary}`, 0],
];

let failed = 0;
for (const [name, raw, want] of cases) {
  const r = parseAskReply(raw, 'physics', 'en');
  const problems: string[] = [];
  if (r.questions.length !== want) problems.push(`expected ${want} questions, got ${r.questions.length}`);
  if (want && r.questions.some((x) => !x.prompt || x.choices?.length !== 4)) problems.push('question content lost');
  if (/"questions"|###/.test(r.text)) problems.push(`JSON or markers shown to the student: ${JSON.stringify(r.text.slice(0, 80))}`);
  if (!r.text.trim()) problems.push('reply text empty');
  if (!r.summary) problems.push('summary lost');
  if (problems.length) {
    failed++;
    console.log(`FAIL ${name}\n     ${problems.join('\n     ')}`);
  } else console.log(`PASS ${name}`);
}
console.log(failed ? `\n${failed} coach parsing case(s) FAILED.` : `\nAll ${cases.length} coach parsing cases passed.`);
process.exit(failed ? 1 : 0);
