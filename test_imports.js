try {
    require('jose');
    console.log('jose OK');
    require('googleapis');
    console.log('googleapis OK');
    require('zod');
    console.log('zod OK');
    require('next/server');
    console.log('next/server OK');
} catch (e) {
    console.error(e);
}
