import thread from '../../src/threads/model';

test('should throw thread does not exist error', async done => {
    const threadId = '-10';
    const user = 'bob';
    const message = 'This is a message';

    let error;

    try {
        await thread.send(threadId, user, message);
    } catch (e) {
        error = e;
    }

    //expect(thread.send).toHaveBeenCalledWith(threadId, fakeUsers, message);
    expect(error).toBeTruthy();
    expect(error.message).toBe(`Thread ${threadId} does not exist!`);
    done();
});

test('should throw user not in thread error', async done => {
    const threadId = '1';
    const fakeUser = 'bob';
    const message = 'This is a message';

    let error;
    try {
        await thread.send(threadId, fakeUser, message);
    } catch (e) {
        error = e;
    }

    expect(error).toBeTruthy();
    expect(error.message).toBe(
        `Message not sent - user ${fakeUser} not part of thread ${threadId}!`,
    );

    done();
});
