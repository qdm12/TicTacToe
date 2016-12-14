var aiService;
(function (aiService) {
    var pieceTypeIndex = 0;
    var secondary_counter = 0;
    /** Returns the move that the computer player should do for the given state in move. */
    function findComputerMove(move, rotate) {
        var next_move;
        next_move = findAttackMove(move, rotate);
        if (next_move === null) {
            next_move = findRingMove(move); //find a "random" move
        }
        var audio = new Audio('sounds/piece_drop.wav');
        audio.play();
        return next_move;
    }
    aiService.findComputerMove = findComputerMove;
    function findAttackMove(move, rotate) {
        var board = move.stateAfterMove.board;
        var turnIndex = move.turnIndexAfterMove;
        var isUnderCheck = move.stateAfterMove.delta.isUnderCheck;
        var canCastleKing = move.stateAfterMove.delta.canCastleKing;
        var canCastleQueen = move.stateAfterMove.delta.canCastleQueen;
        var enpassantPosition = move.stateAfterMove.delta.enpassantPosition;
        var possible_moves = gameLogic.getPossibleMoves(board, turnIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition);
        if (!possible_moves.length) {
            console.log("AI: findAttackMove: There is no possible move");
            return null;
        }
        var audio = new Audio('sounds/piece_lift.mp3');
        audio.play();
        //Searches for attack move
        var deltaFrom;
        var deltaTo;
        var PriorityList = ['P', 'N', 'B', 'R', 'Q', 'K'];
        var possible_destinations;
        for (var p = 0; p < PriorityList.length; p++) {
            for (var i = 0; i < possible_moves.length; i++) {
                deltaFrom = possible_moves[i][0];
                if (board[deltaFrom.row][deltaFrom.col].charAt(1) === PriorityList[p]) {
                    possible_destinations = possible_moves[i][1];
                    for (var j = 0; j < possible_destinations.length; j++) {
                        deltaTo = possible_destinations[j];
                        if (isEnnemyCell(turnIndex, board, deltaTo, rotate)) {
                            var stateBeforeMove = void 0;
                            stateBeforeMove.board = board;
                            stateBeforeMove.delta.deltaFrom = deltaFrom;
                            stateBeforeMove.delta.deltaTo = deltaTo;
                            stateBeforeMove.delta.isUnderCheck = isUnderCheck;
                            stateBeforeMove.delta.canCastleKing = canCastleKing;
                            stateBeforeMove.delta.canCastleQueen = canCastleQueen;
                            stateBeforeMove.delta.enpassantPosition = enpassantPosition;
                            return gameLogic.createMove(stateBeforeMove, turnIndex);
                        }
                    }
                }
            }
        }
        return null; //No attack move found
    }
    function isEnnemyCell(turnIndex, board, deltaTo, rotate) {
        var teamIndex = findCellTeamIndex(board, deltaTo, rotate);
        if (teamIndex === 1 - turnIndex) {
            return true;
        }
        return false;
    }
    function findCellTeamIndex(board, deltaTo, rotate) {
        if (rotate) {
            deltaTo.row = 7 - deltaTo.row;
            deltaTo.col = 7 - deltaTo.col;
        }
        var team = board[deltaTo.row][deltaTo.col].charAt(0);
        if (team === 'W') {
            return 1; //XXX check that
        }
        else {
            return 0;
        }
    }
    function findRingMove(move) {
        var board = move.stateAfterMove.board;
        var turnIndex = move.turnIndexAfterMove;
        var isUnderCheck = move.stateAfterMove.delta.isUnderCheck;
        var canCastleKing = move.stateAfterMove.delta.canCastleKing;
        var canCastleQueen = move.stateAfterMove.delta.canCastleQueen;
        var enpassantPosition = move.stateAfterMove.delta.enpassantPosition;
        var possible_moves = gameLogic.getPossibleMoves(board, turnIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition);
        if (!possible_moves.length) {
            console.log("AI: findRingMove: There is no possible move");
            return null;
        }
        var deltaFrom;
        var deltaTo;
        var PriorityList = ['P', 'N', 'B', 'R', 'Q', 'K'];
        var possible_destinations;
        while (true) {
            switch (PriorityList[pieceTypeIndex]) {
                case 'P': secondary_counter = secondary_counter + 1;
                case 'N': secondary_counter = secondary_counter + 2;
                case 'B': secondary_counter = secondary_counter + 4;
                case 'R': secondary_counter = secondary_counter + 5;
                case 'Q': secondary_counter = secondary_counter + 7;
                case 'K': secondary_counter = secondary_counter + 14;
            }
            for (var i = 0; i < possible_moves.length; i++) {
                deltaFrom = possible_moves[i][0];
                if (board[deltaFrom.row][deltaFrom.col].charAt(1) === PriorityList[pieceTypeIndex]) {
                    possible_destinations = possible_moves[i][1];
                    deltaTo = possible_destinations[secondary_counter % possible_destinations.length];
                    var stateBeforeMove = void 0;
                    stateBeforeMove.board = board;
                    stateBeforeMove.delta.deltaFrom = deltaFrom;
                    stateBeforeMove.delta.deltaTo = deltaTo;
                    stateBeforeMove.delta.isUnderCheck = isUnderCheck; //change to stateBeforeMove = stateAfterMove
                    stateBeforeMove.delta.canCastleKing = canCastleKing;
                    stateBeforeMove.delta.canCastleQueen = canCastleQueen;
                    stateBeforeMove.delta.enpassantPosition = enpassantPosition;
                    return gameLogic.createMove(stateBeforeMove, turnIndex);
                }
            }
            if (secondary_counter === 14) {
                secondary_counter = 0;
                pieceTypeIndex++;
                if (pieceTypeIndex === PriorityList.length) {
                    pieceTypeIndex = 0;
                }
            }
        }
    }
})(aiService || (aiService = {}));
//# sourceMappingURL=aiService.js.map