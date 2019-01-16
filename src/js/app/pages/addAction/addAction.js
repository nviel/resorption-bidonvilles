import NavBar from '#app/layouts/navbar/navbar.vue';
import Autocomplete from '#app/components/autocomplete/autocomplete.vue';
import { get } from '#helpers/api/config';
import Datepicker from 'vuejs-datepicker';
import { fr } from 'vuejs-datepicker/dist/locale';
import { add } from '#helpers/api/action';
import { searchOperator } from '#helpers/api/operator';

export default {
    components: {
        NavBar,
        Datepicker,
        Autocomplete,
    },
    data() {
        return {
            actionTypes: get().action_types,
            regions: get().regions,
            departements: get().departements,
            dateLanguage: fr,
            actionType: null,
            name: '',
            description: '',
            startedAt: '',
            territoryType: null,
            region: null,
            departement: null,
            territoryTypes: [
                { name: 'region', label: 'Région' },
                { name: 'departement', label: 'Département' },
            ],
            error: null,
            fieldErrors: {},
            operatorQuery: null,
            operators: [],
        };
    },
    computed: {
        territoryCode() {
            switch (this.territoryType) {
            case 'region':
                return this.region;

            case 'departement':
                return this.departement;

            default:
                return null;
            }
        },
    },
    methods: {
        submit() {
            // clean previous errors
            this.error = null;
            this.fieldErrors = {};

            add({
                type: this.actionType,
                name: this.name,
                description: this.description,
                started_at: this.startedAt,
                territory_type: this.territoryType,
                territory_code: this.territoryCode,
                operators: this.operators,
            })
                .then(() => {
                    this.$router.push('/liste-des-actions');
                })
                .catch((response) => {
                    this.error = response.user_message;
                    this.fieldErrors = response.fields || {};
                });
        },

        addOperator() {
            this.operators.push({
                id: null,
                label: '',
                contacts: [],
            });
        },

        removeOperator(index) {
            this.operators.splice(index, 1);
        },

        operatorAutocomplete(query) {
            const promise = searchOperator(query);
            const aborter = promise.abort;

            const p = promise.then(results => results.map(operator => ({
                id: operator.id,
                label: operator.name,
            })));
            p.abort = aborter;

            return p;
        },
    },
};
