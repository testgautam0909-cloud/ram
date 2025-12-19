import jsonfile from 'jsonfile';
import moment from 'moment';
import random from 'random';
import simpleGit from 'simple-git';

const path = './data.json';

// const makeCommits = (n) => {
//   if (n === 0) return;

//   const x = random.int(0, 54);
//   const y = random.int(0, 6);

//   const date = moment()
//     .subtract(1, 'y')
//     .add(x, 'w')
//     .add(y, 'd')
//     .format();

//   const data = { date };

//   jsonfile.writeFile(path, data, () => {
//     simpleGit()
//       .add([path])
//       .commit(date, { '--date': date }, () => {
//         makeCommits(n - 1);
//       }).push();
//   });
// };

// makeCommits(100);



const markCommit = async (x, y) => {
  const date = moment()
    .subtract(1, 'year')
    .add(x, 'week')
    .add(y, 'day')
    .format();

  const data = { date };
  await jsonfile.writeFile(path, data);

  // ✅ create git instance WITH env
  const git = simpleGit({
    env: {
      ...process.env,
      GIT_AUTHOR_DATE: date,
      GIT_COMMITTER_DATE: date,
    },
  });

  await git.add([path]);
  await git.commit(date, { '--date': date });

  console.log(`Marked commit on week ${x}, day ${y}`);
};

markCommit(0, 0)
