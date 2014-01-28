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
         * @param maxJump {number} Maximum jump distance we will calculate on the map, speeds up linking
         * jump platforms together
         */
        setMap: function (width, height, maxHeight, maxJump) {
            var start = Date.now(); // Used to record the total run time
            var ledges = []; // A collection
            var x, y, tile, ledge;
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
                        tile.x = x; // We have to record the x and y value for later when we loop through ledges, nasty but necessary
                        tile.y = y;
                        this.setConnection(tile);
                        ledges.push(tile);
                    }

                    this.map[y].push(tile);
                }
            }

            // Loop through all of our gathered ledges
            while (ledges.length > 0) {
                ledge = ledges.pop();
                this.setLedgeConnections(ledge, ledges, maxJump);
                // Look for relationships between ledges
                // Angled drop test to discover jump points
                // Identify fall points

            }

            if (this.debug) console.log('Movement pre-cache time', Date.now() - start, 'ms');

            return this;
        },

        /**
         * Loops through and checks for a relationship between ledges
         * @param l {object} The ledge itself
         * @param ledges {array|object} An array of ledge objects
         * @param maxJump {number} Maximum jump we'll look for (determines search distance on ledges)
         */
        setLedgeConnections: function (l, ledges, maxJump) {
            var startX, endX, startY, endY;

            // We need to pre-cache a search area to look
            // Determine x direction to look in
            if (l.direction === 1) {
                startX = l.x;
                endX = l.x + maxJump + 1; // Fix max jumps, computers start counting from 0
            } else if (l.direction === -1) {
                startX = l.x - maxJump - 1;
                endX = l.x;
            } else {
                startX = l.x - maxJump - 1;
                endX = l.x + maxJump + 1;
            }

            // Determine y direction to look
            startY = l.y - maxJump;
            endY = l.y + maxJump;

            for (var i = 0, len = ledges.length; i < len; i++) {
                if (l.x !== ledges[i].x && // Skip same x index
                    (l.direction !== ledges[i].direction || ledges[i].direction === 0) && // Do the directions align?
                    ledges[i].x > startX && ledges[i].x < endX && ledges[i].y > startY && ledges[i].y < endY && // Inside search area?
                    jp.jump.isJumpPossible(l.x, l.y, ledges[i].x, ledges[i].y)) {

                    // We have a positive, link both
                    l.connections.push(ledges[i].id);
                    ledges[i].connections.push(l.id);

                    // @TODO If debug is on draw a line between both points
                    if (this.debug) {
                        jp.draw.setLine(l.x, l.y, ledges[i].x, ledges[i].y, '#0f0');
                    }
                }
            }

            return this;
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