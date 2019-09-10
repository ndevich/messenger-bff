import thread from '../../src/threads/model';

test('should create thread', () => {
    const fakeUsers = ['bob', 'job'];
    thread.create(fakeUsers);
});
