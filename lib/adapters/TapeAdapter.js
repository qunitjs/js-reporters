const EventEmitter = require('events');

module.exports = class TapeAdapter extends EventEmitter {
  /**
   * Unlike other adapters, this adapter ends up disabling the default
   * reporter of its framework (in this case, Tape's TAP reporter to
   * console.log). This is the default Tape behaviour, and we choose not to
   * change that. If you wish to enable Tape's default reporter also, and
   * e.g. use CRI only for additional reports to network or artefact files,
   * then run `tape.createStream().pipe(process.stdout);` to have both.
   *
   * @param {Tape} tape
   */
  constructor (tape) {
    super();

    // TODO: Unable to observe 'prerun' event for some reason.
    let started = false;
    let runStartTime;
    let runStatus = 'passed';
    const runCounts = { passed: 0, failed: 0, skipped: 0, todo: 0, total: 0 };
    const startOnce = () => {
      if (!started) {
        started = true;
        this.emit('runStart', { name: null, counts: { total: null } });
        runStartTime = new Date().getTime();
      }
    };

    let fakeTestId = -1;
    const activeTests = {};
    const handleRow = (row) => {
      let test;
      switch (row.type) {
        // {type: test, name: '…', id: 0, skip: false, todo: false}
        // {type: test, name: '…', id: 1, skip: false, todo: false, parent: 0}
        case 'test':
          test = activeTests[row.id] = {
            startTime: new Date().getTime(),
            name: row.name,
            parentName: row.parent ? activeTests[row.parent].name : null,
            fullName: row.parent ? [...activeTests[row.parent].fullName, row.name] : [row.name],
            status: row.skip ? 'skipped' : (row.todo ? 'todo' : 'passed'),
            assertions: [],
            errors: [],
            parent: row.parent ? activeTests[row.parent] : null
          };
          this.emit('testStart', {
            name: test.name,
            parentName: test.parentName,
            fullName: test.fullName
          });
          break;

        // {type: 'end', test: 0}
        case 'end':
          test = activeTests[row.test];
          delete activeTests[row.test];
          this.emit('testEnd', {
            name: test.name,
            parentName: test.parentName,
            fullName: test.fullName,
            status: test.status,
            assertions: test.assertions,
            errors: test.errors,
            runtime: test.status === 'skipped' ? null : new Date().getTime() - test.startTime
          });
          runCounts.total++;
          runCounts[test.status]++;
          if (test.status === 'failed') {
            if (test.parent) {
              test.parent.status = test.status;
            }
            runStatus = 'failed';
          }
          break;

        // {type: 'assert', test: 0, ok: true, skip: false, name: '…', actual: '…', expected: '…', error: Error}
        case 'assert':
          if (row.skip) {
            // Replay as skipped test, ref https://github.com/substack/tape/issues/545
            const testId = fakeTestId--;
            handleRow({
              type: 'test',
              name: row.name,
              id: testId,
              skip: row.skip,
              todo: row.todo,
              parent: row.test
            });
            handleRow({ type: 'end', test: testId });
            return;
          }

          activeTests[row.test].assertions.push({
            passed: row.ok,
            message: row.name
          });
          if (!row.ok) {
            if (!row.todo) {
              activeTests[row.test].status = 'failed';
            }
            activeTests[row.test].errors.push({
              passed: row.ok,
              message: row.name,
              // actual and expected are optional, e.g. not set for t.fail()
              actual: row.actual,
              expected: row.expected,
              stack: (row.error && row.error.stack) || null
            });
          }
          break;
      }
    };

    const stream = tape.createStream({ objectMode: true });
    stream.on('data', (row) => {
      startOnce();
      handleRow(row);
    });
    stream.on('end', (row) => {
      startOnce();
      if (row) {
        handleRow(row);
      }
      this.emit('runEnd', {
        name: null,
        status: runStatus,
        counts: runCounts,
        runtime: new Date().getTime() - runStartTime
      });
    });
  }
};
