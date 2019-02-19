/* ****************************************************************************************************
 * Dependencies
 **************************************************************************************************** */

// leaflet, our brilliant mapping tool
import L from 'leaflet';
import 'leaflet-providers';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/leaflet.markercluster';


/* ****************************************************************************************************
 * Configuration
 **************************************************************************************************** */

/**
 * GPS coordinates of the center of France
 *
 * @type {GpsPoint}
 * @readonly
 */
const DEFAULT_VIEW = [46.7755829, 2.0497727];

/**
 * Zoom delta
 *
 * @type {number}
 * @readonly
 */
const ZOOM_DELTA = 1.5;

/**
 * Zoom level when centering on a tracker
 *
 * The zoom level that should be used when centering the map on the
 * tracker.
 *
 * @type {number}
 * @readonly
 */
const TRACKER_ZOOM = 16;

/**
 * @typedef {Array.<number>} GpsPoint
 * An array containing two numbers: the latitude, and the longitude, in that order.
 */


/* ****************************************************************************************************
 * Definition
 **************************************************************************************************** */

export default {

    props: {
        /**
         * List of towns to be added to the map
         *
         * @type {Array.<Town>}
         */
        towns: {
            type: Array,
            required: false,
            default() {
                return [];
            },
        },

        /**
         * Default view of the map
         *
         * @type {Object}
         */
        defaultView: {
            type: Object,
            required: false,
            default: () => ({
                // basically, centering on France
                center: DEFAULT_VIEW,
                zoom: 6,
            }),
        },

        /**
         * Wether a tracker should be shown on the map
         *
         * The tracker is a marker that can be moved by the user,
         * and which GPS coordinates can be accessed.
         *
         * @type {Boolean}
         */
        useTracker: {
            type: Boolean,
            required: false,
            default: false,
        },

        /**
         * GPS coordinates of the tracker
         *
         * Used only if the property useTracker is set to true, obviously.
         *
         * @type {GpsPoint|null}
         */
        value: {
            type: Array,
            required: false,
            default: null,
        },
    },


    data() {
        // please note that most of the instances are created later, after the component is mounted
        // the reason is that the Map instance relies on DOM elements

        return {
            /**
             * Leaflet map instance
             *
             * @type {Leaflet.Map}
             */
            map: null,

            /**
             * Group of markers
             *
             * An extension to leaflet used to automatically generate clusters of
             * markers, depending on the zoom level.
             *
             * @type {Leaflet.MarkerClusterGroup}
             */
            cluster: null,

            /**
             * Tracker
             *
             * The tracker is a marker that can be moved by the user,
             * and which GPS coordinates can be accessed.
             *
             * @type {Leaflet.Marker}
             */
            tracker: null,

            /**
             * Tile layers instances
             *
             * @type {Object.<string, Leaflet.MapLayer>}
             */
            layers: null,

            /**
             * The list of markers
             *
             * The tracker is not part of this list.
             *
             * @type {Array.<Leaflet.Marker>}
             */
            markers: this.markers,
        };
    },


    watch: {
        towns() {
            this.syncTheMarkers();
        },
        useTracker() {
            this.syncTheTracker();
        },
        value() {
            let zoomLevel = TRACKER_ZOOM;
            if (this.value !== null) {
                // if the tracker does not need to be moved, do not change the zoom level
                const { lat, lng } = this.tracker.getLatLng();
                if (lat === this.value[0] && lng === this.value[1]) {
                    zoomLevel = null;
                }

                this.tracker.setLatLng(this.value);
            }

            this.syncTheTracker(zoomLevel);
        },
    },


    mounted() {
        this.createMap();
        this.setupTheMarkers();
        this.setupTheTracker();
    },


    beforeDestroy() {
        this.layers = null;
    },


    methods: {

        /**
         * Creates the map instance
         *
         * Called once, on mount.
         */
        createMap() {
            const layers = this.getLayers();

            // create the map
            this.map = L.map('map', {
                layers: [layers.Dessin],
                scrollWheelZoom: false,
                zoomDelta: ZOOM_DELTA,
            });

            const { center, zoom } = this.defaultView;
            this.map.setView(center, zoom);

            // setup the controls
            this.map.zoomControl.setPosition('bottomright');
            L.control.layers(layers, undefined, { collapsed: false }).addTo(this.map);
        },

        /**
         * Initializes the markers
         */
        setupTheMarkers() {
            // create the cluster
            this.cluster = L.markerClusterGroup();
            this.map.addLayer(this.cluster);

            // sync the markers
            this.syncTheMarkers();
        },

        /**
         * Resets the markers on the map and sync them to the data
         */
        syncTheMarkers() {
            this.removeAllMarkers();
            this.towns.forEach(this.addMarker);
        },

        /**
         * Resets the markers
         */
        removeAllMarkers() {
            this.cluster.clearLayers();
            this.markers = [];
        },

        /**
         * Adds a marker to the map
         *
         * @param {Town} town
         */
        addMarker(town) {
            const { latitude, longitude } = town;
            const marker = L.marker([latitude, longitude], {
                title: town.address,
            });
            this.cluster.addLayer(marker);

            marker.on('click', this.handleMarkerClick.bind(this, town));
            this.markers.push(marker);
        },

        /**
         * Handles a click on a marker
         *
         * Basically, notifies the event.
         *
         * @param {Town}  town
         * @param {Event} event
         */
        handleMarkerClick(town, event) {
            this.$emit('town-click', town, event);
        },

        /**
         * Initializes the tracker maker
         */
        setupTheTracker() {
            // create the tracker
            this.tracker = L.marker(this.value || DEFAULT_VIEW, {
                draggable: true,
            });

            // listen to changes in the position marker
            this.tracker.addEventListener('dragend', this.onTrackerDrag);
            this.map.addEventListener('click', (event) => {
                const { lat, lng } = event.latlng;
                this.tracker.setLatLng([lat, lng]);
                this.map.setView([lat, lng], this.map.getZoom());
                this.$emit('input', [lat, lng]);
            });

            // sync it
            this.syncTheTracker();
        },

        /**
         * Shows or hides the tracker, depending on the property useTracker
         *
         * @param {number|null} zoom Zoom level to be applied (if null, conserves the current zoom level)
         */
        syncTheTracker(zoom = null) {
            if (this.value === null || this.useTracker !== true) {
                this.tracker.remove();
            } else {
                this.tracker.addTo(this.map);
                this.map.setView(this.value, zoom === null ? this.map.getZoom() : zoom);
            }
        },

        /**
         * Handles a new position of the tracker, after a drag event
         */
        onTrackerDrag() {
            const { lat, lng } = this.tracker.getLatLng();
            this.$emit('input', [lat, lng]);
        },

        /**
         * Forces the map to stretch to full size
         *
         * Useful after a window resize event.s
         */
        resize() {
            this.map.invalidateSize(true);
        },

        /**
         * Returns all the tile layers
         *
         * If no instance of the tile layers is available, will create them.
         *
         * @returns {Object.<string, Leaflet.MapLayer>}
         */
        getLayers() {
            if (this.layers === null) {
                this.layers = {
                    Satellite: L.tileLayer.provider('Esri.WorldImagery'),
                    Dessin: L.tileLayer.provider('Wikimedia'),
                };
            }

            return this.layers;
        },
    },

};
