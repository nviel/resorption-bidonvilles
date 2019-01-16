/**
 * Delay before triggering an autocomplete, in milliseconds
 *
 * @const {number}
 */
const TYPING_TIMEOUT = 200;

/**
 * Minimum length of the user's query before triggering an autocomplete
 *
 * @const {number}
 */
const TYPING_MIN = 5;

export default {
    props: {
        value: Object,
        autofocus: Boolean,
        placeholder: String,
        autocompleter: Function,
        allowFreeValues: Boolean,
        min: Number,
    },
    data() {
        return {
            pendingRequest: null,
            typingTimeout: null,
            suggestions: [],
            selectedId: (this.value && this.value.id) || null,
            query: (this.value && this.value.label) || '',
            previousQuery: '',
            focused: false,
            indexOfHighlightedSuggestion: null,
        };
    },
    computed: {
        typingMin() {
            const min = parseInt(this.min, 10);
            if (Number.isNaN(min) || min <= 0) {
                return TYPING_MIN;
            }

            return min;
        },
    },
    mounted() {
        document.addEventListener('click', this.checkOutsideClick);
    },
    beforeDestroy() {
        if (this.typingTimeout !== null) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }
    },
    destroyed() {
        document.removeEventListener('click', this.checkOutsideClick);
    },
    methods: {
        onTyping() {
            // ignore key inputs that did not cause a change in the value of the query
            if (this.previousQuery === this.query) {
                return;
            }

            this.previousQuery = this.query;
            if (this.typingTimeout !== null) {
                clearTimeout(this.typingTimeout);
            }

            this.selectedId = null;
            this.$emit('input', null);
            this.setSuggestions([]);
            this.indexOfHighlightedSuggestion = null;
            this.typingTimeout = setTimeout(this.autocomplete, TYPING_TIMEOUT);
        },
        onFocus() {
            this.focused = true;
        },
        onBlur() {
            this.focused = false;

            if (this.pendingRequest !== null) {
                this.pendingRequest.abort();
            }

            if (this.selectedId === null) {
                if (this.allowFreeValues === true) {
                    this.$emit('input', {
                        id: null,
                        label: this.query,
                    });
                } else {
                    this.query = '';
                    this.previousQuery = '';
                }
            }

            this.setSuggestions([]);
        },
        onNavigation(event) {
            if (event.keyCode === 38) { // up arrow (= previous suggestion)
                if (this.indexOfHighlightedSuggestion - 1 < 0) {
                    this.indexOfHighlightedSuggestion = null;
                } else {
                    this.indexOfHighlightedSuggestion = this.indexOfHighlightedSuggestion - 1;
                }
            } else if (event.keyCode === 40) { // down arrow (= next suggestion)
                if (this.suggestions.length > 0) {
                    if (this.indexOfHighlightedSuggestion === null) {
                        this.indexOfHighlightedSuggestion = 0;
                    } else {
                        this.indexOfHighlightedSuggestion = Math.min(this.suggestions.length - 1, this.indexOfHighlightedSuggestion + 1);
                    }
                }
            } else if (event.keyCode === 13) { // key 'enter' (= select current suggestion)
                if (this.indexOfHighlightedSuggestion !== null) {
                    this.onSelect(this.suggestions[this.indexOfHighlightedSuggestion]);
                    this.$refs.input.blur();
                }
            } else {
                this.indexOfHighlightedSuggestion = null;
            }
        },
        onSuggestionClick(suggestion) {
            this.onSelect(suggestion);
        },
        onSelect(value) {
            const { id, label } = value;
            this.$emit('input', value);
            this.setSuggestions([]);
            this.selectedId = id;
            this.query = label;
            this.previousQuery = label;
        },
        autocomplete() {
            if (this.pendingRequest !== null) {
                this.pendingRequest.abort();
            }

            if (this.query.length < this.typingMin || this.focused !== true) {
                return;
            }

            this.pendingRequest = this.autocompleter(this.query);
            this.pendingRequest
                .then((suggestions) => {
                    if (this.focused === true) {
                        this.setSuggestions(suggestions);
                    }
                })
                .catch(() => {
                    this.pendingRequest = null;
                });
        },
        checkOutsideClick(event) {
            if (!this.$el.contains(event.target)) {
                this.setSuggestions([]);
            }
        },
        setSuggestions(suggestions) {
            this.suggestions = suggestions;

            if (this.suggestions.length > 0) {
                this.indexOfHighlightedSuggestion = 0;
            } else {
                this.indexOfHighlightedSuggestion = null;
            }
        },
    },
};
