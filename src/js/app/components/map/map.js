/* eslint-disable no-underscore-dangle */

import L from "leaflet";
import pointOnFeature from "@turf/point-on-feature";
import Address from "#app/components/address/address.vue";
import { get as getConfig } from "#helpers/api/config";
import "leaflet-providers";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster/dist/leaflet.markercluster";

import waterYes from "../../../../../public/img/water-yes.png";
import utensils from "../../../../../public/img/utensils.png";
import waterNo from "../../../../../public/img/water-no.png";
import waterNull from "../../../../../public/img/water-null.png";

const DEFAULT_VIEW = [46.7755829, 2.0497727];
const POI_ZOOM_LEVEL = 13;
const REGION_MIN_ZOOM_LEVEL = 6;
const REGION_MAX_ZOOM_LEVEL = 8;
const DEPT_MAX_ZOOM_LEVEL = 10;

/* **************************************************************************************************
 * Ce composant fait apparaître une carte qui propose deux fonctionnalités distinctes :
 *
 * - la possibilité de faire apparaître une liste de bidonvilles sur la carte, chacun d'entre eux
 *   étant représenté par un marqueur dont la position est fixe (townMarker)
 *   Cette fonctionnalité vient avec une légende spécifique et la possibilité de faire apparaître ou
 *   non l'adresse des sites en question.
 *
 * - la possibilité de se déplacer sur la carte en recherchant une adresse via une barre de recherche
 *   avec autocomplétion (searchbar)
 ************************************************************************************************* */

