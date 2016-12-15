var aiService;
(function (aiService) {
    //10 Pawns, 5 Knight, 3 Bishops, 3 rooks, 2 queen, 1 king
    var RandomList = ['P', 'N', 'P', 'B', 'P', 'N', 'P', 'B', 'N', 'P', 'B', 'P', 'R', 'P', 'N', 'R', 'Q', 'N', 'P', 'Q', 'P', 'R', 'K', 'P'];
    aiService.RListSize = RandomList.length;
    aiService.pieceTypeIndex = Math.floor(Math.random() * RandomList.length);
    //overwrite initial pieceTypeIndex for unit testing    
    /** Returns the move that the computer player should do for the given state in move. */
    function createComputerMove(move) {
        var next_move;
        next_move = findAttackMove(move);
        if (next_move === null) {
            next_move = findRingMove(move); //find a "random" move
        }
        //if there is no move possible at all, next_move is null
        return next_move;
    }
    aiService.createComputerMove = createComputerMove;
    function findAttackMove(move) {
        var board = move.stateAfterMove.board;
        var turnIndex = move.turnIndexAfterMove;
        var isUnderCheck = move.stateAfterMove.delta.isUnderCheck;
        var canCastleKing = move.stateAfterMove.delta.canCastleKing;
        var canCastleQueen = move.stateAfterMove.delta.canCastleQueen;
        var enpassantPosition = move.stateAfterMove.delta.enpassantPosition;
        var possible_moves = gameLogic.getPossibleMoves(board, turnIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition);
        if (!possible_moves.length) {
            throw new Error("AI: There is no possible move anymore.");
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
                        if (isEnnemyCell(turnIndex, board, deltaTo)) {
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
    function isEnnemyCell(turnIndex, board, deltaTo) {
        var teamIndex = findCellTeamIndex(board, deltaTo);
        return teamIndex === 1 - turnIndex;
    }
    function findCellTeamIndex(board, deltaTo) {
        var team = board[deltaTo.row][deltaTo.col].charAt(0);
        if (team === 'W') {
            return 0;
        }
        else if (team === 'B') {
            return 1; //Black team
        }
        else {
            return -1; //Empty cell
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
        var deltaFrom;
        var deltaTo;
        var possible_destinations;
        var possible_origin_indexes = [];
        while (possible_origin_indexes.length === 0) {
            for (var i = 0; i < possible_moves.length; i++) {
                deltaFrom = possible_moves[i][0];
                if (board[deltaFrom.row][deltaFrom.col].charAt(1) === RandomList[aiService.pieceTypeIndex]) {
                    possible_origin_indexes.push(i);
                }
            }
            if (possible_origin_indexes.length === 0) {
                aiService.pieceTypeIndex++;
                if (aiService.pieceTypeIndex === aiService.RListSize) {
                    aiService.pieceTypeIndex = 0;
                }
            }
        }
        //We have found at least one origin for the type RandomList[pieceTypeIndex]
        var origin_index = aiService.pieceTypeIndex % possible_origin_indexes.length; //"Random"
        var pm_index = possible_origin_indexes[origin_index];
        deltaFrom = possible_moves[pm_index][0];
        possible_destinations = possible_moves[pm_index][1];
        var pd_index = aiService.pieceTypeIndex % possible_destinations.length; //"Random"
        deltaTo = possible_destinations[pd_index];
        move.stateAfterMove.delta.deltaFrom = deltaFrom;
        move.stateAfterMove.delta.deltaTo = deltaTo;
        aiService.pieceTypeIndex++; //changes the piece Type for next AI move
        if (aiService.pieceTypeIndex === aiService.RListSize) {
            aiService.pieceTypeIndex = 0; //reset the index when it reaches its max
        }
        return gameLogic.createMove(move.stateAfterMove, turnIndex);
    }
})(aiService || (aiService = {}));
//# sourceMappingURL=aiService.js.map