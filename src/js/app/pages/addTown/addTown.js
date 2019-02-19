import NavBar from '#app/layouts/navbar/navbar.vue';
import Map from '#app/components/map/map.vue';
import { get as getAppConfig } from '#helpers/api/config';
import Datepicker from 'vuejs-datepicker';
import { fr } from 'vuejs-datepicker/dist/locale';
import { add } from '#helpers/api/town';
import Form from '#app/components/form/form.vue';

export default {
    components: {
        NavBar,
        Map,
        Datepicker,
        Form,
    },
    data() {
        const appConfig = getAppConfig();

        return {
            steps: [
                {
                    title: 'Localisation géographique',
                    inputs: [
                        {
                            mandatory: true,
                            name: 'address',
                            type: 'address',
                            label: 'Adresse',
                            description: 'Veuillez saisir le début de l\'adresse du site dans le champ ci-dessous, puis sélectionner l\'adresse exacte dans la liste qui vous est proposée. Une fois cela fait, vous pourrez préciser la situation exacte du site en déplaçant le point sur la carte.',
                            customProperties: {
                                useMap: true,
                            },
                        },
                        {
                            mandatory: false,
                            name: 'detailed_address',
                            type: 'text',
                            label: 'Informations d\'accès',
                            description: 'Veuillez saisir ici toutes les informations qui, en plus de l\'adresse, peuvent être utiles pour l\'accès au site.',
                        },
                    ],
                },
                {
                    title: 'Caractéristiques du site',
                    inputs: [
                        {
                            mandatory: true,
                            name: 'priority',
                            type: 'radio',
                            label: 'Niveau de priorité du site',
                            description: 'Le niveau 1 étant le plus prioritaire',
                            choices: [
                                { label: '1', value: 1 },
                                { label: '2', value: 2 },
                                { label: '3', value: 3 },
                                { label: '4', value: 4 },
                            ],
                        },
                        {
                            mandatory: false,
                            name: 'declared_at',
                            type: 'date',
                            label: 'Date de signalement',
                            customProperties: {
                                disabledDates: {
                                    from: new Date(),
                                },
                            },
                        },
                        {
                            mandatory: false,
                            name: 'built_at',
                            type: 'date',
                            label: 'Date d\'installation',
                            customProperties: {
                                disabledDates: {
                                    from: new Date(),
                                },
                            },
                        },
                        {
                            mandatory: true,
                            name: 'field_type',
                            type: 'radio',
                            label: 'Type de site',
                            choices: appConfig.field_types.map(fieldType => ({ label: fieldType.label, value: fieldType.id })),
                        },
                        {
                            mandatory: true,
                            name: 'owner_type',
                            type: 'radio',
                            label: 'Type de propriétaire',
                            choices: appConfig.owner_types.map(ownerType => ({ label: ownerType.label, value: ownerType.id })),
                        },
                    ],
                },
                {
                    title: 'Démographie',
                    inputs: [
                        {
                            mandatory: false,
                            name: 'population_total',
                            type: 'text',
                            label: 'Nombre de personnes',
                            description: 'Vous pouvez ignorer ce champ si cette information est inconnue.',
                        },
                        {
                            mandatory: false,
                            name: 'population_couples',
                            type: 'text',
                            label: 'Nombre de ménages',
                            description: 'Vous pouvez ignorer ce champ si cette information est inconnue.',
                        },
                        {
                            mandatory: false,
                            name: 'population_minors',
                            type: 'text',
                            label: 'Nombre de mineurs',
                            description: 'Vous pouvez ignorer ce champ si cette information est inconnue.',
                        },
                        {
                            mandatory: false,
                            name: 'social_origins',
                            type: 'multicheckbox',
                            label: 'Origine des occupants',
                            description: 'Vous pouvez ignorer ce champ si cette information est inconnue.',
                            choices: appConfig.social_origins.map(fieldType => ({ label: fieldType.label, value: fieldType.id })),
                        },
                    ],
                },
            ],
            submitter() {},
            fieldTypes: getAppConfig().field_types,
            ownerTypes: getAppConfig().owner_types,
            socialOrigins: getAppConfig().social_origins,
            dateLanguage: fr,
            address: {},
            priority: 3,
            detailedAddress: '',
            builtAt: '',
            fieldType: null,
            ownerType: null,
            populationTotal: '',
            populationCouples: '',
            populationMinors: '',
            origins: [],
            accessToElectricity: null,
            accessToWater: null,
            trashEvacuation: null,
            justiceStatus: null,
            declared_at: '',
            owner: '',
            census_status: null,
            census_requested_at: '',
            census_conducted_at: '',
            census_conducted_by: '',
            justice_rendered_by: '',
            justice_rendered_at: '',
            police_status: null,
            police_requested_at: '',
            police_granted_at: '',
            bailiff: '',
            yesnoValues: [
                { value: -1, label: 'Inconnu' },
                { value: 1, label: 'Oui' },
                { value: 0, label: 'Non' },
            ],
            diagnosisValues: [
                { value: 'none', label: 'Non prévu' },
                { value: 'scheduled', label: 'Prévu' },
                { value: 'done', label: 'Réalisé' },
            ],
            justiceValues: [
                { value: 'none', label: 'Juge non saisi' },
                { value: 'seized', label: 'Juge saisi' },
                { value: 'rendered', label: 'Décision rendue' },
            ],
            cfpValues: [
                { value: 'none', label: 'Aucun' },
                { value: 'requested', label: 'Demandé' },
                { value: 'granted', label: 'Obtenu' },
            ],
            error: null,
            fieldErrors: {},
        };
    },
    methods: {
        submit() {
            // clean previous errors
            this.error = null;
            this.fieldErrors = {};

            // send the form
            const coordinates = this.address && this.address.coordinates;

            add({
                priority: this.priority,
                latitude: coordinates && coordinates[0],
                longitude: coordinates && coordinates[1],
                city: this.address && this.address.city,
                citycode: this.address && this.address.citycode,
                address: this.address && this.address.label,
                detailed_address: this.detailedAddress,
                built_at: this.builtAt,
                population_total: this.populationTotal,
                population_couples: this.populationCouples,
                population_minors: this.populationMinors,
                access_to_electricity: this.accessToElectricity,
                access_to_water: this.accessToWater,
                trash_evacuation: this.trashEvacuation,
                justice_status: this.justiceStatus,
                social_origins: this.origins,
                field_type: this.fieldType,
                owner_type: this.ownerType,
                declared_at: this.declared_at,
                owner: this.owner,
                census_status: this.census_status,
                census_requested_at: this.census_requested_at,
                census_conducted_at: this.census_conducted_at,
                census_conducted_by: this.census_conducted_by,
                justice_rendered_by: this.justice_rendered_by,
                justice_rendered_at: this.justice_rendered_at,
                police_status: this.police_status,
                police_requested_at: this.police_requested_at,
                police_granted_at: this.police_granted_at,
                bailiff: this.bailiff,
            })
                .then(() => {
                    this.$router.push('/liste-des-sites');
                })
                .catch((response) => {
                    this.error = response.user_message;
                    this.fieldErrors = response.fields || {};
                });
        },
    },
};
