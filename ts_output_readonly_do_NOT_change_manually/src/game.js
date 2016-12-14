;
var game;
(function (game) {
    // Global variables are cleared when getting updateUI.
    // I export all variables to make it easy to debug in the browser by
    // simply typing in the console, e.g.,
    // game.currentUpdateUI
    game.currentUpdateUI = null;
    game.didMakeMove = false; // You can only make one move per updateUI
    game.animationEndedTimeout = null;
    game.state = null;
    // For community games.
    game.proposals = null;
    game.yourPlayerInfo = null;
    var rotate = false;
    var gameArea;
    var draggingStartedRowCol = null; // The {row: YY, col: XX} where dragging started.
    var draggingPiece = null;
    var draggingPieceAvailableMoves = null;
    var nextZIndex = 1;
    function init() {
        registerServiceWorker();
        translate.setTranslations(getTranslations());
        translate.setLanguage('en');
        resizeGameAreaService.setWidthToHeight(1);
        moveService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            checkMoveOk: gameLogic.checkMoveOk,
            updateUI: updateUI,
            communityUI: communityUI,
            getStateForOgImage: null,
        });
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
    function communityUI(communityUI) {
        log.info("Game got communityUI:", communityUI);
        // If only proposals changed, then do NOT call updateUI. Then update proposals.
        var nextUpdateUI = {
            playersInfo: [],
            playMode: communityUI.yourPlayerIndex,
            move: communityUI.move,
            numberOfPlayers: communityUI.numberOfPlayers,
            stateBeforeMove: communityUI.stateBeforeMove,
            turnIndexBeforeMove: communityUI.turnIndexBeforeMove,
            yourPlayerIndex: communityUI.yourPlayerIndex,
        };
        if (angular.equals(game.yourPlayerInfo, communityUI.yourPlayerInfo) &&
            game.currentUpdateUI && angular.equals(game.currentUpdateUI, nextUpdateUI)) {
        }
        else {
            // Things changed, so call updateUI.
            updateUI(nextUpdateUI);
        }
        // This must be after calling updateUI, because we nullify things there (like playerIdToProposal&proposals&etc)
        game.yourPlayerInfo = communityUI.yourPlayerInfo;
        var playerIdToProposal = communityUI.playerIdToProposal;
        game.didMakeMove = !!playerIdToProposal[communityUI.yourPlayerInfo.playerId];
        game.proposals = [];
        for (var i = 0; i < 8; i++) {
            game.proposals[i] = [];
            for (var j = 0; j < 8; j++) {
                game.proposals[i][j] = 0;
            }
        }
        for (var playerId in playerIdToProposal) {
            var proposal = playerIdToProposal[playerId];
            var delta = proposal.data;
            game.proposals[delta.deltaFrom.row][delta.deltaFrom.col]++; //XXX that might be wrong
        }
    }
    game.communityUI = communityUI;
    function isProposal(row, col) {
        return game.proposals && game.proposals[row][col] > 0;
    }
    game.isProposal = isProposal;
    function isProposal1(row, col) {
        return game.proposals && game.proposals[row][col] == 1;
    }
    game.isProposal1 = isProposal1;
    function isProposal2(row, col) {
        return game.proposals && game.proposals[row][col] == 2;
    }
    game.isProposal2 = isProposal2;
    function updateUI(params) {
        log.info("Game got updateUI:", params);
        game.didMakeMove = false; // Only one move per updateUI
        game.currentUpdateUI = params;
        clearAnimationTimeout();
        game.state = params.move.stateAfterMove;
        if (isFirstMove()) {
            game.state = gameLogic.getInitialState();
        }
        // We calculate the AI move only after the animation finishes,
        // because if we call aiService now
        // then the animation will be paused until the javascript finishes.
        game.animationEndedTimeout = $timeout(animationEndedCallback, 1100);
        /* If the play mode is not pass and play then "rotate" the board
         for the player. Therefore the board will always look from the
         point of view of the player in single player mode... */
        rotate = false;
        if (params.playMode === "passAndPlay") {
            rotate = true;
        }
    }
    game.updateUI = updateUI;
    function animationEndedCallback() {
        log.info("Animation ended");
        maybeSendComputerMove();
    }
    function clearAnimationTimeout() {
        if (game.animationEndedTimeout) {
            $timeout.cancel(game.animationEndedTimeout);
            game.animationEndedTimeout = null;
        }
    }
    function maybeSendComputerMove() {
        if (!isComputerTurn())
            return;
        var audio = new Audio('sounds/piece_lift.mp3');
        audio.play();
        var nextMove = aiService.createComputerMove(game.currentUpdateUI.move, rotate);
        log.info("Computer move: ", nextMove);
        makeMove(nextMove);
    }
    //window.e2e_test_stateService = stateService;
    function handleDragEvent(type, clientX, clientY) {
        if (isComputerTurn()) {
            return;
        }
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
            var col = Math.floor(8 * x / gameArea.clientWidth);
            var row = Math.floor(8 * y / gameArea.clientHeight);
            var r_row = row;
            var r_col = col;
            if (rotate) {
                r_row = 7 - r_row;
                r_col = 7 - r_col;
            }
            if (type === "touchstart" && !draggingStartedRowCol) {
                // drag started
                var PieceEmpty = (game.state.board[r_row][r_col] === '');
                var PieceTeam = game.state.board[r_row][r_col].charAt(0);
                if (!PieceEmpty && PieceTeam === getTurn(yourPlayerIndex())) {
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
    function getDraggingPieceAvailableMoves(row, col) {
        var select_Position = { row: row, col: col };
        var possibleMoves = gameLogic.getPossibleMoves(game.state.board, yourPlayerIndex(), game.state.delta.isUnderCheck, game.state.delta.canCastleKing, game.state.delta.canCastleQueen, game.state.delta.enpassantPosition);
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
    function dragDoneHandler(fromPos, toPos) {
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!isMyTurn()) {
            return;
        }
        if (rotate) {
            fromPos.row = 7 - fromPos.row;
            fromPos.col = 7 - fromPos.col;
            toPos.row = 7 - toPos.row;
            toPos.col = 7 - toPos.col;
        }
        game.state.delta.deltaFrom = fromPos;
        game.state.delta.deltaTo = toPos;
        var nextMove = null;
        try {
            nextMove = gameLogic.createMove(game.state, yourPlayerIndex());
        }
        catch (e) {
            log.info("Error occured when creating new move");
            return;
        }
        makeMove(nextMove);
    }
    function makeMove(move) {
        if (game.didMakeMove) {
            return;
        }
        game.didMakeMove = true;
        var audio = new Audio('sounds/piece_drop.wav');
        audio.play();
        if (!game.proposals) {
            moveService.makeMove(move);
        }
        else {
            var delta = move.stateAfterMove.delta;
            var myProposal = {
                data: delta,
                chatDescription: '' + (delta.deltaTo.row + 1) + 'x' + (delta.deltaTo.col + 1),
                playerInfo: game.yourPlayerInfo,
            };
            // Decide whether we make a move or not (if we have 2 other proposals supporting the same thing).
            if (game.proposals[delta.deltaTo.row][delta.deltaTo.col] < 2) {
                move = null;
            }
            moveService.communityMove(myProposal, move);
        }
    }
    game.shouldShowImage = function (row, col) {
        if (rotate) {
            row = 7 - row;
            col = 7 - col;
        }
        return game.state.board[row][col] !== "" || isProposal(row, col); //HELP
    };
    game.getImageSrc = function (row, col) {
        if (rotate) {
            row = 7 - row;
            col = 7 - col;
        }
        switch (game.state.board[row][col]) {
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
        if (game.state.board) {
            if (rotate) {
                row = 7 - row;
                col = 7 - col;
            }
            return game.state.board[row][col];
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
        return !(rowIsEven && colIsEven || !rowIsEven && !colIsEven);
    }
    function isFirstMove() {
        return !game.currentUpdateUI.move.stateAfterMove;
    }
    function yourPlayerIndex() {
        return game.currentUpdateUI.yourPlayerIndex;
    }
    function isComputer() {
        var playerInfo = game.currentUpdateUI.playersInfo[game.currentUpdateUI.yourPlayerIndex];
        // In community games, playersInfo is [].
        return playerInfo && playerInfo.playerId === '';
    }
    function isComputerTurn() {
        return isMyTurn() && isComputer();
    }
    function isHumanTurn() {
        return isMyTurn() && !isComputer();
    }
    function isMyTurn() {
        return !game.didMakeMove &&
            game.currentUpdateUI.move.turnIndexAfterMove >= 0 &&
            game.currentUpdateUI.yourPlayerIndex === game.currentUpdateUI.move.turnIndexAfterMove; // it's my turn
    }
    game.canSelect = function (row, col) {
        if (!game.state.board) {
            return false;
        }
        if (isComputerTurn()) {
            return false;
        }
        if (isMyTurn()) {
            if (rotate) {
                row = 7 - row;
                col = 7 - col;
            }
            if (game.state.board[row][col].charAt(0) === getTurn(yourPlayerIndex())) {
                var select_Position = { row: row, col: col };
                //if (!isUnderCheck) { isUnderCheck = [false, false]; }
                //if (!canCastleKing) { canCastleKing = [true, true]; } ///XXXXXX
                //if (!canCastleQueen) { canCastleQueen = [true, true]; }
                //if (!enpassantPosition) { enpassantPosition = {row: null, col: null}; }
                var possibleMoves = gameLogic.getPossibleMoves(game.state.board, yourPlayerIndex(), game.state.delta.isUnderCheck, game.state.delta.canCastleKing, game.state.delta.canCastleQueen, game.state.delta.enpassantPosition);
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
    function isPiece(row, col, turnIndex, pieceKind) {
        if (rotate) {
            row = 7 - row;
            col = 7 - col;
        }
        return game.state.board[row][col].charAt(0) === pieceKind ||
            (isProposal(row, col) && game.currentUpdateUI.move.turnIndexAfterMove == turnIndex);
    }
    function isBlackPiece(row, col) {
        return isPiece(row, col, 1, 'B');
    }
    game.isBlackPiece = isBlackPiece;
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    game.init();
});
//# sourceMappingURL=game.js.map