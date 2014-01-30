var jp = jp || {};

$(document).ready(function () {
    var $BTN_PATH = $('#calculate'),
        $BTN_ERASE = $('#erase');

    var _event = {
        findPath: function () {
            var timeEnd,
                timeStart,
                begin = jp.visual.getBegin(),
                end = jp.visual.getEnd(),
                maxSteps = parseInt($('#input-max-steps').val(), 10);

            jp.pathFinder.playerSize = jp.visual.getPlayerSize();
            jp.map.setData(jp.visual.getCollisionMap());
            timeStart = Date.now();

            // @TODO If the player is up in the air we are in the middle of a jump, do not find a path during a jump (error prone)
            var path = jp.pathFinder.findPath(begin.x + jp.pathFinder.playerSize - 1, begin.y + jp.pathFinder.playerSize - 1, end.x, end.y, maxSteps);

            timeEnd = Date.now();
            jp.pathFinder.setVisual();
            jp.visual.setTileGroup(path, 'path');

            $('#time').html((timeEnd - timeStart) / 1000);
            $('#calls').html(jp.pathFinder.calls);
        }
    };

    var main = {
        init: function () {
            jp.visual.createMap('map', 18, 12);
            jp.visual.bind();

            // @TODO An encapsulating map class might be useful to better perform this
            jp.map = new MapCollision(jp.visual.getCollisionMap());
            var width = jp.map.getWidthInTiles(), height = jp.map.getHeightInTiles();
            var clearance = new MapClearance(width, height, jp.map);
            var movement = new MapMovement(width, height, parseInt($('#input-move-clearance').val(), 10), parseInt($('#input-max-jump').val(), 10), jp.map, clearance);
            jp.map.setClearance(clearance)
                .setMovement(movement);

            jp.visual.collision = jp.map;
            jp.visual.clearance = clearance;
            jp.visual.movement = movement;
            jp.visual.loadMap();

            this.bind();
//            console.log('test');

        },

        bind: function () {
            $BTN_PATH.click(_event.findPath);
            $BTN_ERASE.click(jp.visual.erase);
        }
    };

    main.init();
});