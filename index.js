import jsonfile from 'jsonfile';
import moment from 'moment';
import random from 'random';
import simpleGit from 'simple-git';

const path = './data.json';

const makeCommits = (n) => {
  if (n === 0) return;

  const x = random.int(0, 54);
  const y = random.int(0, 6);

  const date = moment()
    .subtract(1, 'y')
    .add(x, 'w')
    .add(y, 'd')
    .format();

  const data = { date };

  jsonfile.writeFile(path, data, () => {
    simpleGit()
      .add([path])
      .commit(date, { '--date': date }, () => {
        makeCommits(n - 1);
      }).push();
  });
};

// makeCommits(100);
makeCommits(0,0)
const markCommit = (x,y) => {
    const date = moment()
    .subtract(1, 'y')
    .add(x, 'w')
    .add(y, 'd')
    .format();

    const data = { date };

    jsonfile.writeFile(path, data, () => {
        simpleGit().add([path]).commit(date, { '--date': date }, () => {
            console.log(`Marked commit on week ${x}, day ${y}`);
        }).push();
    })
}