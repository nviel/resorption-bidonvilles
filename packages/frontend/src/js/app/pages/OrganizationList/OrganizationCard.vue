<template>
    <div
        :class="[
            'rounded-sm cursor-pointer border border-cardBorder preventPrintBreak',
            isHover ? 'bg-blue200 border-transparent' : ''
        ]"
        @mouseenter="isHover = true"
        @mouseleave="isHover = false"
    >
        <router-link :to="`annuaire/${organization.id}`">
            <div class="p-4 flex">
                <div class="text-md font-bold w-1/2 pr-16">
                    {{ name }}
                </div>
                <ul class="flex-1 pl-16">
                    <li
                        v-for="user in organization.users.slice(0, 5)"
                        :key="user.id"
                    >
                        {{ user.last_name.toUpperCase() }}
                        {{ user.first_name }}
                        <Icon
                            icon="user-shield"
                            class="text-info"
                            v-if="user.role === 'local_admin'"
                        />
                    </li>
                    <li v-if="organization.users.length > 5">
                        +{{ organization.users.length }} contacts
                    </li>
                </ul>
                <Button
                    variant="primaryText"
                    icon="arrow-right"
                    :class="[
                        'text-display-sm self-end whitespace-no-wrap hover:underline -mb-4'
                    ]"
                    >{{ isHover ? "Voir la fiche complète" : "" }}</Button
                >
            </div>
        </router-link>
    </div>
</template>

<script>
export default {
    props: {
        organization: {
            type: Object
        }
    },
    data() {
        return {
            isHover: false
        };
    },
    computed: {
        name() {
            // Only display territory for associations
            if (this.organization.type.category === "association") {
                return `${this.organization.name} – ${this.organization.locationName}`;
            }

            if (this.organization.location.type === "nation") {
                return `${this.organization.name} – National`;
            }

            return this.organization.name.replace("-", "–");
        }
    }
};
</script>
