const cp = require('child_process');

function getAuthors () {
  const orderedAuthors = cp.execFileSync(
    'git',
    ['log', '--format=%aN', '--reverse'],
    { encoding: 'utf8' }
  );
  const unique = orderedAuthors
    .trim()
    .split('\n')
    .filter((author, i, arr) => arr.indexOf(author) === i);

  unique[unique.length - 1] = 'and ' + unique[unique.length - 1];

  return unique.join(', ') + '.';
}

process.stdout.write(getAuthors() + '\n');
