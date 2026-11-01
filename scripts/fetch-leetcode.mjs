// Runs on GitHub Actions (Node 20). Asks LeetCode for your solved counts and writes stats.json.
import { writeFileSync } from 'node:fs';

const user = process.env.LEETCODE_USER;
if (!user) {
  console.error('LEETCODE_USER is not set.');
  process.exit(1);
}

const query = `
  query ($username: String!) {
    allQuestionsCount { difficulty count }
    matchedUser(username: $username) {
      submitStats { acSubmissionNum { difficulty count } }
    }
  }`;

const res = await fetch('https://leetcode.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Referer': 'https://leetcode.com',
    'User-Agent': 'Mozilla/5.0 (portfolio stats updater)'
  },
  body: JSON.stringify({ query, variables: { username: user } })
});

if (!res.ok) {
  console.error('LeetCode answered with HTTP ' + res.status + '. Keeping the old stats.json.');
  process.exit(1);
}

const json = await res.json();
const profile = json?.data?.matchedUser;
if (!profile) {
  console.error('No LeetCode user found for "' + user + '". Check the username.');
  process.exit(1);
}

const solved = Object.fromEntries(profile.submitStats.acSubmissionNum.map(x => [x.difficulty, x.count]));
const total = Object.fromEntries(json.data.allQuestionsCount.map(x => [x.difficulty, x.count]));

const out = {
  username: user,
  totalSolved: solved.All ?? 0,
  easySolved: solved.Easy ?? 0,
  mediumSolved: solved.Medium ?? 0,
  hardSolved: solved.Hard ?? 0,
  totalQuestions: total.All ?? 0,
  totalEasy: total.Easy ?? 0,
  totalMedium: total.Medium ?? 0,
  totalHard: total.Hard ?? 0
};

writeFileSync('stats.json', JSON.stringify(out, null, 2) + '\n');
console.log('Saved stats.json:', out);
