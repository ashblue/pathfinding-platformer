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
                jp.map.setData(jp.visual.getCollisionMap());

                // Verify there is proper clearance around the player before placing
                var playerSize = jp.visual.getPlayerSize(),
                    xPos = parseInt($el.attr('data-x'), 10),
                    yPos = parseInt($el.attr('data-y'));
                if (jp.visual.getPlayerSize() > jp.map.getClearance(xPos, yPos))
                    return;

                $BTNS.attr('class', '');
                $MAP.find(TILES.begin).attr('data-status', 'open');

                // Create a square equal to player size
                var x, y;
                for (y = 0; y < playerSize; y++) {
                    for (x = 0; x < playerSize; x++) {
                        $('div[data-x="' + (xPos + x) +'"][data-y="' + (yPos + y) + '"]').attr('data-status', 'begin');
                    }
                }
                $(this).attr('data-status', 'begin');

                _setStatus = null;
            } else if (_setStatus === 'end') {
                $BTNS.attr('class', '');
                $MAP.find(TILES.end).attr('data-status', 'open');
                $(this).attr('data-status', 'end');
                _setStatus = null;
            } else if (status === 'closed') {
                $(this).attr('data-status', 'open');
            } else {
                $(this).attr('data-status', 'closed');
            }
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

        showClearance: function () {
            jp.map.setData(jp.visual.getCollisionMap());

            var dataClearance = jp.map.dataClearance;
            var width = jp.map.getWidthInTiles();
            var height = jp.map.getHeightInTiles();
            var x, y;

            for (y = 0; y < height; y++) {
                for (x = 0; x < width; x++) {
                    jp.visual.setTileValue({x: x, y: y}, 'c', dataClearance[y][x]);
                }
            }
        },

        showPlatformer: function () {
            jp.map.setData(jp.visual.getCollisionMap());

            var dataMovePaths = jp.map.dataMovePaths;
            var width = jp.map.getWidthInTiles();
            var height = jp.map.getHeightInTiles();
            var x, y, output, tile;

            for (y = 0; y < height; y++) {
                for (x = 0; x < width; x++) {
                    tile = dataMovePaths[y][x];
                    output = tile.type;
                    if (tile.clearance) output += '-' + tile.clearance;
                    jp.visual.setTileValue({x: x, y: y}, 'm', output);
                }
            }
        },

        showJump: function () {
            jp.map.setData(jp.visual.getCollisionMap());
            jp.visual.clearPath();

            var begin = jp.visual.getBegin();
            var end = jp.visual.getEnd();
            var jumpPath = jp.jump.getJumpPath(begin.x, begin.y, end.x, end.y);

            for (var i = 0, len = jumpPath.length; i < len; i++) {
                jp.visual.setTileStatus(jumpPath[i], 'jump');
            }
        }
    };

    jp.visual = {
        init: function () {
            this.createMap('map', 18, 12)
                .bind()
                .setStatus({ x: 2, y: 1 }, 'begin')
                .setStatus({ x: 1, y: 7 }, 'end')
                .setStatus({ x: 0, y: 2 }, 'closed')
                .setStatus({ x: 0, y: 3 }, 'closed')
                .setStatus({ x: 1, y: 2 }, 'closed')
                .setStatus({ x: 1, y: 3 }, 'closed')
                .setStatus({ x: 2, y: 2 }, 'closed')
                .setStatus({ x: 2, y: 3 }, 'closed')
                .setStatus({ x: 3, y: 2 }, 'closed')
                .setStatus({ x: 3, y: 3 }, 'closed');

            jp.map.setData(this.getCollisionMap());
        },

        createMap: function (id, width, height) {
            var x, y, $row;
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
            $BTN_CLEARANCE.click(_event.showClearance);
            $BTN_PLATFORMER.click(_event.showPlatformer);
            $BTN_JUMP.click(_event.showJump);

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

            $tile.attr('data-status', status).html('');

            // If stats are present set them
            if (tile.f) {
                $tile.append('<span class="stat f">' + tile.f +'</span>');
                $tile.append('<span class="stat g">' + tile.g +'</span>');
                $tile.append('<span class="stat h">' + tile.h +'</span>');
            }

            // @TODO Should output on all tiles, even though it isn't, that is okay for now...
            $tile.append('<span class="stat c">' + jp.map.dataClearance[tile.y][tile.x] + '</span>');

            return this;
        },

        setTileGroup: function (steps, tileStatus) {
            for (var i = 0; i < steps.length; i++) {
                this.setTile(steps[i], tileStatus);
            }

            return this;
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
        clearPath: function () {
            $MAP_TILES.html('');
            $(TILES.setClosed + ', ' + TILES.setOpened + ', ' + TILES.path + ', ' + TILES.jump).attr('data-status', 'open');
            return this;
        }
    };
});