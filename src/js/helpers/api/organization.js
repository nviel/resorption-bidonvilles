import { getApi } from '#helpers/api/main';

/**
 * Lists all existing organizations
 *
 * @returns {Promise}
 */
export function list() {
    return getApi('/organizations');
}

export default list;
