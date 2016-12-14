var aiService;
(function (aiService) {
    var pieceTypeIndex = 0;
    /** Returns the move that the computer player should do for the given state in move. */
    function findComputerMove(move, rotate) {
        var next_move;
        next_move = findAttackMove(move, rotate);
        if (next_move === null) {
            next_move = findRingMove(move); //find a "random" move
        }
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
                            move.stateAfterMove.delta.deltaFrom = deltaFrom;
                            move.stateAfterMove.delta.deltaTo = deltaTo;
                            return gameLogic.createMove(move.stateAfterMove, turnIndex);
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
            return 0;
        }
        return 1; //Black team
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
        //10 Pawns, 5 Knight, 3 Bishops, 3 rooks, 2 queen, 1 king
        var PriorityList = ['P', 'N', 'P', 'B', 'P', 'N', 'P', 'B', 'N', 'P', 'B', 'P', 'R', 'P', 'N', 'R', 'Q', 'N', 'P', 'Q', 'P', 'R', 'K', 'P'];
        var possible_destinations;
        while (true) {
            for (var i = 0; i < possible_moves.length; i++) {
                deltaFrom = possible_moves[i][0];
                if (board[deltaFrom.row][deltaFrom.col].charAt(1) === PriorityList[pieceTypeIndex]) {
                    possible_destinations = possible_moves[i][1];
                    deltaTo = possible_destinations[pieceTypeIndex % possible_destinations.length];
                    move.stateAfterMove.delta.deltaFrom = deltaFrom;
                    move.stateAfterMove.delta.deltaTo = deltaTo;
                    pieceTypeIndex++;
                    if (pieceTypeIndex === PriorityList.length) {
                        pieceTypeIndex = 0;
                    }
                    return gameLogic.createMove(move.stateAfterMove, turnIndex);
                }
            }
            pieceTypeIndex++;
            if (pieceTypeIndex === PriorityList.length) {
                pieceTypeIndex = 0;
            }
        }
    }
})(aiService || (aiService = {}));
//# sourceMappingURL=aiService.js.map