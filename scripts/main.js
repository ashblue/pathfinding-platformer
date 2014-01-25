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
            var path = jp.pathFinder.findPath(begin.x, begin.y, end.x, end.y, maxSteps);
            timeEnd = Date.now();
            jp.pathFinder.setVisual();
            jp.visual.setTileGroup(path, 'path')

            $('#time').html((timeEnd - timeStart) / 1000);
        }
    };

    var main = {
        init: function () {
            jp.visual.init();
            this.bind();
        },

        bind: function () {
            $BTN_PATH.click(_event.findPath);
            $BTN_ERASE.click(jp.visual.erase);
        }
    };

    main.init();
});