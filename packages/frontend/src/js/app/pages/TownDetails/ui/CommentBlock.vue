<template>
    <div class="border-t border-G400 py-4">
        <div class="text-G600 text-sm mb-1">
            {{ formatDate(comment.createdAt, "d M y à h:i") }}
        </div>
        <div
            class="text-G600 text-sm mb-1"
            v-if="comment.covid && comment.covid.date"
        >
            Date de l'intervention:
            {{ formatDate(comment.covid.date, "d M y à h:i") }}
        </div>
        <div v-if="comment.private" class="font-bold">
            <Icon icon="lock" class="text-red" />
            Message réservé aux membres de la préfecture et DDCS de votre
            territoire.
        </div>
        <div class="text-primary font-bold mb-1">
            <Icon icon="user" /> {{ comment.createdBy.first_name }}
            {{ comment.createdBy.last_name }} -
            {{ comment.createdBy.organization }}
        </div>
        <div class="ml-5">
            <div class="flex flex-wrap">
                <Tag
                    v-if="!!comment.covid"
                    variant="withoutBackground"
                    :class="['inline-block', 'bg-red', 'text-white']"
                    >Covid-19</Tag
                >
                <CovidTag
                    v-for="tag in covidTags"
                    :key="tag.prop"
                    :class="['mr-2', 'mb-2']"
                    :tag="tag"
                />
            </div>
            <div>{{ comment.description }}</div>
        </div>
    </div>
</template>

<script>
import CovidTag from "#app/components/CovidTag/CovidTag.vue";
import covidTags from "#app/pages/covid/covidTags";

export default {
    components: {
        CovidTag
    },
    props: {
        comment: {
            type: Object
        }
    },
    methods: {
        /**
         * @see index.js
         */
        formatDate(...args) {
            return window.App.formatDate.apply(window, args);
        }
    },
    computed: {
        covidTags: function() {
            if (!this.comment || !this.comment.covid) {
                return [];
            }

            return covidTags.filter(t => {
                return !!this.comment.covid[t.prop];
            });
        }
    }
};
</script>
