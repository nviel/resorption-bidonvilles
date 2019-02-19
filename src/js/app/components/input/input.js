/* ****************************************************************************************************
 * Dependencies
 **************************************************************************************************** */

// datepicker
import Datepicker from 'vuejs-datepicker';
import { fr } from 'vuejs-datepicker/dist/locale';

// address
import Address from '#app/components/address/address.vue';


/* ****************************************************************************************************
 * Configuration
 **************************************************************************************************** */

/**
 * List of supported types
 *
 * @type {Array.<string>}
 * @readonly
 */
const SUPPORTED_TYPES = [
    'text', // a simple <input type="text" />
    'radio', // a list of <input type="radio" />
    'multicheckbox', // a list of <input type="checkbox" />
    'date', // a datepicker
    'address', // an autocompleted address textfield, along with a map
];

/**
 * Default value for each input type
 *
 * @type {Object.<string,Object>}
 * @readonly
 */
const DEFAULT_VALUES = {
    text: '',
    radio: null,
    multicheckbox: [],
    date: '',
    address: null,
};

/**
 * A single choice of a multi-choice input (like radio or multicheckbox)
 *
 * @typedef {Object} InputChoice
 * @property {string} label The label for that choice
 * @property {string} value The value for that joice
 */


/* ****************************************************************************************************
 * Definition
 **************************************************************************************************** */

export default {

    components: {
        Datepicker,
        Address,
    },


    props: {
        /**
         * The input type that should be generated
         *
         * @type {string}
         */
        type: {
            type: String,
            required: true,
            validator: value => SUPPORTED_TYPES.includes(value),
        },

        /**
         * Placeholder
         *
         * Ignored by certain input's types (radio, multicheckbox, ...)
         *
         * @type {string}
         */
        placeholder: {
            type: String,
            required: false,
            default: '',
        },

        /**
         * List of choices for multiple-choice inputs (like radio or multicheckbox)
         *
         * @type {Array.<InputChoice>}
         */
        choices: {
            type: Array,
            required: false,
        },

        /**
         * Default value of the input
         *
         * @type {string|Array.<string>|Object} Depends on the input's type
         */
        default: {
            type: [String, Array, Object, Date],
            required: false,
        },

        /**
         * Custom properties for the input
         *
         * For any custom properties of the input, you may use this
         * object that will be bound to the input.
         *
         * @type {Object}
         */
        customProperties: {
            type: Object,
            required: false,
            default() {
                return {};
            },
        },
    },


    computed: {
        /**
         * Unique id of this input
         *
         * Used to link the label of multiple-choice inputs to their related input.
         * For instance, linking the label of each radio choice to the the actual radio button.
         */
        id() {
            // eslint-disable-next-line
            return this._uid;
        },
    },


    data() {
        return {
            /**
             * Current value of the input
             *
             * @type {Object} Depends on the input's type
             */
            value: this.default || DEFAULT_VALUES[this.type],

            /**
             * Language set for the datepicker component
             *
             * @type {Object}
             */
            datepickerLanguage: fr,
        };
    },


    watch: {
        value() {
            this.$emit('input', this.value);
        },
    },


    mounted() {
        this.$emit('input', this.value);
    },

};