export default {
    components: {
        Address
    },

    props: {
        /* *****************************
         * Options pour la liste des sites
         * ************************** */

        /**
         * Liste des bidonvilles à afficher
         *
         * @type {Array.<Shantytown>}
         */
        towns: {
            type: Array,
            required: false,
            default() {
                return [];
            }
        },

        /**
         * Liste des points d'interets à afficher
         *
         * @type {Array.<poi>}
         */
        pois: {
            type: Array,
            required: false,
            default() {
                return [];
            }
        },

        regions: {
            type: Array,
            required: false,
            default() {
                return [];
            }
        },

        departements: {
            type: Array,
            required: false,
            default() {
                return [];
            }
        },

        cities: {
            type: Array,
            required: false,
            default() {
                return [];
            }
        },

        /* *****************************
         * Options de la searchbar
         * ************************** */

        /**
         * Indique si la searchbar doit être affichée ou non
         *
         * @type {Boolean}
         */
        displaySearchbar: {
            type: Boolean,
            required: false,
            default: true
        },

        /**
         * Placeholder de la searchbar
         *
         * @type {String}
         */
        placeholder: {
            type: String,
            required: false,
            default: "Recherchez un lieu en saisissant une adresse"
        },

        /* *****************************
         * Options génériques
         * ************************** */

        /**
         * Centre et niveau de zoom par défaut de la carte
         *
         * @type {MapView}
         */
        defaultView: {
            type: Object,
            default: () => ({
                // basically, centering on France
                center: DEFAULT_VIEW,
                zoom: 6
            })
        }
    },

    data() {
        return {
            // Données de test
            regional_datas: [
                { code: 3, region: "Guyane", sites: 1 },
                { code: 11, region: "Île-de-France", sites: 179 },
                { code: 24, region: "Centre-Val de Loire", sites: 6 },
                { code: 27, region: "Bourgogne-Franche-Comté", sites: 1 },
                { code: 28, region: "Normandie", sites: 13 },
                { code: 32, region: "Hauts-de-France", sites: 114 },
                { code: 44, region: "Grand Est", sites: 2 },
                { code: 52, region: "Pays de la Loire", sites: 62 },
                { code: 53, region: "Bretagne", sites: 5 },
                { code: 75, region: "Nouvelle-Aquitaine", sites: 166 },
                { code: 76, region: "Occitanie", sites: 86 },
                { code: 84, region: "Auvergne-Rhône-Alpes", sites: 83 },
                { code: 93, region: "Provence-Alpes-Côte d'Azur", sites: 56 }
            ],

            // Données départementales
            departemental_datas: [
                { code: 5, departement: "Hautes-Alpes", sites: 1 },
                { code: 6, departement: "Alpes-Maritimes", sites: 4 },
                { code: 13, departement: "Bouches-du-Rhône", sites: 36 },
                { code: 14, departement: "Calvados", sites: 13 },
                { code: 21, departement: "Côte-d'Or", sites: 1 },
                { code: 26, departement: "Drôme", sites: 2 },
                { code: 30, departement: "Gard", sites: 1 },
                { code: 31, departement: "Haute-Garonne", sites: 67 },
                { code: 33, departement: "Gironde", sites: 164 },
                { code: 34, departement: "Hérault", sites: 13 },
                { code: 35, departement: "Ille-et-Vilaine", sites: 5 },
                { code: 36, departement: "Indre", sites: 1 },
                { code: 37, departement: "Indre-et-Loire", sites: 1 },
                { code: 38, departement: "Isère", sites: 27 },
                { code: 41, departement: "Loir-et-Cher", sites: 1 },
                { code: 44, departement: "Loire-Atlantique", sites: 53 },
                { code: 45, departement: "Loiret", sites: 3 },
                { code: 49, departement: "Maine-et-Loire", sites: 8 },
                { code: 57, departement: "Moselle", sites: 2 },
                { code: 59, departement: "Nord", sites: 89 },
                { code: 62, departement: "Pas-de-Calais", sites: 25 },
                { code: 63, departement: "Puy-de-Dôme", sites: 7 },
                { code: 66, departement: "Pyrénées-Orientales", sites: 5 },
                { code: 69, departement: "Rhône", sites: 39 },
                { code: 74, departement: "Haute-Savoie", sites: 8 },
                { code: 75, departement: "Paris", sites: 1 },
                { code: 77, departement: "Seine-et-Marne", sites: 15 },
                { code: 78, departement: "Yvelines", sites: 9 },
                { code: 83, departement: "Var", sites: 5 },
                { code: 84, departement: "Vaucluse", sites: 10 },
                { code: 85, departement: "Vendée", sites: 1 },
                { code: 86, departement: "Vienne", sites: 1 },
                { code: 87, departement: "Haute-Vienne", sites: 1 },
                { code: 91, departement: "Essonne", sites: 31 },
                { code: 92, departement: "Hauts-de-Seine", sites: 6 },
                { code: 93, departement: "Seine-Saint-Denis", sites: 50 },
                { code: 94, departement: "Val-de-Marne", sites: 41 },
                { code: 95, departement: "Val-d'Oise", sites: 26 },
                { code: 973, departement: "Guyane", sites: 1 }
            ],

            /**
             * La couche régionale
             *
             * @type {L.geoJSON}
             */
            regionalLayer: L.geoJSON(),

            /**
             * La couche départementale
             *
             * @type {L.geoJSON}
             */
            departementalLayer: L.geoJSON(),

            /**
             * La carte
             *
             * @type {L.Map}
             */
            map: null,

            /**
             * Groupement de markers
             *
             * @type {Object.<String, L.markerClusterGroup>}
             */
            markersGroup: {
                towns: L.markerClusterGroup(),
                search: L.markerClusterGroup(),
                pois: L.markerClusterGroup({
                    disableClusteringAtZoom: POI_ZOOM_LEVEL
                })
            },

            /**
             * Search marker
             *
             * @type {L.Marker}
             */
            searchMarker: this.createSearchMarker(),

            /**
             * Town marker that was marked as a search result
             *
             * @type {L.Marker}
             */
            townSearchMarker: null,

            /**
             * Town markers
             *
             * @type {Array.<L.Marker>}
             */
            townMarkers: [],

            /**
             * POI markers
             *
             * @type {Array.<L.Marker>}
             */
            poiMarkers: [],

            /**
             * POI markers visible
             *
             * @type Boolean
             */
            poiMarkersVisible: false,

            /**
             * Town markers, hashed by coordinates
             *
             * @type {Object.<String, DOMElement>}
             */
            hashedTownMarkers: {},

            /**
             * Valeur de la searchbar
             *
             * @type {Address}
             */
            address: null,

            /**
             * Indique s'il faut afficher les adresses des sites sur la carte ou non
             *
             * Cette valeur est contrôlée par une checkbox directement sur la carte
             *
             * @type {Boolean}
             */
            showAddresses: false,

            /**
             * Liste des types de terrains existants
             *
             * @type {Array.<FieldType>}
             */
            fieldTypes: getConfig().field_types
        };
    },

    computed: {
        /**
         * Codes couleur des types de terrain, hashés par id
         *
         * @returns {Object.<String, String>}
         */
        fieldTypeColors() {
            if (!this.fieldTypes) {
                return {};
            }

            return this.fieldTypes.reduce(
                (acc, fieldType) =>
                    Object.assign(acc, {
                        [fieldType.id]: fieldType.color
                    }),
                {}
            );
        },

        /**
         * Liste des fonds de carte disponibles
         *
         * @returns {Object.<String, L.TileLayer>}
         */
        mapLayers() {
            return {
                Satellite: L.tileLayer.provider("Esri.WorldImagery"),
                Dessin: L.tileLayer.provider("OpenStreetMap.Mapnik")
            };
        }
    },

    watch: {
        /**
         * Met à jour la liste des marqueurs de site
         */
        towns() {
            this.syncTownMarkers();
        },

        pois() {
            this.syncPOIMarkers();
        },

        /**
         * Affiche/masque les adresses des sites
         *
         * @returns {undefined}
         */
        showAddresses() {
            if (this.showAddresses === true) {
                document.body.setAttribute("class", "leaflet-show-addresses");
            } else {
                document.body.setAttribute("class", "");
            }
        },

        /**
         * Ajoute un résultat de recherche sur la carte
         *
         * @returns {undefined}
         */
        address() {
            if (this.address === null) {
                this.clearSearchMarker();
                return;
            }

            const {
                coordinates: [lon, lat],
                label,
                addressType: type
            } = this.address;
            this.centerMap([lat, lon], 20);

            this.$nextTick(() => {
                this.setSearchMarker(type, label, [lat, lon]);
            });
        }
    },

    mounted() {
        this.createMap();
        this.syncTownMarkers();
    },

    methods: {
        /**
         * Initialise tous les contrôles de la carte
         *
         * @returns {undefined}
         */
        setupMapControls() {
            this.setupZoomControl();
            this.setupLayersControl();
            this.setupAddressTogglerControl();
            this.setupFieldTypesLegendControl();
        },

        /**
         * Initialise le contrôle "Zoom"
         *
         * @returns {undefined}
         */
        setupZoomControl() {
            this.map.zoomControl.setPosition("bottomright");
        },

        /**
         * Initialise le contrôle "Fonds de carte"
         *
         * @returns {undefined}
         */
        setupLayersControl() {
            const layersControl = L.control.layers(this.mapLayers, undefined, {
                collapsed: false
            });

            this.map.addControl(layersControl);
        },

        /**
         * Initialise le contrôle "Voir les adresses des sites"
         *
         * @returns {undefined}
         */
        setupAddressTogglerControl() {
            const { adressToggler } = this.$refs;
            const AddressToggler = L.Control.extend({
                options: {
                    position: "bottomleft"
                },

                onAdd() {
                    return adressToggler;
                }
            });

            this.map.addControl(new AddressToggler());
        },

        /**
         * Initialise le contrôle "Légende"
         *
         * @returns {undefined}
         */
        setupFieldTypesLegendControl() {
            const { legends } = this.$refs;
            const Legend = L.Control.extend({
                options: {
                    position: "bottomleft"
                },

                onAdd() {
                    return legends;
                }
            });

            this.map.addControl(new Legend());
        },

        /**
         * Initialise tous les clusters de markers
         *
         * @returns {undefined}
         */
        setupMarkerGroups() {
            this.map.addLayer(this.markersGroup.towns);
            this.map.addLayer(this.markersGroup.search);
            this.map.addLayer(this.markersGroup.pois);
        },

        /**
         * Met en place la vue par défaut sur la carte
         *
         * @returns {undefined}
         */
        setupView() {
            const { center, zoom } = this.defaultView;
            this.centerMap(center, zoom);
        },

        /**
         * Crée la carte et initialise sa vue et ses contrôles
         *
         * Attention, cette méthode n'initialise pas le contenu (les markers) de la carte !
         *
         * @returns {undefined}
         */
        createMap() {
            this.map = L.map("map", {
                layers: this.mapLayers.Dessin, // fond de carte par défaut
                scrollWheelZoom: false // interdire le zoom via la molette de la souris
            });

            this.map.on("zoomend", this.onZoomEnd);

            this.setupMapControls();
            this.setupMarkerGroups();
            this.setupView();
            this.loadRegionalData();
            this.loadDepartementalData();
            this.onZoomEnd();
        },

        /**
         * Affiche les points d'interet à partir d'un certain niveau de zoom
         *
         * @returns {undefined}
         */
        onZoomEnd() {
            const zoomLevel = this.map.getZoom();

            if (
                zoomLevel >= REGION_MIN_ZOOM_LEVEL &&
                zoomLevel <= REGION_MAX_ZOOM_LEVEL
            ) {
                // Afficher les markers régionaux
                this.removeAllTownMarkers();
                this.removeAllPOIMarkers();
                this.showRegionalLayer();
            } else if (
                zoomLevel > REGION_MAX_ZOOM_LEVEL &&
                zoomLevel <= DEPT_MAX_ZOOM_LEVEL
            ) {
                // Afficher les markers départementaux
                this.removeAllTownMarkers();
                this.removeAllPOIMarkers();
                this.showDepartementalLayer();
            } else {
                this.removeDepartementalAndRegionalLayers();
                this.syncTownMarkers();
            }

            if (!this.poiMarkersVisible && zoomLevel > POI_ZOOM_LEVEL) {
                this.poiMarkersVisible = true;
                this.pois.forEach(this.createPOIMarker);
            } else if (this.poiMarkersVisible && zoomLevel <= POI_ZOOM_LEVEL) {
                this.poiMarkersVisible = false;
                this.removeAllPOIMarkers();
            }
        },

        /**
         * Supprime et recrée la liste des marqueurs de site
         *
         * @returns {undefined}
         */
        syncTownMarkers() {
            this.removeAllTownMarkers();
            this.towns.forEach(this.createTownMarker);
        },

        /**
         * Supprime et recrée la liste des marqueurs de site
         *
         * @returns {undefined}
         */
        syncPOIMarkers() {
            this.removeAllPOIMarkers();
            if (this.poiMarkersVisible) {
                this.pois.forEach(this.createPOIMarker);
            }
        },

        /**
         * Supprime tous les marqueurs de site existants
         *
         * @returns {undefined}
         */
        removeAllTownMarkers() {
            this.markersGroup.towns.clearLayers();
            this.townMarkers = [];
            this.hashedTownMarkers = {};
        },

        /**
         * Supprime tous les marqueurs de site existants
         *
         * @returns {undefined}
         */
        removeAllPOIMarkers() {
            this.markersGroup.pois.clearLayers();
            this.poiMarkers = [];
        },

        /**
         * Supprime tous les marqueurs de site sur le layer regional
         *
         * @returns {undefined}
         */
        removeAllRegionsMarkers() {
            this.markersGroup.regions.clearLayers();
            this.regionsMarkers = [];
        },

        /**
         * Supprime tous les marqueurs de site sur le layer departemental
         *
         * @returns {undefined}
         */
        removeAllDepartmentsMarkers() {
            this.markersGroup.departments.clearLayers();
            this.departmentsMarkers = [];
        },

        getTownAddress(town) {
            return town.usename;
        },

        getTownCoordinates(town) {
            const { latitude, longitude } = town;
            return [latitude, longitude];
        },

        getTownColor(town) {
            if (town.fieldType !== undefined) {
                return this.fieldTypeColors[town.fieldType.id];
            }

            return "#cccccc";
        },

        getTownWaterImage(town) {
            if (town.accessToWater === true) {
                return waterYes;
            }

            if (town.accessToWater === false) {
                return waterNo;
            }

            return waterNull;
        },

        /**
         * Crée le marqueur de résultat de recherche
         *
         * @returns {L.Marker}
         */
        createSearchMarker() {
            return L.marker(DEFAULT_VIEW, {
                title: "A",
                icon: L.divIcon({
                    className: "leaflet-marker",
                    html: `<span class="mapPin mapPin--result">
                        <span class="mapPin-wrapper">
                            <span class="mapPin-marker" style="background-color: red"></span>
                        </span>
                        <span class="mapPin-address"></span>
                    </span>`,
                    iconAnchor: [13, 28]
                })
            });
        },

        /**
         * Crée un marqueur de site et l'ajoute sur la carte
         *
         * @param {Shantytown} town
         *
         * @returns {undefined}
         */
        createTownMarker(town) {
            const address = this.getTownAddress(town);
            const coordinates = this.getTownCoordinates(town);
            const color = this.getTownColor(town);
            const waterImage = this.getTownWaterImage(town);

            const marker = L.marker(coordinates, {
                title: town.address,
                icon: L.divIcon({
                    className: "leaflet-marker",
                    html: `<span class="mapPin mapPin--shantytown">
                        <span class="mapPin-wrapper">
                            <span class="mapPin-water"><img src="${waterImage}" /></span>
                            <span class="mapPin-marker" style="background-color: ${color}"></span>
                        </span>
                        <span class="mapPin-address">${address}</span>
                    </span>`,
                    iconAnchor: [13, 28]
                })
            });
            marker.on("click", this.handleTownMarkerClick.bind(this, town));
            marker.on("add", () => {
                if (marker.searchResult === true) {
                    this.markTownAsSearchResult(marker);
                }
            });

            marker.addTo(this.markersGroup.towns);
            this.townMarkers.push(marker);
            this.hashedTownMarkers[coordinates.join(";")] = marker;
        },

        /**
         * Crée un marqueur de site et l'ajoute sur la carte
         *
         * @param {Shantytown} town
         *
         * @returns {undefined}
         */
        createPOIMarker(poi) {
            // Longitude/latitudes returned by soliguide are in the wrong order
            const coordinates = poi.location.coordinates.reverse();

            const marker = L.marker(coordinates, {
                title: poi.address,
                icon: L.divIcon({
                    className: "leaflet-marker",
                    html: `<span class="mapPin mapPin--poi" >
                        <span class="mapPin-wrapper">
                            <img src="${utensils}" width="12" height="12"/>
                        </span>
                        <span class="mapPin-address">${poi.address}</span>
                    </span>`,
                    iconAnchor: [13, 28]
                })
            });
            marker.on("click", this.handlePOIMarkerClick.bind(this, poi));

            marker.addTo(this.markersGroup.pois);

            this.poiMarkers.push(marker);
        },

        /**
         * Gère un clic sur un marqueur de site
         *
         * @param {L.Marker} marker
         * @param {Event}    event
         *
         * @returns {undefined}
         */
        handleTownMarkerClick(marker, event) {
            this.$emit("town-click", marker, event);
        },

        /**
         * Gère un clic sur un marqueur de point d'interet
         *
         * @param {L.Marker} marker
         * @param {Event}    event
         *
         * @returns {undefined}
         */
        handlePOIMarkerClick(marker, event) {
            this.$emit("poi-click", marker, event);
        },

        /**
         * Met à jour le centre et le zoom de la carte
         *
         * @param {MapCoordinates} coordinates
         * @param {Number}         zoom
         *
         * @returns {undefined}
         */
        centerMap(coordinates, zoom) {
            this.map.setView(coordinates, zoom);
        },

        /**
         * Force un redimensionnement de la carte pour prendre toute la place disponible
         *
         * @returns {undefined}
         */
        resize() {
            if (this.map === null) {
                return;
            }

            this.map.invalidateSize(true);
        },

        clearSearchMarker() {
            if (this.townSearchMarker !== null) {
                if (this.townSearchMarker._icon) {
                    this.townSearchMarker._icon
                        .querySelector(".mapPin")
                        .classList.remove("mapPin--result");
                }

                this.townSearchMarker.searchResult = false;
                this.townSearchMarker = null;
                return;
            }

            this.searchMarker.remove();
        },

        getMatchingTownMarker(coordinates) {
            return this.hashedTownMarkers[coordinates.join(";")] || null;
        },

        markTownAsSearchResult(marker) {
            this.townSearchMarker = marker;
            this.townSearchMarker.searchResult = true;
            marker._icon
                .querySelector(".mapPin")
                .classList.add("mapPin--result");
        },

        setSearchMarker(type, address, coordinates) {
            this.clearSearchMarker();

            // check if there is a marker existing at that exact address
            const townMarker = this.getMatchingTownMarker(coordinates);
            if (townMarker !== null) {
                this.markTownAsSearchResult(townMarker);
                return;
            }

            this.searchMarker.addTo(this.markersGroup.search);
            this.searchMarker.setLatLng(coordinates);

            this.searchMarker._icon.querySelector(
                ".mapPin-address"
            ).innerHTML = address;

            let action = "add";
            if (type !== "housenumber") {
                action = "remove";
            }

            this.searchMarker._icon
                .querySelector(".mapPin")
                .classList[action]("mapPin--street");
        },

        /*------------------------------------------------------------------------*
         | DEBUT DES METHODES REQUISES POUR LA GESTION DES COUCHES DEPT ET REGION |
         *------------------------------------------------------------------------*/
        // Fonction de chargement des données geoJson régionales
        async loadRegionalData() {
            const response = await fetch(
                "https://rawgit.com/gregoiredavid/france-geojson/master/regions.geojson"
            );
            const datas = await response.json();
            this.regionalLayer = new L.geoJSON(datas, {
                onEachFeature: this.regionsOnEachFeature
            });
        },

        async regionsOnEachFeature(feature) {
            const nbSites = await this.getRegionSites(feature.properties.nom);
            // Calcul de la position du marqueur
            // On utilise la méthode pointOnFeature(), qui garantit que le point soit dans le polygone, plutôt que centroid()
            const markerPosition = pointOnFeature(feature);
            // Création du marqueur à partir de la long et lat retournées par pointOnFeature()
            const lon = markerPosition.geometry.coordinates[0];
            const lat = markerPosition.geometry.coordinates[1];
            this.circleWithText([lat, lon], nbSites, 20, 3, "region").addTo(
                this.regionalLayer
            );
        },

        // Retourne le nombre de site de la région dont le nom est passé en paramètre
        async getRegionSites(regionName) {
            let nbsites = 0;
            this.regions.forEach(region => {
                if (region.region === regionName) {
                    nbsites = region.sites;
                }
            });
            return nbsites;
        },

        // Fonction de chargement des données geoJson départementales
        async loadDepartementalData() {
            const pathToGeoJsonFile =
                "https://rawgit.com/gregoiredavid/france-geojson/master/departements.geojson";
            const response = await fetch(pathToGeoJsonFile);
            const datas = await response.json();
            this.departementalLayer = new L.geoJSON(datas, {
                onEachFeature: this.departementsOnEachFeature
            });
        },

        async departementsOnEachFeature(feature) {
            const nbSites = await this.getDepartementSites(
                feature.properties.nom
            );
            const siteLabel = nbSites > 1 ? "sites" : "site";
            // Calcul de la position du marqueur
            // On utilise la méthode pointOnFeature(), qui garantit que le point soit dans le polygone, plutôt que centroid()
            const markerPosition = pointOnFeature(feature);
            // Création du marqueur à partir de la long et lat retournées par pointOnFeature()
            const lon = markerPosition.geometry.coordinates[0];
            const lat = markerPosition.geometry.coordinates[1];
            this.circleWithText(
                [lat, lon],
                `<div><strong>${feature.properties.nom}</strong><br/>${nbSites} ${siteLabel}</div>`,
                45,
                3,
                "dept"
            ).addTo(this.departementalLayer);
        },

        // Retourne le nombre de site du département dont le nom est passé en paramètre
        async getDepartementSites(deptName) {
            let nbsites = 0;
            this.departements.forEach(dept => {
                if (dept.departement === deptName) {
                    nbsites = dept.sites;
                }
            });
            return nbsites;
        },

        showRegionalLayer() {
            this.removeDepartementalLayer();
            this.addRegionalLayer();
        },

        addRegionalLayer() {
            if (!this.map.hasLayer(this.regionalLayer)) {
                this.map.addLayer(this.regionalLayer);
                // this.regionalLayer.addTo(this.map);
            }
        },

        removeRegionalLayer() {
            if (this.map.hasLayer(this.regionalLayer)) {
                this.map.removeLayer(this.regionalLayer);
            }
        },

        showDepartementalLayer() {
            this.removeRegionalLayer();
            this.addDepartementalLayer();
        },

        addDepartementalLayer() {
            if (!this.map.hasLayer(this.departementalLayer)) {
                this.map.addLayer(this.departementalLayer);
                // departementalLayer.addTo(this.map);
            }
        },

        removeDepartementalLayer() {
            if (this.map.hasLayer(this.departementalLayer)) {
                this.map.removeLayer(this.departementalLayer);
            }
        },

        removeDepartementalAndRegionalLayers() {
            this.removeDepartementalLayer();
            this.removeRegionalLayer();
        },

        circleWithText(latLng, txt, radius, borderWidth, circleClass) {
            const size = radius * 2;
            const style =
                'style="width: ' +
                size +
                "px; height: " +
                size +
                "px; border-width: " +
                borderWidth +
                'px;"';
            const iconSize = size + borderWidth * 2;
            const icon = L.divIcon({
                html:
                    '<span class="' +
                    "circle " +
                    circleClass +
                    '" ' +
                    style +
                    ">" +
                    txt +
                    "</span>",
                className: "",
                iconSize: [iconSize, iconSize]
            });
            const marker = L.marker(latLng, {
                icon: icon
            });
            return marker;
        }
        /*----------------------------------------------------------------------*
         | FIN DES METHODES REQUISES POUR LA GESTION DES COUCHES DEPT ET REGION |
         *----------------------------------------------------------------------*/
    }
};

/**
 * @typedef {Array} MapCoordinates
 * @property {Float} [0] Latitude
 * @property {Float} [1] Longitude
 */

/**
 * @typedef {Object} MapView
 * @property {MapCoordinates} center Coordonnées géographiques du centre de la vue
 * @property {Number}         zoom   Niveau de zoom, voir la documentation de Leaflet
 */

/**
 * @typedef {Object} Address Une adresse au format adresse.data.gouv.fr
 * @property {String}         label       Adresse complète
 * @property {String}         city        Nom de la ville
 * @property {String}         citycode    Code communal (/!\ différent du code postal)
 * @property {MapCoordinates} coordinates Coordonnées géographiques
 */
