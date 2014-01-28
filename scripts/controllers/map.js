var jp = jp || {};

$(document).ready(function () {
    var _private = {
        outOfBounds: function (x, y) {
            return x < 0 || x >= jp.map.dataCollision[0].length ||
                y < 0 || y >= jp.map.dataCollision.length;
        },

        recursiveClearance: function (xStart, yStart, distance) {
            if (jp.map.isEdgeOpen(xStart, yStart, distance)) {
                return _private.recursiveClearance(xStart, yStart, distance + 1);
            }

            // New distance failed, return it to the previous value
            return distance - 1;
        }
    };

    jp.map = {
        dataCollision: null, // Current map with collision tiles (0 or 1)
        dataClearance: null, // Post processed dataCollision map with clearance
        dataMovePaths: null,

        setData: function (map) {
            this.dataCollision = map;

            // @TODO Temorarily disabled due to bugs
            return this.updateClearance();
//                .updateMovePaths(parseInt($('#input-move-clearance').val(), 10));
        },

        /**
         * Each tile needs to have a square drawn around it from the top left to bottom right. In order to verify
         * clearance capacity
         * @IMPORTANT This should only be done when initially loading the map or updating existing map
         * @TODO Not a bad idea to break the map into sub-quadrants for detecting changes
         */
        updateClearance: function () {
            var x, y,  width = this.getWidthInTiles(), height = this.getHeightInTiles();

            this.dataClearance = [];

            for (y = 0; y < height; y++) {
                this.dataClearance.push([]);
                for (x = 0; x < width; x++) {
                    // Recursively check clearance until false is return
                    // set clearance equal to number of recursive checks
                    this.dataClearance[y].push(_private.recursiveClearance(x, y, 1));
                }
            }

            return this;
        },

        /**
         * @TODO This is such a mess, should be moved into its own API file
         * @param maxHeight
         * @returns {jp.map}
         */
        updateMovePaths: function (maxHeight) {
            var start = Date.now();
            var x, y, cY,  width = this.getWidthInTiles(), height = this.getHeightInTiles(), clearance;
            var edges = [];
            var tmp;

            this.dataMovePaths = [];

            // Discover locations of walkways and jumps
            for (y = 0; y < height; y++) {
                this.dataMovePaths.push([]);

                for (x = 0; x < width; x++) {
                    // record open tiles with a closed tile directly below
                    if (!this.blocked(x, y) && this.blocked(x, y + 1) && !_private.outOfBounds(x, y + 1)) {
                        // get clearance value by going up until we hit a blocked tile or "maxHeight", record the clearance
                        for (cY = y, clearance = 0; cY >= 0; cY--) {
                            clearance = this.dataClearance[cY][x];
                            if (this.blocked(x, cY - 1) || clearance >= maxHeight) break;
                        }

                        // if the bottom right or left corner is missing a tile mark it as a ledge
                        if (this.blocked(x + 1, y + 1) && this.blocked(x - 1, y + 1)) {
                            this.dataMovePaths[y].push({ type: 1, clearance: clearance, x: x, y: y });
                        } else if (!this.blocked(x + 1, y + 1) && !this.blocked(x - 1, y + 1)) {
                            tmp = { type: 2, clearance: clearance, direction: 0, cost: 1, connections: [], x: x, y: y };
                            edges.push(tmp);
                            this.dataMovePaths[y].push(tmp);
                        } else if (this.blocked(x - 1, y + 1)) {
                            tmp = { type: 2, clearance: clearance, direction: 1, cost: 1, connections: [], x: x, y: y };
                            edges.push(tmp);
                            this.dataMovePaths[y].push(tmp);
                        } else {
                            tmp = { type: 2, clearance: clearance, direction: -1, cost: 1, connections: [], x: x, y: y };
                            edges.push(tmp);
                            this.dataMovePaths[y].push(tmp);
                        }

                    } else {
                        this.dataMovePaths[y].push({ type: 0 });
                    }
                }
            }

            // Loop through all collected edges and attempt to connect them if possible
            var maxJump = parseInt($('#input-max-jump').val(), 10), startX, endX, startY, endY;
            for (var i = 0, len = edges.length; i < len; i++) {

                // Determine x look direction
                if (edges[i].direction === 1) {
                    startX = edges[i].x;
                    endX = edges[i].x + maxJump;
                } else if (edges[i].direction === -1) {
                    startX = edges[i].x - maxJump;
                    endX = edges[i].x;
                } else {
                    startX = edges[i].x - maxJump;
                    endX = edges[i].x + maxJump;
                }

                // Y look direction
                startY = edges[i].y - maxJump;
                endY = edges[i].y + maxJump;

                // Test against all other existing ledges
                for (var j = 0, len = edges.length; j < len; j++) {
                    if (edges[i].x !== edges[j].x && // Skip same x index
                        (edges[i].direction !== edges[j].direction || edges[j].direction === 0) && // Do the directions align?
                        edges[j].x > startX && edges[j].x < endX && edges[j].y > startY && edges[j].y < endY && // Inside search area?
                        jp.jump.isJumpPossible(edges[i].x, edges[i].y, edges[j].x, edges[j].y)) { // Does a quick jump simulation hit anything?

                        // @TODO Create ledge connection
                        console.log('hit ledge', edges[j].x, edges[j].y, 'from', edges[i].x, edges[i].y);
                        var distance = jp.helper.distanceM(edges[i].x, edges[i].y, edges[j].x, edges[j].y);
                        edges[i].connections.push({
                            x: edges[j].x,
                            y: edges[j].y,
                            jumpDistance: distance, // Cost of in relative space jump
                            cost: distance + 2 // Cost of using this jump is distance + 2 to discourage long distance jumps
                        });
                    }
                }

                // @TODO for each ledge we need to perform an angled drop test to discover possible jump points (add jump point as 2, should only connect to from drop to ledge)
                if (edges[i].direction !== -1) {
                    var xCount = edges[i].x + 1, yCount = edges[i].y + 1, t = true, yDistance = yCount + (maxHeight * 2);
                    while (t) {
                        for (var yTest = 0, lenY = 3; yTest < lenY; yTest++) {
                            jp.visual.setTileStatus({ x: xCount, y: yCount + yTest }, 'jump');
                            // Check below for a blocked tile
                            if (jp.map.blocked(xCount, yCount + yTest) && !_private.outOfBounds(xCount, yCount + yTest)) {
                                distance = jp.helper.distanceM(edges[i].x, edges[i].y, xCount, yCount + yTest);

                                // Add connection at ledge
                                edges[i].connections.push({
                                    x: xCount,
                                    y: yCount + yTest,
                                    jumpDistance: distance,
                                    cost: distance
                                });

                                // Add connection at ledge drop point
                                // @NOTE type must be changed to a jump
                                var targetTile = jp.map.dataMovePaths[xCount][yCount + yTest];
                                targetTile.type = 2;
                                targetTile.connections = [];
                                targetTile.connections.push({
                                    x: edges[i].x,
                                    y: edges[i].y,
                                    jumpDistance: distance,
                                    cost: distance
                                });

                                t = false;
                                break;
                            }
                        }

                        xCount += 1;
                        yCount += 2;
                        if (yCount > yDistance) t = false;
                    }
                }

                // @TODO for each ledge we need to perform an angled drop test to discover possible jump points (add jump point as 2, should only connect to from drop to ledge)
                if (edges[i].direction !== 1) {
                    var xCount = edges[i].x - 1, yCount = edges[i].y + 1, t = true, yDistance = yCount + (maxHeight * 2);
                    while (t) {
                        for (var yTest = 0, lenY = 3; yTest < lenY; yTest++) {
                            jp.visual.setTileStatus({ x: xCount, y: yCount + yTest }, 'jump');
                            // Check below for a blocked tile
                            if (jp.map.blocked(xCount, yCount + yTest) && !_private.outOfBounds(xCount, yCount + yTest)) {
                                console.log(xCount, yCount + yTest);

                                distance = jp.helper.distanceM(edges[i].x, edges[i].y, xCount, yCount + yTest);

                                // Add connection at ledge
                                edges[i].connections.push({
                                    x: xCount,
                                    y: yCount + yTest,
                                    jumpDistance: distance,
                                    cost: distance
                                });

                                // Add connection at ledge drop point
                                // @NOTE type must be changed to a jump
                                var targetTile = jp.map.dataMovePaths[xCount][yCount + yTest];
                                targetTile.type = 2;
                                targetTile.connections = [];
                                targetTile.connections.push({
                                    x: edges[i].x,
                                    y: edges[i].y,
                                    jumpDistance: distance,
                                    cost: distance
                                });

                                t = false;
                                break;
                            }
                        }

                        xCount -= 1;
                        yCount += 2;
                        if (yCount > yDistance) t = false;
                    }
                }

                // @TODO Move into measureDepth method, only measures on right currently
                // for each ledge we must also consider a straight drop down (only valid if there is something to land on) type is = 3
                var dropX = edges[i].x + 1, dropY = edges[i].y + 1;
                for (var dropDistance = 0, dropLength = 10; dropDistance < dropLength; dropDistance++) {
                    if (this.blocked(dropDistance + dropX, dropDistance + dropY) &&
                        !_private.outOfBounds(dropDistance + dropX, dropDistance + dropY)) {
                        // @TODO Record connection to fall command on current node
                        console.log('hit depth tile', dropDistance + dropX, dropDistance + dropY);
                        break;
                    }
                }

                // @TODO Mark tile with visual indicator
                // @TODO Run measureDepth also on the opposite side for -1 and 0 tiles
            }

            console.log('Create move path runtime', Date.now() - start);

            return this;
        },

        getClearance: function (x, y) {
            return this.dataClearance[y][x];
        },

        getWidthInTiles: function () {
            return this.dataCollision[0].length;
        },

        getHeightInTiles: function () {
            return this.dataCollision.length;
        },

        blocked: function (x, y) {
            if (_private.outOfBounds(x, y)) {
                return true;
            }

            if (this.dataCollision[y][x] === 0) {
                return true;
            }

            return false;
        },

        /**
         * Returns an edge from a specific tile and all corresponding tiles. Note: All squares are drawn from the top
         * left to bottom right
         * @param xStart
         * @param yStart
         * @param distance
         * @param [squareLocation]
         * @TODO Expand square location to take more parameters and return different edge pieces
         */
        isEdgeOpen: function (xStart, yStart, distance, squareLocation) {
            var x, y, thresholdY, lenY, thresholdX, lenX;
            var count = 0;
//            if (!squareLocation) squareLocation = 'bottom-right';

            // Get bottom right edge of a square
//            for (y = yStart, threshold = yStart + distance - 1; y < len; y++) {
//                for (x = 0; x < len; x++) {
//                    if ((x >= threshold || y >= threshold) && !this.blocked(x, y)) count += 1;
//                }
//            }

            for (y = yStart, lenY = yStart + distance, thresholdY = lenY - 1; y < lenY; y++) {
                for (x = xStart, lenX = xStart + distance, thresholdX = lenX - 1; x < lenX; x++) {
                    if ((x >= thresholdX || y >= thresholdY) && !this.blocked(x, y)) count += 1;
                }
            }

            return count === (distance - 1) * 2 + 1;
        },

        getNeighbors: function (x, y) {
            var neighbors = [],
                right = this.blocked(x + 1, y),
                left = this.blocked(x - 1, y),
                bottom = this.blocked(x, y + 1),
                top = this.blocked(x, y - 1);

            // Check right, left, bottom, top
            if (!right) neighbors.push(new jp.Tile(x + 1, y));
            if (!left) neighbors.push(new jp.Tile(x - 1, y));
            if (!bottom) neighbors.push(new jp.Tile(x, y + 1));
            if (!top) neighbors.push(new jp.Tile(x, y - 1));

            // Check top left, bottom left, top right, bottom right
            // Side checks enforce that corners should not be clipped / ignored
            if (!top && !left && !this.blocked(x - 1, y - 1)) neighbors.push(new jp.Tile(x - 1, y - 1));
            if (!bottom && !left && !this.blocked(x - 1, y + 1)) neighbors.push(new jp.Tile(x - 1, y + 1));
            if (!top && !right && !this.blocked(x + 1, y - 1)) neighbors.push(new jp.Tile(x + 1, y - 1));
            if (!bottom && !right && !this.blocked(x + 1, y + 1)) neighbors.push(new jp.Tile(x + 1, y + 1));

            return neighbors;
        },


        // Only works when moving to adjacent levels
        getCost: function (xC, yC, xT, yT) {
            return this.dataCollision[yT][xT];
        }
    };
});