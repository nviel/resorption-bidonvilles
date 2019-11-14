import { all as getStats } from '#helpers/api/stats';

export default {
    data() {
        return {
            state: null,
            error: null,
            stats: null,
        };
    },

    computed: {
        numberOfDepartements() {
            return this.stats ? this.stats.numberOfDepartements : '...';
        },

        numberOfCollaboratorAndAssociationUsers() {
            return this.stats ? this.stats.numberOfCollaboratorAndAssociationUsers : '...';
        },

        numberOfTerritorialCollectivities() {
            return this.stats ? (this.stats.numberOfCollaboratorAndAssociationOrganizations.territorial_collectivity || 0) : '...';
        },

        numberOfAssociations() {
            return this.stats ? (this.stats.numberOfCollaboratorAndAssociationOrganizations.association || 0) : '...';
        },

        numberOfPublicEstablishments() {
            return this.stats ? (this.stats.numberOfCollaboratorAndAssociationOrganizations.public_establishment || 0) : '...';
        },

        numberOfExports() {
            return this.stats ? this.stats.numberOfExports : '...';
        },

        numberOfComments() {
            return this.stats ? this.stats.numberOfComments : '...';
        },

        numberOfDirectoryViews() {
            return this.stats ? this.stats.numberOfDirectoryViews : '...';
        },

        numberOfNewUsers() {
            return this.stats ? this.stats.numberOfNewUsersLastMonth : '...';
        },

        meanTimeBeforeCreationDeclaration() {
            return this.stats ? (Math.round(this.stats.meanTimeBeforeCreationDeclaration.average) || '?') : '...';
        },

        meanTimeBeforeClosingDeclaration() {
            return this.stats ? (Math.round(this.stats.meanTimeBeforeClosingDeclaration.average) || '?') : '...';
        },

        numberOfShantytownOperations() {
            return this.stats ? this.stats.numberOfShantytownOperations : '...';
        },
    },

    created() {
        this.load();
    },

    methods: {
        /**
         * Tries fetching the data from the API
         *
         * Please note that this cannot be done if the data has already been loaded
         * before.
         */
        load() {
            if (this.state === 'loading') {
                return;
            }

            this.state = 'loading';
            this.error = null;

            getStats()
                .then(({ statistics: stats }) => {
                    this.stats = stats;
                    this.state = 'loaded';
                })
                .catch(({ user_message: error }) => {
                    this.error = error;
                    this.state = 'error';
                });
        },
    },
};
