// @TODO Break up movement code into easier to digest API commands
// @TODO Break up clearance code into easier to digest API commands
var jp = jp || {};

$(document).ready(function () {
    var _private = {

    };

    jp.movement = {
        map: null, // An array of all existing movement tiles
        debug: false, // Real time updates for movement tiles
        maxHeight: null, // Maximum supported height we'll use for clearance to cut down on search time
        connectionLib: null, // Id references for our edges in connections
        connectionId: null,

        /**
         * Sets clearance values, reliant on the Map API to have collision data set
         * @param width Width of the map
         * @param height Height of the map
         * @param maxHeight {number} Maximum height we will support for movement paths
         */
        setMap: function (width, height, maxHeight) {
            var start = Date.now(); // Used to record the total run time
            var edges = []; // A collection
            var x, y, tile, tileId;
            this.maxHeight = maxHeight;
            this.connectionLib = {};
            this.connectionId = 0;

            // Build initial map while discovering locations of walkways and ledges
            this.map = [];
            for (y = 0; y < height; y++) {
                this.map.push([]);
                for (x = 0; x < width; x++) {
                    tile = {};

                    // Set movement tiles depending upon the discovered type
                    switch (this.getTileMoveType(x, y)) {
                        case 'blocked':
                            tile.type = 0;
                            break;
                        case 'walkway':
                            tile.type = 1;
                            tile.cost = 1;
                            tile.clearance = jp.clearance.getFlatValue(x, y, this.maxHeight); // Maximum clearance support
                            break;
                        case 'ledge-right':
                            tile.type = 2; // Indicates a potential jump pad
                            tile.cost = 1;
                            tile.clearance = jp.clearance.getFlatValue(x, y, this.maxHeight); // Maximum clearance support
                            tile.direction = 1; // Right facing
                            break;
                        case 'ledge-left':
                            tile.type = 2;
                            tile.cost = 1;
                            tile.clearance = jp.clearance.getFlatValue(x, y, this.maxHeight); // Maximum clearance support
                            tile.direction = -1; // Left facing
                            break;
                        case 'ledge-both':
                            tile.type = 2;
                            tile.cost = 1;
                            tile.clearance = jp.clearance.getFlatValue(x, y, this.maxHeight); // Maximum clearance support
                            tile.direction = 0; // Facing both directions
                            break;
                        default:
                            break;
                    }

                    // We need to record edges by reference id and in a tmp array for further processing
                    if (tile.type === 2) {
                        tile.id = this.getConnectionId();
                        tile.connections = [];
                        console.log(tile);
                        this.setConnection(tile);
                        edges.push(tile);
                    }

                    this.map[y].push(tile);
                }
            }

            // Loop through all of our gathered ledges
            for (var i = 0, len = edges.length; i < len; i++) {
                // Look for relationships between ledges
                // Angled drop test to discover jump points
                // Identify fall points
            }
        },

        setConnection: function (tile) {
            this.connectionLib[tile.id] = tile;
            return this;
        },

        getConnectionId: function () {
            return this.connectionId += 1;
        },

        /**
         * Crawls through data from the collision map to discover ledges and walkways (movable tile types)
         * @param x
         * @param y
         */
        getTileMoveType: function (x, y) {
            var type;

            // Check if the tile not blocked, has a standing tile below, and not out of bounds
            if (!jp.map.blocked(x, y) && jp.map.blocked(x, y + 1) && !jp.map.outOfBounds(x, y + 1)) {

                // Walkway check
                if (jp.map.blocked(x + 1, y + 1) && jp.map.blocked(x - 1, y + 1)) {
                    type = 'walkway';

                // Ledge facing right
                } else if (jp.map.blocked(x - 1, y + 1)) {
                    type = 'ledge-right';

                // Ledge facing left
                } else if (jp.map.blocked(x + 1, y + 1)) {
                    type = 'ledge-left';

                // Ledge empty on both sides
                } else {
                    type = 'ledge-both';
                }

            // Must be a blank tile
            } else {
                type = 'blocked';
            }

            return type;
        },

        /**
         * Retrieve the data for a specific tile
         * @param x
         * @param y
         * @returns {*}
         */
        getTile: function (x, y) {
            return this.map[y][x];
        },



        setTile: function (x, y, value) {

        }
    };
});