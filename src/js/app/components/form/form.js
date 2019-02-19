/* ****************************************************************************************************
 * Dependencies
 **************************************************************************************************** */

// input
import Input from '#app/components/input/input.vue';


/* ****************************************************************************************************
 * Configuration
 **************************************************************************************************** */

/**
 * @typedef {Object} FormStep
 * @property {string}            title  Title of the step
 * @property {Array.<FormInput>} inputs List of inputs composing the step
 */

/**
 * @typedef {Object} FormInput
 * @inherits {Input}
 *
 * @property {string}         name             Name of the input
 * @property {string}         label            Label of the input
 * @property {boolean}        [mandatory=true] Whether the input is mandatory or not
 * @property {string}         [description]    Paragraph of description of the input
 * @property {Array.<string>} [errors]         List of errors attached to the input
 */

/**
 * @callback FormSubmitter
 * @param {Object} values The values of each input
 * @returns {Promise}
 */

/**
 * @typedef {Object} ApiError
 * @property {string}                user_message      User-friendly main error
 * @property {string}                developer_message Developer-oriented main error
 * @property {Object.<string,Array>} fields            List of errors, by fields
 */


/* ****************************************************************************************************
 * Definition
 **************************************************************************************************** */

export default {

    components: {
        Input,
    },


    props: {
        /**
         * Title of the form
         *
         * @type {string}
         */
        title: {
            type: String,
            required: true,
        },

        /**
         * List of steps composing the form
         *
         * @type {Array.<FormStep>}
         */
        steps: {
            type: Array,
            required: true,
        },

        /**
         * Label of the submit button in the last step
         *
         * @type {string}
         */
        submitLabel: {
            type: String,
            required: false,
            default: 'Valider',
        },

        /**
         * Submit function
         *
         * @type {FormSubmitter}
         */
        submitter: {
            type: Function,
            required: true,
        },
    },


    computed: {
        /**
         * Current step
         *
         * @returns {FormStep}
         */
        currentStep() {
            return this.steps[this.currentStepIndex];
        },

        /**
         * The label of the submit button
         *
         * Depends of the current step.
         *
         * @returns {string}
         */
        labelOfTheSubmitButton() {
            return this.isTheLastStepReached() ? this.submitLabel : 'Étape suivante';
        },
    },


    data() {
        return {
            /**
             * Main error
             *
             * In addition to the list of specific errors attached
             * to each input.
             *
             * @type {string|null}
             */
            error: null,

            /**
             * Index of the current step
             *
             * @type {number}
             */
            currentStepIndex: 0,

            /**
             * Value of each input
             *
             * @type {Object}
             */
            values: this.buildValuesForTheForm(),
        };
    },


    methods: {
        /**
         * Shows the previous step
         */
        stepBack() {
            const savedValues = JSON.parse(JSON.stringify(this.values));
            this.currentStepIndex = Math.max(0, this.currentStepIndex - 1);
            setTimeout(() => {
                Object.keys(savedValues).forEach((name) => {
                    this.values[name] = savedValues[name];
                });
            }, 1000);
        },

        /**
         * Validates the current step
         */
        submit() {
            if (this.isTheLastStepReached()) { // if we have reached the last step, try actually submitting the form
                this.resetErrors();
                this.submitter(this.values).then(this.onSubmitSuccess).catch(this.onSubmitFailure);
            } else { // otherwise, proceed to the next step
                this.currentStepIndex += 1;
            }
        },

        /**
         * Displays a specific step
         *
         * @param {number} stepIndex Index of the step to be displayed
         */
        displayStep(stepIndex) {
            // you are not allowed to jump without validation to a further step
            if (stepIndex >= this.currentStepIndex) {
                return;
            }

            // ensure we respect the number of steps
            if (stepIndex <= 0) {
                this.currentStepIndex = 0;
            } else if (stepIndex >= this.steps.length - 1) {
                this.currentStepIndex = this.steps.length - 1;
            } else {
                this.currentStepIndex = stepIndex;
            }
        },

        /**
         * Indicates wether we reached the last step of the form or not
         *
         * @returns {boolean}
         */
        isTheLastStepReached() {
            return this.currentStepIndex >= this.steps.length - 1;
        },

        /**
         * Indicates whether a specific step contains one or more errored inputs
         *
         * @param {number} stepIndex
         *
         * @returns {boolean}
         */
        doesStepContainErrors(stepIndex) {
            return this.steps[stepIndex].inputs.some(input => input.errors && input.errors.length > 0);
        },

        /**
         * Resets all form and input errors
         */
        resetErrors() {
            // reset the main error
            this.error = null;

            // reset the errors of each input
            this.steps.forEach((step, stepIndex) => {
                step.inputs.forEach((input, inputIndex) => {
                    this.steps[stepIndex].inputs[inputIndex].errors = undefined;
                });
            });
        },

        /**
         * Handles a successful response from the submitter
         */
        onSubmitSuccess() {
            console.log('Bravo');
        },

        /**
         * Handles an error response from the submitter
         *
         * @param {ApiError} response
         */
        onSubmitFailure(response) {
            // main error
            this.error = response.user_message;

            // input-specific errors
            this.steps.forEach((step, stepIndex) => {
                step.inputs.forEach((input, inputIndex) => {
                    const errors = response.fields[input.name];
                    if (!errors) {
                        return;
                    }

                    this.steps[stepIndex].inputs[inputIndex].errors = errors;
                });
            });
        },

        /**
         * Builds the 'values' data property for the whole form
         *
         * The 'values' data property is a simple key-value object that
         * stores the value of each input.
         *
         * @returns {Object}
         */
        buildValuesForTheForm() {
            return this.steps.reduce((values, step) => Object.assign(values, this.buildValuesForStep(step)), {});
        },

        /**
         * Builds the 'values' data property for a specific step
         *
         * Used to progressively build the 'values' data property for the whole form.
         * @see buildValuesForTheForm
         *
         * @param {FormStep} step
         *
         * @returns {Object}
         */
        buildValuesForStep(step) {
            return step.inputs.reduce((values, input) => {
                /* eslint-disable-next-line */
                values[input.name] = undefined;
                return values;
            }, {});
        },
    },

};
