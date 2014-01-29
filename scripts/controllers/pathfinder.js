var jp = jp || {};

$(document).ready(function () {
    // Pathfinder API - Returns a path to the target
    // Good place to add details such as flying, swimming, ect.
    jp.pathFinder = {
        // Goal variables help to determine if an object larger than one voxel has hit its goal
        xGoal: null,
        yGoal: null,

        // Number of voxels for the player unit size
        playerSize: 1,

        // Taken steps
        closed: [],

        // Available steps that can be taken
        open: [],

        // Step count
        step: 0,
        maxSteps: 0,

        // Maximum number of steps that can be taken before shutting down a closed path
        maxSearchDistance: 10,

        calls: null,

        addOpen: function (step) {
            this.open.push(step);
            return this;
        },

        // Remove a step that already exists by object memory address (not actual x and y values)
        removeOpen: function (step) {
            for (var i = 0; i < this.open.length; i++) {
                if (this.open[i] === step) this.open.splice(i, 1);
            }
            return this;
        },

        // Check if the step is already in the open set
        inOpen: function (step) {
            for (var i = 0; i < this.open.length; i++) {
                if (this.open[i].x === step.x && this.open[i].y === step.y)
                    return this.open[i];
            }

            return false;
        },

        // Get the lowest costing tile in the open set
        getBestOpen: function () {
            var bestI = 0;
            for (var i = 0; i < this.open.length; i++) {
                if (this.open[i].f < this.open[bestI].f) bestI = i;
            }

            return this.open[bestI];
        },

        addClosed: function (step) {
            this.closed.push(step);
            return this;
        },

        // Check if the step is already in the closed set
        inClosed: function (step) {
            for (var i = 0; i < this.closed.length; i++) {
                if (this.closed[i].x === step.x && this.closed[i].y === step.y)
                    return this.closed[i];
            }

            return false;
        },

        setMaxSteps: function (steps) {
            this.maxSteps = steps;
            return this;
        },

        /**
         * @TODO Pathfinding with connection ids might cause some overlap in pathfinding logic, integrate the ability
         * to see a live demo of the pathfinding (next / prev step, animated show). Easiest way to do this would probably
         * be recording every single tile step along the way and passing back an array. Array could then be traversed freely
         * to discover bugs and better understand wtf is going on.
         * @TODO Pathfinder should probably record the movement type (walk, jump, fall)
         * @param xC {number} X origin
         * @param yC {number} Y origin
         * @param xT {number} X target
         * @param yT {number} Y target
         * @param maxSteps {number} Maximum number of step attempts allowed
         * @returns {*}
         */
        findPath: function (xC, yC, xT, yT, maxSteps) {
            var current, // Current best open tile
                neighbors, // Dump of all nearby neighbor tiles
                neighborRecord, // Any pre-existing records of a neighbor
                stepCost, // Dump of a total step score for a neighbor
                i;

            // You must add the starting step
            this.reset()
                .setMaxSteps(maxSteps)
                .addOpen(new jp.Step(xC, yC, xT, yT, this.step, false));

            while (this.open.length !== 0) {
                this.calls += 1;
                maxSteps -= 1;
                if (maxSteps < 1) break;

                current = this.getBestOpen();

                // Check if goal has been discovered to build a path
                this.xGoal = xT - current.x;
                this.yGoal = yT - current.y;

                // A little extra logic for players larger than 1 voxel
                if (this.xGoal < this.playerSize && this.xGoal >= 0 && this.yGoal < this.playerSize && this.yGoal >= 0) {
                    return this.buildPath(current, []);
                }

                // Move current into closed set
                this.removeOpen(current)
                    .addClosed(current);

                // Get neighbors from the map and check them
                neighbors = jp.movement.getNeighbors(current.x, current.y);
                for (i = 0; i < neighbors.length; i++) {
                    // Get current step and distance from current to neighbor
                    stepCost = current.g + jp.movement.getCost(current.x, current.y, neighbors[i].x, neighbors[i].y);

                    // Check for the neighbor in the closed set
                    // then see if its cost is >= the stepCost, if so skip current neighbor
                    neighborRecord = this.inClosed(neighbors[i]);
                    if (neighborRecord && stepCost >= neighborRecord.g)
                        continue;

                    // Verify neighbor doesn't exist or new score for it is better
                    neighborRecord = this.inOpen(neighbors[i]);
                    if (!neighborRecord || stepCost < neighborRecord.g) {
                        if (!neighborRecord) {
                            // Reject the tile immediately if the player cannot fit into it
                            // @TODO Larger movement sizes don't work because the initial player tile square is the top left, it must be the bottom left instead
                            if (this.playerSize > jp.movement.getClearance(neighbors[i].x, neighbors[i].y)) continue;
                            this.addOpen(new jp.Step(neighbors[i].x, neighbors[i].y, xT, yT, stepCost, current));
                        } else {
                            neighborRecord.parent = current;
                            neighborRecord.g = stepCost;
                            neighborRecord.f = stepCost + neighborRecord.h;
                        }
                    }
                }
            }

            return this.getBestGuess(xC, yC);
        },

        getBestClosed: function () {
            var bestI = 0;
            for (var i = 0, len = this.closed.length; i < len; i++) {
                if (this.closed[i].f < this.closed[bestI].f) bestI = i;
            }

            return this.closed[bestI];
        },

        getBestHeuristic: function () {
            var bestClosedI = 0, bestOpenI = 0;

            // Loop through all items and look for best heuristic
            for (var i = 0, len = this.closed.length; i < len; i++) {
                if (this.closed[i].h < this.closed[bestClosedI].h) bestClosedI = i;
            }

            for (i = 0, len = this.open.length; i < len; i++) {
                if (this.open[i].h < this.open[bestOpenI].h) bestOpenI = i;
            }

            return this.open[bestOpenI].h > this.closed[bestClosedI].h ? this.open[bestOpenI] : this.closed[bestClosedI];
        },

        /**
         * In-cases such as max steps exceeded we need to return a best guess for the estimated location
         */
        getBestGuess: function (xC, yC) {
            // Get the best available heuristic tile
            var tileBest = this.getBestHeuristic();

            // Build a path to that tile
            return this.findPath(xC, yC, tileBest.x, tileBest.y, this.maxSteps);
        },

        // Recursive path building method
        buildPath: function (tile, stack) {
            stack.push(tile);

            if (tile.parent) {
                return this.buildPath(tile.parent, stack);
            } else {
                return stack;
            }
        },

        setVisual: function () {
            jp.visual.clearPath()
                .setTileGroup(this.open, 'set-opened')
                .setTileGroup(this.closed, 'set-closed');
        },

        reset: function () {
            this.closed = [];
            this.open = [];
            this.calls = 0;
            return this;
        }
    };
});