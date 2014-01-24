var jp = jp || {};

// @TODO Add input for step limiter
$(document).ready(function () {
    var $MAP = $('.map'),
        MAP_LV_COUNT = 4,
        MAP_WIDTH_COUNT = $MAP.find('tr:first td').length,
        MAP_HEIGHT_COUNT = $MAP.find('tr').length,
        $MAP_TILES = $('.map-tile'),
        $BTNS = $('button'),
        $BTN_START = $('#set-begin'),
        $BTN_END = $('#set-end'),
        $BTN_LV = $('#set-lv');

    var TILES = {
        begin: '[data-status=begin]',
        end: '[data-status=end]',
        closed: '[data-status=closed]',
        setOpened: '[data-status=set-opened]',
        setClosed: '[data-status=set-closed]',
        path: '[data-status=path]'
    };

    var _setBegin = false,
        _setEnd = false,
        _setLv = false;

    var _event = {
        toggleOpen: function () {
            var status = $(this).attr('data-status');

            // Set square
            if (_setLv) {
                $(this).attr('data-lv', jp.visual.getNewLv($(this)));
            } else if (status === 'begin' || status === 'end') {
                return;
            } else if (_setBegin) {
                $BTNS.attr('class', '');
                $MAP.find(TILES.begin).attr('data-status', 'open');
                $(this).attr('data-status', 'begin');
                _setBegin = false;
            } else if (_setEnd) {
                $BTNS.attr('class', '');
                $MAP.find(TILES.end).attr('data-status', 'open');
                $(this).attr('data-status', 'end');
                _setEnd = false;
            } else if (status === 'closed') {
                $(this).attr('data-status', 'open');
            } else {
                $(this).attr('data-status', 'closed');
            }
        },

        activeLv: function () {
            $BTNS.attr('class', '');

            if (_setLv) {
                _setLv = false;
            } else {
                $BTN_LV.addClass('active');
                _setBegin = false;
                _setEnd = false;
                _setLv = true;
            }

            return this;
        },

        activeStart: function () {
            if ($BTN_START.hasClass('active')) {
                $BTNS.attr('class', '');
                _setBegin = false;
                return;
            }

            $BTNS.attr('class', '');
            $BTN_START.addClass('active');
            _setBegin = true;
            _setEnd = false;
            _setLv = false;
        },

        activeEnd: function () {
            if ($BTN_END.hasClass('active')) {
                $BTNS.attr('class', '');
                _setEnd = false;
                return;
            }

            $BTNS.attr('class', '');
            $BTN_END.addClass('active');
            _setBegin = false;
            _setEnd = true;
            _setLv = false;
        }
    };

    jp.visual = {
        init: function () {
            this.bind();
        },

        bind: function () {
            $MAP_TILES.click(_event.toggleOpen);
            $BTN_START.click(_event.activeStart);
            $BTN_END.click(_event.activeEnd);
            $BTN_LV.click(_event.activeLv);
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

        // Gets level from the DOM, count starts at 1
        getLv: function (x, y) {
            var lv = this.getTile(x, y).attr('data-lv');

            switch (lv) {
                case undefined:
                    return 1;
                case '1':
                    return 1;
                default:
                    return parseInt(lv, 10);
            }
        },

        getMap: function () {
            var tmpMap = [],
                status,
                i,
                j;

            for (i = 0; i < MAP_HEIGHT_COUNT; i++) {
                tmpMap.push([]);
                for (j = 0; j < MAP_WIDTH_COUNT; j++) {
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

        getMap3d: function () {
            var tmpMap = [],
                status,
                lv,
                i, j, k;

            for (i = 0; i < MAP_LV_COUNT; i++) {
                tmpMap.push([]);
                for (j = 0; j < MAP_HEIGHT_COUNT; j++) {
                    tmpMap[i].push([]);
                    for (k = 0; k < MAP_WIDTH_COUNT; k++) {
                        status = this.getStatus(k, j);
                        lv = this.getLv(k, j);

                        if (lv !== i + 1 || status === 'closed') {
                            tmpMap[i][j][k] = 0;
                        } else {
                            tmpMap[i][j][k] = 1;
                        }
                    }
                }
            }

            return tmpMap;
        },

        getBegin: function () {
            var $beginTile = $(TILES.begin);

            return {
                x: $beginTile.index(),
                y: $beginTile.parent('tr').index(),
                z: (parseInt($beginTile.attr('data-lv'), 10) || 1) - 1
            };
        },

        getEnd: function () {
            var $endTile = $(TILES.end);

            return {
                x: $endTile.index(),
                y: $endTile.parent('tr').index(),
                z: (parseInt($endTile.attr('data-lv'), 10) || 1) - 1
            };
        },

        getTile: function (x, y) {
            return $MAP.find('tr:nth-child(' + (y + 1) + ') td:nth-child(' + (x + 1) + ')');
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

            return this;
        },

        setTileGroup: function (steps, tileStatus) {
            for (var i = 0; i < steps.length; i++) {
                this.setTile(steps[i], tileStatus);
            }

            return this;
        },

        getNewLv: function ($tile) {
            var lv = parseInt($tile.attr('data-lv'), 10);

            if (isNaN(lv)) {
                return 2;
            } else if (lv === 4) {
                return 1;
            } else {
                return lv + 1;
            }
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
            $(TILES.setClosed + ', ' + TILES.setOpened + ', ' + TILES.path).attr('data-status', 'open');
            return this;
        }
    };
});