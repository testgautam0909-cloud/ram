import jsonfile from 'jsonfile';
import moment from 'moment';
import simpleGit from 'simple-git';

const path = './data.json';

const date = moment().format();

const data = {
  date
};

jsonfile.writeFile(path, data, (err) => {
  if (err) console.error(err);
});

simpleGit().add(path).commit(`Updated date to ${date}`).push();