import NavBar from '#app/layouts/navbar/navbar.vue';
import PlanFunding from '#app/components/planFunding/planFunding.vue';
import Operator from '#app/components/operator/operator.vue';
import Datepicker from 'vuejs-datepicker';
import { fr } from 'vuejs-datepicker/dist/locale';
import { get as getConfig } from '#helpers/api/config';
import { create } from '#helpers/api/plan';

export default {
    components: {
        Datepicker,
        NavBar,
        PlanFunding,
        Operator,
    },

    data() {
        return {
            /**
             * List of plan-types
             *
             * @type {Array.<PlanType>}
             */
            planTypes: getConfig().plan_types || [],

            /**
             * Language set for the datepicker
             *
             * @type {Object}
             */
            dateLanguage: fr,

            form: {
                pending: false,
                mainError: null,
                errors: {},
                data: {
                    operator: null,
                    planType: null,
                    startedAt: null,
                    funding: [],
                },
            },
        };
    },

    computed: {
        /**
         * Parses the form data and returns it without unecessary values
         *
         * @returns {Object}
         */
        formData() {
            const data = Object.assign({}, this.form.data);
            data.operator = (data.operator && data.operator.operator_id) || null;

            return data;
        },

        /**
         * Returns the currently selected plan type, if any
         *
         * @returns {PlanType|null}
         */
        planType() {
            return this.getPlanType(this.form.data.planType);
        },
    },

    methods: {
        /**
         * Finds a plan-type by id
         *
         * @param {number} id
         *
         * @returns {PlanType|null}
         */
        getPlanType(id) {
            return this.planTypes.find(({ id: planTypeId }) => planTypeId === id) || null;
        },

        /**
         * Submits the form
         */
        submit() {
            // avoid submitting the form twice
            if (this.form.pending === true) {
                return;
            }

            this.form.pending = true;
            this.form.errors = {};
            this.form.mainError = null;

            create(this.formData)
                .then(() => {
                    this.form.pending = false;

                    this.$notify({
                        group: 'notifications',
                        type: 'success',
                        title: 'Dispositif correctement déclaré',
                        text: 'Le dispositif a bien été ajouté en base de données',
                    });

                    this.$router.push('/liste-des-dispositifs');
                })
                .catch(({ user_message: userMessage, fields }) => {
                    this.form.mainError = userMessage;
                    this.form.errors = fields || {};
                    this.form.pending = false;
                });
        },
    },
};
