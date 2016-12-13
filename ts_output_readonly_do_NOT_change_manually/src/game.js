;
var game;
(function (game) {
    game.rowsNum = 8;
    game.colsNum = 8;
    game.rows = [0, 1, 2, 3, 4, 5, 6, 7];
    game.cols = [0, 1, 2, 3, 4, 5, 6, 7];
    var gameArea = document.getElementById("gameArea");
    var draggingStartedRowCol = null; // The {row: YY, col: XX} where dragging started.
    var draggingPiece = null;
    var draggingPieceAvailableMoves = null;
    var animationEnded = false;
    var isComputerTurn = false;
    var board = null;
    var turnIndex = 0;
    var isUnderCheck = null;
    var canCastleKing = null;
    var canCastleQueen = null;
    var enpassantPosition = null;
    var deltaFrom = null;
    var deltaTo = null;
    var isYourTurn = false;
    var rotate = null;
    var player = null;
    function init() {
        registerServiceWorker();
        //translate.setTranslations(getTranslations());
        //translate.setLanguage('en');
        resizeGameAreaService.setWidthToHeight(1);
        gameService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            isMoveOk: gameLogic.isMoveOk,
            updateUI: updateUI,
            gotMessageFromPlatform: null,
        });
        // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
        document.addEventListener("animationend", animationEndedCallback, false); // standard
        document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
        document.addEventListener("oanimationend", animationEndedCallback, false); // Opera
        dragAndDropService.addDragListener("gameArea", handleDragEvent);
        gameArea = document.getElementById("gameArea");
    }
    game.init = init;
    function registerServiceWorker() {
        // I prefer to use appCache over serviceWorker (because iOS doesn't support serviceWorker, so we have to use appCache) I've added this code for a future where all browsers support serviceWorker (so we can deprecate appCache!)
        if (!window.applicationCache && 'serviceWorker' in navigator) {
            var n = navigator;
            log.log('Calling serviceWorker.register');
            n.serviceWorker.register('service-worker.js').then(function (registration) {
                log.log('ServiceWorker registration successful with scope: ', registration.scope);
            }).catch(function (err) {
                log.log('ServiceWorker registration failed: ', err);
            });
        }
    }
    function getTranslations() {
        return {}; //XXX to fill in
    }
    function updateUI(params) {
        turnIndex = params.turnIndexAfterMove;
        board = params.stateAfterMove.board;
        if (!board) {
            board = gameLogic.getInitialBoard();
        }
        deltaFrom = params.stateAfterMove.deltaFrom;
        deltaTo = params.stateAfterMove.deltaTo;
        isUnderCheck = params.stateAfterMove.isUnderCheck;
        canCastleKing = params.stateAfterMove.canCastleKing;
        canCastleQueen = params.stateAfterMove.canCastleQueen;
        enpassantPosition = params.stateAfterMove.enpassantPosition;
        isYourTurn = (turnIndex === params.yourPlayerIndex && turnIndex >= 0);
        if (isYourTurn && params.playersInfo[params.yourPlayerIndex].playerId === '') {
            isYourTurn = false; // to make sure the UI won't send another move.
            /* Waiting 0.5 seconds to let the move animation finish; if we call aiService
              then the animation is paused until the javascript finishes. */
            $timeout(sendComputerMove, 500);
        }
        /* If the play mode is not pass and play then "rotate" the board
         for the player. Therefore the board will always look from the
         point of view of the player in single player mode... */
        rotate = false;
        if (params.playMode === "playBlack") {
            rotate = true;
        }
    }
    function animationEndedCallback() {
        animationEnded = true;
        if (isComputerTurn) {
            sendComputerMove();
        }
    }
    function sendComputerMove() {
        var possibleMoves = gameLogic.getPossibleMoves(board, turnIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition);
        if (possibleMoves.length) {
            var audio = new Audio('sounds/piece_lift.mp3');
            audio.play();
            //Check for attack move
            for (var i_1 = 0; i_1 < possibleMoves.length; i_1++) {
                deltaFrom = possibleMoves[i_1][0];
                var availableMoves = possibleMoves[i_1][1];
                for (var j_1 = 0; j_1 < availableMoves.length; j_1++) {
                    deltaTo = availableMoves[j_1];
                    if (rotate) {
                        deltaTo.row = 7 - deltaTo.row;
                        deltaTo.col = 7 - deltaTo.col;
                    }
                    var toTeam = board[deltaTo.row][deltaTo.col].charAt(0);
                    if (toTeam !== getTurn(turnIndex) && toTeam !== '') {
                        gameService.makeMove(gameLogic.createMove(board, deltaFrom, deltaTo, turnIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition));
                        return;
                    }
                }
            }
            //No attack move found
            var i = Math.floor(Math.random() * possibleMoves.length);
            var j = Math.floor(Math.random() * possibleMoves[i][1].length);
            deltaFrom = possibleMoves[i][0];
            deltaTo = possibleMoves[i][1][j];
            gameService.makeMove(gameLogic.createMove(board, deltaFrom, deltaTo, turnIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition));
            audio = new Audio('sounds/piece_drop.wav');
            audio.play();
        }
        else {
            console.log("There is no possible move");
        }
    }
    //window.e2e_test_stateService = stateService;
    function handleDragEvent(type, clientX, clientY) {
        // Center point in gameArea
        var x = clientX - gameArea.offsetLeft;
        var y = clientY - gameArea.offsetTop;
        if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= gameArea.clientHeight) {
            if (!draggingPiece) {
                return; //to prevent to click outside of gameArea
            }
        }
        else {
            // Inside gameArea. Let's find the containing square's row and col
            var col = Math.floor(game.colsNum * x / gameArea.clientWidth);
            var row = Math.floor(game.rowsNum * y / gameArea.clientHeight);
            var r_row = row;
            var r_col = col;
            if (rotate) {
                r_row = 7 - r_row;
                r_col = 7 - r_col;
            }
            if (type === "touchstart" && !draggingStartedRowCol) {
                // drag started
                var PieceEmpty = (board[r_row][r_col] === '');
                var PieceTeam = board[r_row][r_col].charAt(0);
                if (!PieceEmpty && PieceTeam === getTurn(turnIndex)) {
                    //valid drag
                    var audio = new Audio('sounds/piece_lift.mp3');
                    audio.play();
                    draggingStartedRowCol = { row: row, col: col };
                    draggingPiece = document.getElementById("e2e_test_img_" +
                        game.getPieceKindInId(row, col) +
                        '_' +
                        draggingStartedRowCol.row +
                        "x" +
                        draggingStartedRowCol.col);
                    if (draggingPiece) {
                        draggingPiece.style['z-index'] = 1;
                        draggingPiece.style.width = '60%';
                    }
                    draggingPieceAvailableMoves = getDraggingPieceAvailableMoves(r_row, r_col);
                    for (var i = 0; i < draggingPieceAvailableMoves.length; i++) {
                        draggingPieceAvailableMoves[i].style['stroke-width'] = '10';
                        draggingPieceAvailableMoves[i].style.stroke = 'rgba(255, 128, 0, 1)';
                        draggingPieceAvailableMoves[i].setAttribute("rx", "5");
                        draggingPieceAvailableMoves[i].setAttribute("ry", "5");
                    }
                }
            }
            if (!draggingPiece) {
                return;
            }
            if (type === "touchend") {
                var audio = new Audio('sounds/piece_drop.wav');
                audio.play();
                dragDoneHandler(draggingStartedRowCol, { row: row, col: col });
            }
            else {
                var width = gameArea.clientWidth / 8;
                var height = gameArea.clientHeight / 8;
                var ToCenter = { x: col * width + width / 2,
                    y: row * height + height / 2 };
                var FromCenter = { x: draggingStartedRowCol.col * width + width / 2,
                    y: draggingStartedRowCol.row * height + height / 2 };
                draggingPiece.style.left = (ToCenter.x - FromCenter.x + gameArea.clientWidth / 16) + "px";
                draggingPiece.style.top = (ToCenter.y - FromCenter.y + gameArea.clientWidth / 16) + "px";
            }
        }
        if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
            // drag ended
            // return the piece to its original style (then angular will take care to hide it).
            draggingPiece.style.width = '40%';
            draggingPiece.style.top = '50%';
            draggingPiece.style.left = '50%';
            for (var i = 0; i < draggingPieceAvailableMoves.length; i++) {
                draggingPieceAvailableMoves[i].style['stroke-width'] = '';
                draggingPieceAvailableMoves[i].style['stroke'] = '';
                draggingPieceAvailableMoves[i].setAttribute("rx", "");
                draggingPieceAvailableMoves[i].setAttribute("ry", "");
            }
            draggingStartedRowCol = null;
            draggingPiece = null;
            draggingPieceAvailableMoves = null;
        }
    }
    function dragDoneHandler(fromPos, toPos) {
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!isYourTurn) {
            return;
        }
        deltaFrom = fromPos;
        deltaTo = toPos;
        if (rotate) {
            deltaFrom.row = 7 - deltaFrom.row;
            deltaFrom.col = 7 - deltaFrom.col;
            deltaTo.row = 7 - deltaTo.row;
            deltaTo.col = 7 - deltaTo.col;
        }
        actuallyMakeMove();
    }
    function actuallyMakeMove() {
        try {
            var move = gameLogic.createMove(board, deltaFrom, deltaTo, turnIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition);
            isYourTurn = false; // to prevent making another move, acts as a kicj
            gameService.makeMove(move);
        }
        catch (e) {
            console.log(["Exception thrown when create move in position:", deltaFrom, deltaTo]);
            return;
        }
    }
    function getDraggingPieceAvailableMoves(row, col) {
        var select_Position = { row: row, col: col };
        var possibleMoves = gameLogic.getPossibleMoves(board, turnIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition);
        var draggingPieceAvailableMoves = [];
        var index = cellInPossibleMoves(select_Position, possibleMoves);
        if (index !== -1) {
            for (var i = 0; i < possibleMoves[index][1].length; i++) {
                var availablePos = possibleMoves[index][1][i];
                if (rotate) {
                    availablePos.row = 7 - availablePos.row;
                    availablePos.col = 7 - availablePos.col;
                }
                draggingPieceAvailableMoves.push(document.getElementById("MyBackground" +
                    availablePos.row +
                    "x" +
                    availablePos.col));
            }
        }
        return draggingPieceAvailableMoves;
    }
    game.shouldShowImage = function (row, col) {
        if (rotate) {
            row = 7 - row;
            col = 7 - col;
        }
        return board[row][col] !== "";
    };
    game.getImageSrc = function (row, col) {
        if (rotate) {
            row = 7 - row;
            col = 7 - col;
        }
        switch (board[row][col]) {
            case 'WK': return 'chess_graphics/chess_pieces/W_King.png';
            case 'WQ': return 'chess_graphics/chess_pieces/W_Queen.png';
            case 'WR': return 'chess_graphics/chess_pieces/W_Rook.png';
            case 'WB': return 'chess_graphics/chess_pieces/W_Bishop.png';
            case 'WN': return 'chess_graphics/chess_pieces/W_Knight.png';
            case 'WP': return 'chess_graphics/chess_pieces/W_Pawn.png';
            case 'BK': return 'chess_graphics/chess_pieces/B_King.png';
            case 'BQ': return 'chess_graphics/chess_pieces/B_Queen.png';
            case 'BR': return 'chess_graphics/chess_pieces/B_Rook.png';
            case 'BB': return 'chess_graphics/chess_pieces/B_Bishop.png';
            case 'BN': return 'chess_graphics/chess_pieces/B_Knight.png';
            case 'BP': return 'chess_graphics/chess_pieces/B_Pawn.png';
            default: return '';
        }
    };
    game.getPieceKindInId = function (row, col) {
        if (board) {
            if (rotate) {
                row = 7 - row;
                col = 7 - col;
            }
            return board[row][col];
        }
    };
    game.getBackgroundFill = function (row, col) {
        if (isLight(row, col)) {
            return 'rgb(133, 87, 35)';
        }
        return 'rgb(185, 156, 107)';
    };
    function isLight(row, col) {
        var rowIsEven = row % 2 === 0;
        var colIsEven = col % 2 === 0;
        return rowIsEven && colIsEven || !rowIsEven && !colIsEven;
    }
    game.canSelect = function (row, col) {
        if (!board) {
            return false;
        }
        if (isYourTurn) {
            if (rotate) {
                row = 7 - row;
                col = 7 - col;
            }
            if (board[row][col].charAt(0) === getTurn(turnIndex)) {
                var select_Position = { row: row, col: col };
                if (!isUnderCheck) {
                    isUnderCheck = [false, false];
                }
                if (!canCastleKing) {
                    canCastleKing = [true, true];
                }
                if (!canCastleQueen) {
                    canCastleQueen = [true, true];
                }
                if (!enpassantPosition) {
                    enpassantPosition = { row: null, col: null };
                }
                var possibleMoves = gameLogic.getPossibleMoves(board, turnIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition);
                return cellInPossibleMoves(select_Position, possibleMoves) !== -1;
            }
            return false;
        }
    };
    function getTurn(turnIndex) {
        if (turnIndex === 0) {
            return 'W';
        }
        return 'B';
    }
    function cellInPossibleMoves(select_Position, possibleMoves) {
        for (var i = 0; i < possibleMoves.length; i++) {
            if (angular.equals(select_Position, possibleMoves[i][0])) {
                return i;
            }
        }
        return -1;
    }
    game.isBlackPiece = function (row, col) {
        if (rotate) {
            row = 7 - row;
            col = 7 - col;
        }
        var pieceTeam = board[row][col].charAt(0);
        return pieceTeam === 'B';
    };
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    translate.setLanguage('en', {
        CHESS_GAME: "Chess",
        RULES_OF_CHESS: "Rules of Chess",
        CLOSE: "Close",
    });
    game.init();
});
//# sourceMappingURL=game.js.map