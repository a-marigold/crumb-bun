const ITERATIONS = 16000;
const HEADER_VALUE = 'header';
const HEADER_KEY_START = 'key_';

(() => {
    const creationStart = performance.now();
    const instance = new Headers();
    const creationEnd = performance.now();

    const setLoopStart = performance.now();
    for (let i = 0; i < ITERATIONS; ++i) {
        instance.set('key_' + i, HEADER_VALUE);
    }
    const setLoopEnd = performance.now();

    const getLoopStart = performance.now();
    for (let i = 0; i < ITERATIONS; ++i) {
        instance.get(HEADER_KEY_START + i);
    }
    const getLoopEnd = performance.now();

    const resInitializationStart = performance.now();
    new Response('', { headers: instance });
    const resIntializationEnd = performance.now();

    const createDiff = creationEnd - creationStart;
    const setLoopDiff = setLoopEnd - setLoopStart;
    const getLoopDiff = getLoopEnd - getLoopStart;
    const resDiff = resIntializationEnd - resInitializationStart;

    console.log('instance');
    console.log('  creation: ' + (creationEnd - creationStart) + 'ms');
    console.log('  set loop: ' + (setLoopEnd - setLoopStart) + 'ms');
    console.log('  get loop: ' + (getLoopEnd - getLoopStart) + 'ms');
    console.log('  res initialization: ' + resDiff + 'ms');
    console.log(
        'total: ' + (createDiff + setLoopDiff + getLoopDiff + resDiff) + 'ms'
    );
})();

console.log('');

(() => {
    const creationStart = performance.now();
    const init: Record<string, string> = {};
    const creationEnd = performance.now();

    const setLoopStart = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        init[HEADER_KEY_START + i] = HEADER_VALUE;
    }
    const setLoopEnd = performance.now();

    const getLoopStart = performance.now();

    for (let i = 0; i < ITERATIONS; ++i) {
        init[HEADER_KEY_START + i];
    }

    const getLoopEnd = performance.now();

    const initializationStart = performance.now();
    new Headers(init);
    const initializationEnd = performance.now();

    const resInitializationStart = performance.now();
    new Response('', { headers: init });
    const resIntializationEnd = performance.now();

    const createDiff = creationEnd - creationStart;
    const setLoopDiff = setLoopEnd - setLoopStart;
    const getLoopDiff = getLoopEnd - getLoopStart;
    const resDiff = resIntializationEnd - resInitializationStart;

    console.log('init');
    console.log('  creation: ' + createDiff + 'ms');
    console.log('  set loop: ' + setLoopDiff + 'ms');
    console.log('  get loop: ' + getLoopDiff + 'ms');
    console.log('  res initialization: ' + resDiff + 'ms');
    console.log(
        'total: ' + (createDiff + setLoopDiff + getLoopDiff + resDiff) + 'ms'
    );
})();
