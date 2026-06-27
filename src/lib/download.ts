// Passport file IO now lives in the shared @tph/core (vendored). Re-exported here
// so existing call sites keep importing from '../lib/download'.
export { downloadText, readFileText } from '../tph-core/io';
