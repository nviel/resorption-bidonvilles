export default {
    props: {
        town: Object,
        origin: Event, // this event is the one that caused that quick-view to appear
    },
    computed: {
        active() {
            return !!this.town;
        },
    },
    mounted() {
        document.addEventListener('click', this.checkOutsideClick);
    },
    destroyed() {
        document.removeEventListener('click', this.checkOutsideClick);
    },
    methods: {
        checkOutsideClick(event) {
            if (!this.town) {
                return;
            }

            // ignore the origin event
            if (event === this.origin) {
                return;
            }

            // if the click was outside ourselves, share the info
            if (!this.$refs.quickviewPanel.contains(event.target)) {
                this.$emit('outside-click', event);
            }
        },
        showTown() {
            this.$router.push(`/site/${this.town.id}`);
        },
    },
};
