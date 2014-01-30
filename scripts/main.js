var jp = jp || {};

$(document).ready(function () {
    var $BTN_PATH = $('#calculate')
        $BTN_PATH_FLOAT = $('#path-float'),
        $BTN_ERASE = $('#erase');

    var _event = {
        findGravityPath: function () {
            main.pathfinder.setGravity(true);
            main.findPath();
        },

        findFloatingPath: function () {
            main.pathfinder.setGravity(false);
            main.findPath();
        }
    };

    var main = {
        pathfinder: null, // Testable pathfinder

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

            this.pathfinder = new Pathfinder(jp.map, movement, true);

            this.bind();
        },

        bind: function () {
            $BTN_PATH.click(_event.findGravityPath);
            $BTN_ERASE.click(jp.visual.erase);
            $BTN_PATH_FLOAT.click(_event.findFloatingPath);
        },

        findPath: function () {
            var timeEnd,
                timeStart,
                begin = jp.visual.getBegin(),
                end = jp.visual.getEnd(),
                maxSteps = parseInt($('#input-max-steps').val(), 10);

            main.pathfinder.playerSize = jp.visual.getPlayerSize();
            jp.map.setData(jp.visual.getCollisionMap());
            timeStart = Date.now();

            // @TODO If the player is up in the air we are in the middle of a jump, do not find a path during a jump (error prone)
            var path = main.pathfinder.findPath(begin.x + main.pathfinder.playerSize - 1, begin.y + main.pathfinder.playerSize - 1, end.x, end.y, maxSteps);

            timeEnd = Date.now();
            main.pathfinder.setVisual();
            jp.visual.setTileGroup(path, 'path');

            $('#time').html((timeEnd - timeStart) / 1000);
            $('#calls').html(main.pathfinder.calls);
        }
    };

    main.init();
});