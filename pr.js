import jsonfile from 'jsonfile';
import moment from 'moment';
import random from 'random';
import simpleGit from 'simple-git';
import { execSync } from 'child_process';

const path = './data.json';
const git = simpleGit();

const makeCommits = async (n) => {
    if (n === 0) return;

    const x = random.int(0, 54);
    const y = random.int(0, 6);

    const date = moment()
        .subtract(2, 'year')
        .add(x, 'week')
        .add(y, 'day')
        .format();

    const branch = `auto/${x}-${y}-${Date.now()}`;
    const title = `Auto commit for ${date}`;

    // 1️⃣ create branch
    await git.checkoutLocalBranch(branch);

    // 2️⃣ write file
    await jsonfile.writeFile(path, { date });

    // 3️⃣ commit with backdated date
    const gitWithDate = simpleGit({
        env: {
            ...process.env,
            GIT_AUTHOR_DATE: date,
            GIT_COMMITTER_DATE: date,
        },
    });

    await gitWithDate.add([path]);
    await gitWithDate.commit(title, { '--date': date });

    // 4️⃣ push branch
    await git.push('origin', branch, { '--set-upstream': null });
    const GH = process.platform === 'win32'
        ? '"C:\\Program Files\\GitHub CLI\\gh.exe"'
        : 'gh';

    // 5️⃣ create PR

    execSync(`${GH} pr create --base main --head ${branch} --title "${title}" --body "Automated PR"`, {
        stdio: 'inherit',
        shell: true,
    });

    // 6️⃣ merge PR
    execSync(`${GH} pr merge ${branch} --merge --delete-branch`, {
        stdio: 'inherit',
        shell: true,
    });
    console.log(`✅ PR merged for ${branch}`);

    // 7️⃣ back to main
    await git.checkout('main');

    await makeCommits(n - 1);
};

makeCommits(500);
