import { getApi } from '#helpers/api/main';

/**
 * Fetchs a specific town from the database
 *
 * @param {string} id
 *
 * @returns {Promise}
 */
export function searchOperator(name) {
    return getApi(`/operators/search?q=${name}`);
}

export default searchOperator;
