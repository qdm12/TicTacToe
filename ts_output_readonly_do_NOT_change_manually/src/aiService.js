var aiService;
(function (aiService) {
    var probabilities = { pawn: 33,
        rook: 14,
        knight: 22,
        bishop: 15,
        queen: 11,
        king: 5 };
    aiService.acc_probabilities = {
        pawn: -1, rook: -1, knight: -1, bishop: -1, queen: -1, king: -1
    }; //this is for tests
    set_acc_probabilities();
    function set_acc_probabilities() {
        var acc_prob = probabilities.pawn;
        aiService.acc_probabilities.pawn = acc_prob / 100;
        acc_prob += probabilities.rook;
        aiService.acc_probabilities.rook = acc_prob / 100;
        acc_prob += probabilities.knight;
        aiService.acc_probabilities.knight = acc_prob / 100;
        acc_prob += probabilities.bishop;
        aiService.acc_probabilities.bishop = acc_prob / 100;
        acc_prob += probabilities.queen;
        aiService.acc_probabilities.queen = acc_prob / 100;
        acc_prob += probabilities.king;
        aiService.acc_probabilities.king = acc_prob / 100;
        if (acc_prob != 100) {
            throw new Error("All the probabilities have to sum to 100 !");
        }
    }
    function get_random(max) {
        return Math.floor(Math.random() * max); //between 0 and max
    }
    function get_next_piece_type(r) {
        var acc_prob = probabilities.pawn;
        if (r <= acc_prob) {
            return 'P';
        }
        acc_prob += probabilities.rook;
        if (r <= acc_prob) {
            return 'R';
        }
        acc_prob += probabilities.knight;
        if (r <= acc_prob) {
            return 'N';
        }
        acc_prob += probabilities.bishop;
        if (r <= acc_prob) {
            return 'B';
        }
        acc_prob += probabilities.queen;
        if (r <= acc_prob) {
            return 'Q';
        }
        acc_prob += probabilities.king;
        if (r <= acc_prob) {
            return 'K';
        }
    }
    //Returns the move that the computer player should do for the given state in move.
    function createComputerMove(move) {
        var next_move;
        next_move = findAttackMove(move);
        if (next_move === null) {
            next_move = findProbabilisticMove(move); //find a "random" move
        }
        //if there is no move possible at all, next_move is null
        return next_move;
    }
    aiService.createComputerMove = createComputerMove;
    function findAttackMove(move) {
        var turnIndex = move.turnIndexAfterMove;
        var state = move.stateAfterMove;
        var board = state.board;
        var delta = state.delta;
        var possible_moves = gameLogic.getPossibleMoves(board, turnIndex, delta.isUnderCheck, delta.canCastleKing, delta.canCastleQueen, delta.enpassantPosition);
        if (!possible_moves.length) {
            throw new Error("AI: There is no possible move anymore.");
        }
        //Searches for attack move
        var deltaFrom;
        var deltaTo;
        var PriorityList = ['K', 'P', 'N', 'B', 'R', 'Q'];
        var possible_destinations;
        for (var p = 0; p < PriorityList.length; p++) {
            for (var i = 0; i < possible_moves.length; i++) {
                deltaFrom = possible_moves[i][0];
                if (board[deltaFrom.row][deltaFrom.col].charAt(1) === PriorityList[p]) {
                    possible_destinations = possible_moves[i][1];
                    for (var j = 0; j < possible_destinations.length; j++) {
                        deltaTo = possible_destinations[j];
                        if (isEnnemyCell(turnIndex, board, deltaTo)) {
                            state.delta.deltaFrom = deltaFrom;
                            state.delta.deltaTo = deltaTo;
                            return gameLogic.createMove(state, turnIndex);
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
    function findProbabilisticMove(move) {
        var turnIndex = move.turnIndexAfterMove;
        var state = move.stateAfterMove;
        var board = state.board;
        var delta = state.delta;
        var possible_moves = gameLogic.getPossibleMoves(board, turnIndex, delta.isUnderCheck, delta.canCastleKing, delta.canCastleQueen, delta.enpassantPosition);
        var deltaFrom;
        var deltaTo;
        var possible_destinations;
        var possible_moves_deltaFrom_indexes = [];
        var random = get_random(100);
        var pieceType = get_next_piece_type(random);
        while (possible_moves_deltaFrom_indexes.length === 0) {
            /*no infinite loop because we checked previously that there
              was at least one possible move*/
            for (var i = 0; i < possible_moves.length; i++) {
                deltaFrom = possible_moves[i][0];
                if (board[deltaFrom.row][deltaFrom.col].charAt(1) === pieceType) {
                    possible_moves_deltaFrom_indexes.push(i);
                }
            }
            if (possible_moves_deltaFrom_indexes.length === 0) {
                random = get_random(100);
                pieceType = get_next_piece_type(random);
            }
        }
        //We have found at least one origin for the piece type
        var x = random % possible_moves_deltaFrom_indexes.length;
        var pm_index = possible_moves_deltaFrom_indexes[x];
        deltaFrom = possible_moves[pm_index][0];
        possible_destinations = possible_moves[pm_index][1];
        var pd_index = random % possible_destinations.length;
        deltaTo = possible_destinations[pd_index];
        state.delta.deltaFrom = deltaFrom;
        state.delta.deltaTo = deltaTo;
        return gameLogic.createMove(state, turnIndex);
    }
})(aiService || (aiService = {}));
//# sourceMappingURL=aiService.js.map