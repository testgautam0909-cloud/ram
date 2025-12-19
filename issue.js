import jsonfile from 'jsonfile';
import moment from 'moment';
import random from 'random';
import simpleGit from 'simple-git';
import { execSync } from 'child_process';

const git = simpleGit();
const path = './data.json';
const NUMBER_OF_ISSUES = 1; // number of issues to create
const MAX_COMMITS_PER_ISSUE = 5; // random commits per issue

// Path to gh.exe for Windows
const GH = process.platform === 'win32'
  ? 'C:\\Program Files\\GitHub CLI\\gh.exe'
  : 'gh';

// Example technical words for randomness
const TECH_WORDS = [
  'Refactor', 'Optimize', 'Update', 'Fix', 'Add', 'Remove', 'Improve',
  'Handle', 'Implement', 'Integrate', 'Sync', 'Validate', 'Enhance'
];

const TECH_OBJECTS = [
  'authentication', 'API', 'database', 'UI', 'endpoint', 'cache',
  'scheduler', 'logger', 'middleware', 'validation', 'deployment'
];

// Generate random technical commit or issue message
const randomTechnicalMessage = (type = 'commit') => {
  const verb = TECH_WORDS[random.int(0, TECH_WORDS.length - 1)];
  const obj = TECH_OBJECTS[random.int(0, TECH_OBJECTS.length - 1)];
  const extra = type === 'commit' ? `for ${obj}` : `- related to ${obj}`;
  return `${verb} ${obj} ${extra}`;
};

// Create issue via GitHub CLI and return the issue number
const createIssue = (title, body) => {
  const output = execSync(
    `"${GH}" issue create --title "${title}" --body "${body}"`,
    { encoding: 'utf8', shell: true }
  );

  // Output will be the URL of the issue, e.g. https://github.com/user/repo/issues/123
  const issueNumber = parseInt(output.trim().split('/').pop(), 10);
  console.log(`📝 Created issue #${issueNumber}`);
  return issueNumber;
};

// Create commits for a given issue
const makeCommitsForIssue = async (issueNumber, commitsCount) => {
  for (let i = 0; i < commitsCount; i++) {
    const x = random.int(0, 54);
    const y = random.int(0, 6);
    const date = moment()
      .subtract(2, 'year')
      .add(x, 'week')
      .add(y, 'day')
      .format();

    const branch = `issue-${issueNumber}-commit-${i}-${Date.now()}`;
    const commitMessage = `${randomTechnicalMessage('commit')} (fixes #${issueNumber})`;

    // 1️⃣ create branch
    await git.checkoutLocalBranch(branch);

    // 2️⃣ write file
    await jsonfile.writeFile(path, { issueNumber, commitMessage, date });

    // 3️⃣ commit with backdated date
    const gitWithDate = simpleGit({
      env: {
        ...process.env,
        GIT_AUTHOR_DATE: date,
        GIT_COMMITTER_DATE: date,
      },
    });

    await gitWithDate.add([path]);
    await gitWithDate.commit(commitMessage, { '--date': date });

    // 4️⃣ push branch
    await git.push('origin', branch, { '--set-upstream': null });

    // 5️⃣ create PR
    execSync(`"${GH}" pr create --base main --head ${branch} --title "${commitMessage}" --body "Automated PR"`, {
      stdio: 'inherit',
      shell: true,
    });

    // 6️⃣ merge PR
    execSync(`"${GH}" pr merge ${branch} --merge --delete-branch --auto`, {
      stdio: 'inherit',
      shell: true,
    });


    console.log(`✅ Issue #${issueNumber}: Commit ${i + 1}/${commitsCount} merged`);

    // 7️⃣ back to main
    await git.checkout('main');
  }
};

const run = async () => {
  for (let i = 0; i < NUMBER_OF_ISSUES; i++) {
    const issueTitle = randomTechnicalMessage('issue');
    const issueBody = `Auto-generated issue: ${randomTechnicalMessage('issue')}`;

    // 1️⃣ create issue
    const issueNumber = createIssue(issueTitle, issueBody);

    // 2️⃣ generate random commits for this issue
    const commitsCount = random.int(1, MAX_COMMITS_PER_ISSUE);
    await makeCommitsForIssue(issueNumber, commitsCount);

    console.log(`🎯 Completed all commits for issue #${issueNumber}`);
  }
};

run();
