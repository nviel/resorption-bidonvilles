/* ****************************************************************************************************
 * Dependencies
 **************************************************************************************************** */

// autocomplete
import { autocomplete } from '#helpers/addressHelper';

// map
import Map from '#app/components/map/map.vue';


/* ****************************************************************************************************
 * Configuration
 **************************************************************************************************** */

/**
 * Delay before triggering an autocomplete, in milliseconds
 *
 * @type {number}
 * @readonly
 */
const DELAY_BEFORE_QUERY = 200;

/**
 * Minimum length of the user's query before triggering an autocomplete
 *
 * @type {number}
 * @readonly
 */
const MIN_LABEL_LENGTH_BEFORE_QUERY = 5;

/**
 * Keycode of important keys
 *
 * Used for managing the navigation through the suggestion list by
 * keyboard.
 *
 * @type {Object.<string,number>}
 * @readonly
 */
const KEYCODES = {
    ARROW_DOWN: 40,
    ARROW_UP: 38,
    ENTER: 13,
};

/**
 * @typedef {Object} Address
 * @property {string}   label       Full address
 * @property {GpsPoint} coordinates GPS coordinates
 */


/* ****************************************************************************************************
 * Definition
 **************************************************************************************************** */

export default {

    components: {
        Map,
    },


    props: {
        /**
         * Selected address
         *
         * @type {Address|null}
         */
        value: {
            type: Object,
            required: false,
            default: null,
        },

        /**
         * Placeholder
         *
         * @type {string}
         */
        placeholder: {
            type: String,
            required: false,
            default: '',
        },

        /**
         * Whether a map should be shown, in order to adjust the coordinates of the address
         *
         * @type {Boolean}
         */
        useMap: {
            type: Boolean,
            required: false,
            default: false,
        },
    },


    data() {
        return {
            /**
             * Current value of the label input
             *
             * @type {string}
             */
            label: this.value ? this.value.label : '',

            /**
             * Previous value of the label, before the new user's inputs
             *
             * @type {string}
             */
            previousLabel: this.value ? this.value.label : '',

            /**
             * Current coordinates linked to the address
             *
             * Can be customized by the user through the map, if used.
             *
             * @type {GpsPoint|null}
             */
            coordinates: this.value ? this.value.coordinates : null,

            /**
             * List of autocompletion suggestions
             *
             * @type {Array.<Address>}
             */
            suggestions: [],

            /**
             * Index of the currently highlighted suggestion
             *
             * @type {number|null}
             */
            indexOfHighlightedSuggestion: null,

            suggestionQuery: {
                /**
                 * Promise
                 *
                 * @type {Promise|null}
                 */
                promise: null,

                /**
                 * Timeout before triggering a suggestion query
                 *
                 * @type {Timeout|null}
                 */
                timeout: null,
            },

            /**
             * Wether the user accepted the map's instructions
             *
             * @type {boolean}
             */
            showMapInstructions: true,
        };
    },


    computed: {
        /**
         * Whether the map should be visible or not
         */
        showMap() {
            return this.useMap === true && this.coordinates !== null;
        },

        /**
         * Default view of the map
         *
         * If the coordinates are not null, we should center on them, otherwise,
         * simply return undefined to use the default view.
         *
         * @returns {Object|undefined}
         */
        mapView() {
            if (this.coordinates === null) {
                return undefined;
            }

            return {
                center: this.coordinates,
                zoom: 16,
            };
        },
    },


    watch: {
        // listens for changes in the tracker position (through the map), and notifies them as a value change
        coordinates() {
            if (this.coordinates !== null) {
                this.$emit('input', {
                    label: this.label,
                    coordinates: this.coordinates,
                });
            }
        },
    },


    methods: {
        /**
         * Handles a new address label
         */
        onNewLabel() {
            // ignore inputs that did not cause a change of the label
            if (this.label === this.previousLabel) {
                return;
            }

            this.previousLabel = this.label;

            // reset the previous suggestions and coordinates
            this.resetCoordinates();
            this.resetSuggestions();

            // plan a new suggestion query
            if (this.label.length >= MIN_LABEL_LENGTH_BEFORE_QUERY) {
                this.suggestionQuery.timeout = setTimeout(this.querySuggestions, DELAY_BEFORE_QUERY);
            }
        },

        /**
         * Queries a list of suggestion for the current address label
         */
        querySuggestions() {
            // reset the timeout
            this.suggestionQuery.timeout = null;

            // send the query
            this.suggestionQuery.promise = autocomplete(this.label);
            this.suggestionQuery.promise
                .then((suggestions) => {
                    this.suggestionQuery.promise = null;
                    this.setSuggestions(suggestions);
                })
                .catch(() => {
                    this.suggestionQuery.promise = null;
                });
        },

        /**
         * Sets the list of suggestions
         *
         * @param {Array.<Address>}
         */
        setSuggestions(suggestions) {
            this.suggestions = suggestions;

            if (this.suggestions.length > 0) {
                this.indexOfHighlightedSuggestion = 0;
            } else {
                this.indexOfHighlightedSuggestion = null;
            }
        },

        /**
         * Resets the address coordinates
         */
        resetCoordinates() {
            this.coordinates = null;
            this.$emit('input', null);
        },

        /**
         * Resets the suggestions
         *
         * Clears both the suggestion query and the suggestion list.
         */
        resetSuggestions() {
            // abort the current suggestion query
            if (this.suggestionQuery.promise !== null) {
                this.suggestionQuery.promise.abort();
                this.suggestionQuery.promise = null;
            }

            // reset the pending suggestion query
            if (this.suggestionQuery.timeout !== null) {
                clearTimeout(this.suggestionQuery.timeout);
                this.suggestionQuery.timeout = null;
            }

            // reset the current list of suggestions
            this.setSuggestions([]);
        },

        /**
         * Handles input's blur
         */
        onBlur() {
            this.resetSuggestions();

            // if no suggestion has been selected, empty the input
            // (you cannot use a label that does not match a suggestion)
            if (this.coordinates === null) {
                this.label = '';
                this.previousLabel = '';
            }
        },

        /**
         * Handles a click on a suggestion by saving it as the new value
         *
         * @param {Address} suggestion
         */
        onSuggestionClick(suggestion) {
            // clear the list of suggestions
            this.resetSuggestions();

            // save the clicked suggestion
            this.label = suggestion.label;
            this.previousLabel = suggestion.label;
            this.coordinates = suggestion.coordinates;

            this.$emit('input', suggestion);
        },

        /**
         * Handles the navigation by keyboard through the suggestion list
         *
         * Catches the usage of arrow keys to manage the navigation through
         * the suggestions.
         *
         * @param {KeyboardEvent} event
         */
        handleNavigationThroughSuggestions(event) {
            // navigation is impossible if the suggestion list is empty!
            if (this.suggestions.length <= 0) {
                return;
            }

            // handle the up arrow (previous suggestion)
            if (event.keyCode === KEYCODES.ARROW_UP) {
                this.highlightPreviousSuggestion();
                return;
            }

            // handle the down arrow (next suggestion)
            if (event.keyCode === KEYCODES.ARROW_DOWN) {
                this.highlightNextSuggestion();
            }

            // handle the 'enter' key (select current suggestion)
            if (event.keyCode === KEYCODES.ENTER) {
                if (this.indexOfHighlightedSuggestion !== null) {
                    this.onSuggestionClick(this.suggestions[this.indexOfHighlightedSuggestion]);
                }
            }
        },

        /**
         * Highlights the previous suggestion in the list
         *
         * This methods assumes the suggestion list is not empty.
         */
        highlightPreviousSuggestion() {
            if (this.indexOfHighlightedSuggestion === null) {
                return;
            }

            if (this.indexOfHighlightedSuggestion - 1 < 0) {
                this.indexOfHighlightedSuggestion = null;
            } else {
                this.indexOfHighlightedSuggestion = this.indexOfHighlightedSuggestion - 1;
            }
        },

        /**
         * Highlights the next suggestion in the list
         *
         * This methods assumes the suggestion list is not empty.
         */
        highlightNextSuggestion() {
            if (this.indexOfHighlightedSuggestion === null) {
                this.indexOfHighlightedSuggestion = 0;
            } else {
                this.indexOfHighlightedSuggestion = Math.min(
                    this.suggestions.length - 1,
                    this.indexOfHighlightedSuggestion + 1,
                );
            }
        },

        /**
         * Detects and handles a click outside the suggestion list
         *
         * A click outside the suggestion list should reset the list, without
         * resetting the current label.
         */
        onClick(event) {
            if (!this.$el.contains(event.target)) {
                this.resetSuggestions();
            }
        },
    },


    mounted() {
        document.addEventListener('click', this.onClick);
    },


    beforeDestroy() {
        // clear the pending suggestion queries before leaving
        this.resetSuggestions();
    },


    destroyed() {
        document.removeEventListener('click', this.onClick);
    },

};
