var jp = jp || {};

// @TODO Add input for step limiter
$(document).ready(function () {
    'use strict';

    var $MAP,
        $MAP_TILES,
        $BTNS = $('button'),
        $BTN_START = $('#set-begin'),
        $BTN_END = $('#set-end'),
        $BTN_LV = $('#set-lv'),
        $BTN_SAVE_MAP = $('#map-save'),
        $BTN_LOAD_MAP = $('#map-load'),
        $BTN_CLEARANCE = $('#show-clearance'),
        $BTN_PLATFORMER = $('#show-movement'),
        $BTN_JUMP = $('#show-jump'),
        _map_width_count,
        _map_height_count,
        _setStatus = null;

    var TILES = {
        begin: '[data-status=begin]',
        end: '[data-status=end]',
        closed: '[data-status=closed]',
        setOpened: '[data-status=set-opened]',
        setClosed: '[data-status=set-closed]',
        path: '[data-status=path]',
        jump: '[data-status=jump]'
    };

    var _event = {
        toggleState: function () {
            var $el = $(this),
                status = $el.attr('data-status');

            // Set square
            if (status === 'begin' || status === 'end') { // Do not set begin and end tiles
                return;
            } else if (_setStatus === 'begin') {
                $BTNS.attr('class', '');
                jp.visual.setBegin(parseInt($el.attr('data-x'), 10), parseInt($el.attr('data-y'), 10));
            } else if (_setStatus === 'end') {
                $BTNS.attr('class', '');
                jp.visual.setEnd(parseInt($el.attr('data-x'), 10), parseInt($el.attr('data-y'), 10));
                _setStatus = null;
            } else if (status === 'closed') {
                $(this).attr('data-status', 'open');
            } else {
                $(this).attr('data-status', 'closed');
            }

            $MAP.find(TILES.jump).attr('data-status', 'open');
            jp.map.setData(jp.visual.getCollisionMap());

            jp.visual.showClearance()
                .showPlatformer();
        },

        activeStart: function () {
            if ($BTN_START.hasClass('active')) {
                $BTNS.attr('class', '');
                _setStatus = null;
                return;
            }

            $BTNS.attr('class', '');
            $BTN_START.addClass('active');
            _setStatus = 'begin'
        },

        activeEnd: function () {
            if ($BTN_END.hasClass('active')) {
                $BTNS.attr('class', '');
                _setStatus = null;
                return;
            }

            $BTNS.attr('class', '');
            $BTN_END.addClass('active');
            _setStatus = 'end';
        },

        toggleClearance: function () {
            jp.clearance.debug = !jp.clearance.debug;
            jp.visual.showClearance();
        },

        togglePlatformer: function () {
            jp.draw.clearLines();
            jp.movement.debug = !jp.movement.debug;
            jp.visual.showPlatformer();
        },

        toggleJump: function () {
            jp.visual.clearPath(TILES.jump, true);
            jp.jump.debug = !jp.jump.debug;
            jp.map.setData(jp.visual.getCollisionMap());
        }
    };

    jp.visual = {
        init: function () {
            this.createMap('map', 18, 12)
                .bind()
                .loadMap();
        },

        /**
         * Gets the current map and saves it to local storage as a serialized array
         */
        saveMap: function () {
            localStorage.setItem('begin', JSON.stringify(this.getBegin()));
            localStorage.setItem('end', JSON.stringify(this.getEnd()));
            localStorage.setItem('mapCollision', JSON.stringify(this.getCollisionMap()));
        },

        /**
         * Gets the previously saved map in local storage or generates a default one
         */
        loadMap: function () {
            var begin = JSON.parse(localStorage.getItem('begin')),
                end = JSON.parse(localStorage.getItem('end')),
                mapCollision = JSON.parse(localStorage.getItem('mapCollision'));

            this.erase();

            if (begin && end && mapCollision) {
                var x, xLen;
                // Loop Through and place all blocked tiles
                for (var y = 0, yLen = mapCollision.length; y < yLen; y++) {
                    for (x = 0, xLen = mapCollision[0].length; x < xLen; x++) {
                        if (mapCollision[y][x] === 0) this.setClosed(x, y);
                    }
                }

                jp.map.setData(this.getCollisionMap());

                // Set special tiles
                this.setBegin(begin.x, begin.y)
                    .setEnd(end.x, end.y);

                // Update map data
            } else {
                this.setStatus({ x: 10, y: 3 }, 'begin')

                    .setStatus({ x: 14, y: 9 }, 'end')

                    .setStatus({ x: 8, y: 4 }, 'closed')
                    .setStatus({ x: 9, y: 4 }, 'closed')
                    .setStatus({ x: 10, y: 4 }, 'closed')
                    .setStatus({ x: 11, y: 4 }, 'closed')
                    .setStatus({ x: 12, y: 4 }, 'closed')

                    .setStatus({ x: 4, y: 8 }, 'closed')
                    .setStatus({ x: 5, y: 8 }, 'closed')
                    .setStatus({ x: 6, y: 8 }, 'closed')
                    .setStatus({ x: 7, y: 8 }, 'closed')
                    .setStatus({ x: 8, y: 8 }, 'closed')

                    .setStatus({ x: 13, y: 10 }, 'closed')
                    .setStatus({ x: 14, y: 10 }, 'closed')
                    .setStatus({ x: 15, y: 10 }, 'closed')
                    .setStatus({ x: 16, y: 10 }, 'closed');

                jp.map.setData(this.getCollisionMap());
            }

            return this;
        },

        createMap: function (id, width, height) {
            var x, y, $row, xAxis = '';
            _map_width_count = width;
            _map_height_count = height;
            $MAP = $('#' + id);

            for (y = 0; y < height; y++) {
                $row = $('<div class="map-row"></div>');
                for (x = 0; x < width; x++) {
                    $row.append('<div class="map-tile" data-x="' + x + '" data-y="' + y + '"></div>');
                }
                $MAP.append($row);
            }

            $MAP_TILES = $MAP.find('.map-tile');

            for (x = 0; x < width; x++) {
                xAxis += '<span class="grid x">' + x + '</span>';
            }
            $MAP.before('<div class="grid-container x">' + xAxis + '</div>');

            var yAxis = '';
            for (y = 0; y < height; y++) {
                yAxis += '<span class="grid y">' + y + '</span>';
            }
            $MAP.before('<div class="grid-container y">' + yAxis + '</div>');

            return this;
        },

        /**
         * @TODO Clear map is not listed here
         * @TODO Find path is not listed here
         */
        bind: function () {
            $MAP_TILES.click(_event.toggleState);
            $BTN_START.click(_event.activeStart);
            $BTN_END.click(_event.activeEnd);
            $BTN_CLEARANCE.click(_event.toggleClearance);
            $BTN_PLATFORMER.click(_event.togglePlatformer);
            $BTN_JUMP.click(_event.toggleJump);
            $BTN_SAVE_MAP.click(this.saveMap.bind(this));
            $BTN_LOAD_MAP.click(this.loadMap.bind(this));

            return this;
        },

        showClearance: function () {
            if (jp.clearance.debug) {
                var width = jp.map.getWidthInTiles();
                var height = jp.map.getHeightInTiles();
                var x, y;

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        jp.visual.setTileValue({x: x, y: y}, 'c', jp.clearance.getTile(x, y));
                    }
                }
            } else {
                $('.map-tile').find('.c').detach();
            }

            return this;
        },

        showPlatformer: function () {
            if (jp.movement.debug) {
                var width = jp.map.getWidthInTiles();
                var height = jp.map.getHeightInTiles();
                var x, y, output, tile;

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        tile = jp.movement.getTile(x, y);
                        output = tile.type;
                        if (tile.clearance) output += '-' + tile.clearance;
                        jp.visual.setTileValue({x: x, y: y}, 'm', output);
                    }
                }
            } else {
                $('.map-tile').find('.m').detach();
            }

            return this;
        },

        // Gets status from the dom, count starts at 0
        getStatus: function (x, y) {
            var status = this.getTile(x, y).attr('data-status');

            switch (status) {
                case undefined:
                    return 'open';
                case 'open':
                    return 'open';
                default:
                    return status;
            }
        },

        getCollisionMap: function () {
            var tmpMap = [],
                status,
                i,
                j;

            for (i = 0; i < _map_height_count; i++) {
                tmpMap.push([]);
                for (j = 0; j < _map_width_count; j++) {
                    status = this.getStatus(j, i);

                    if (status === 'closed') {
                        tmpMap[i][j] = 0;
                    } else {
                        tmpMap[i][j] = 1;
                    }
                }
            }

            return tmpMap;
        },

        getPlayerSize: function () {
            return parseInt($('#input-player').val(), 10);
        },

        getBegin: function () {
            var $beginTile = $(TILES.begin).first();

            return {
                x: $beginTile.index(),
                y: $beginTile.parent('div').index()
            };
        },

        getEnd: function () {
            var $endTile = $(TILES.end);

            return {
                x: $endTile.index(),
                y: $endTile.parent('div').index()
            };
        },

        getTile: function (x, y) {
            return $MAP.find('.map-row:nth-child(' + (y + 1) + ') .map-tile:nth-child(' + (x + 1) + ')');
        },

        setStatus: function (tile, status) {
            var $tile = this.getTile(tile.x, tile.y);

            $tile.attr('data-status', status);
            return this;
        },

        setTileStatus: function (tile, status) {
            var $tile = this.getTile(tile.x, tile.y);
            var currentStatus = $tile.attr('data-status');
            if (currentStatus === 'begin' || currentStatus === 'end' || currentStatus === 'closed') return this;
            $tile.attr('data-status', status);
            return this;
        },

        setClosed: function (x, y) {
            this.getTile(x, y)
                .attr('data-status', 'closed');
        },

        setTileValue: function (tile, targetClass, targetValue) {
            var $tile = this.getTile(tile.x, tile.y);
            $tile.find('.' + targetClass).detach();
            $tile.append('<span class="stat ' + targetClass + '">' + targetValue + '</span>');
            return this;
        },

        setTile: function (tile, status) {
            var $tile = this.getTile(tile.x, tile.y);

            // Ignore begin and end tiles
            if ($tile.attr('data-status') === 'begin' || $tile.attr('data-status') === 'end') {
                return;
            }

            $tile.attr('data-status', status);

            // If stats are present set them
            if (tile.f) {
                $tile.append('<span class="stat f">' + tile.f +'</span>');
                $tile.append('<span class="stat g">' + tile.g +'</span>');
                $tile.append('<span class="stat h">' + tile.h +'</span>');
            }

            $tile.append('<span class="stat c">' + jp.clearance.getTile(tile.x, tile.y) + '</span>');

            return this;
        },

        setTileGroup: function (steps, tileStatus) {
            for (var i = 0; i < steps.length; i++) {
                this.setTile(steps[i], tileStatus);
            }

            return this;
        },

        setBegin: function (xTarget, yTarget) {
            var $el = this.getTile(xTarget, yTarget);
            $(TILES.setClosed + ', ' + TILES.setOpened + ', ' + TILES.path).attr('data-status', 'open');
            $MAP_TILES.find('.f, .g, .h').detach();

            // Verify there is proper clearance around the player before placing
            var playerSize = jp.visual.getPlayerSize(),
                xPos = parseInt($el.attr('data-x'), 10),
                yPos = parseInt($el.attr('data-y'));
            if (jp.visual.getPlayerSize() > jp.clearance.getTile(xPos, yPos))
                return;

            $MAP.find(TILES.begin).attr('data-status', 'open');

            // Create a square equal to player size
            var x, y;
            for (y = 0; y < playerSize; y++) {
                for (x = 0; x < playerSize; x++) {
                    $('div[data-x="' + (xPos + x) +'"][data-y="' + (yPos + y) + '"]').attr('data-status', 'begin');
                }
            }
            $el.attr('data-status', 'begin');

            _setStatus = null;

            return this;
        },

        setEnd: function (x, y) {
            $(TILES.setClosed + ', ' + TILES.setOpened + ', ' + TILES.path).attr('data-status', 'open');
            $MAP_TILES.find('.f, .g, .h').detach();

            $MAP.find(TILES.end).attr('data-status', 'open');
            this.getTile(x, y).attr('data-status', 'end');
        },

        // Erase everything on the map except beginning and end points
        erase: function () {
            var $el;

            $MAP_TILES.each(function () {
                $el = $(this);

                if ($el.attr('data-status') !== 'begin' && $el.attr('data-status') !== 'end') {
                    $el.html('').attr('data-status', 'open');
                }
            });
        },

        // Remove opened set, closed set, and path tiles from the map
        clearPath: function (clearSyntax, keepStats) {
            if (!keepStats)
                $MAP_TILES.find('.f, .g, .h').detach();

            if (!clearSyntax) {
                $(TILES.setClosed + ', ' + TILES.setOpened + ', ' + TILES.path).attr('data-status', 'open');
            } else {
                $(clearSyntax).attr('data-status', 'open');
            }
            return this;
        }
    };
});