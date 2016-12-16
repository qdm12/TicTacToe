describe("aiService", function () {
    var W_TURN = 0;
    var B_TURN = 1;
    function createState(board, deltaFrom, deltaTo, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition) {
        return { board: board,
            delta: { deltaFrom: deltaFrom,
                deltaTo: deltaTo,
                isUnderCheck: isUnderCheck,
                canCastleKing: canCastleKing,
                canCastleQueen: canCastleQueen,
                enpassantPosition: enpassantPosition,
                fiftymovecounter: 0 }
        };
    }
    function createComputerMove(turnIndex, endMatchScores, board, 
        //deltaFrom: Pos,
        //deltaTo: Pos,
        isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition) {
        var move = {
            turnIndexAfterMove: turnIndex,
            endMatchScores: endMatchScores,
            stateAfterMove: createState(board, null, null, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition)
        };
        return aiService.createComputerMove(move);
    }
    it("createComputerMove returns random-ring move for Pawn' index from White", function () {
        aiService.pieceTypeIndex = 0;
        var next_move = createComputerMove(W_TURN, null, //endMatchScores
        [
            ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
            ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
            ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ], [false, false], //isUnderCheck
        [true, true], //canCastleKing
        [true, true], //canCastleQueen
        { row: null, col: null }); //enpassantPosition
        expect(next_move.stateAfterMove.delta.deltaFrom.row).toBe(6);
        expect(next_move.stateAfterMove.delta.deltaFrom.col).toBe(0);
        expect(next_move.stateAfterMove.delta.deltaTo.row).toBe(5);
        expect(next_move.stateAfterMove.delta.deltaTo.col).toBe(0);
    });
    it("createComputerMove returns attack move from White' index", function () {
        aiService.pieceTypeIndex = 0;
        var next_move = createComputerMove(W_TURN, null, //endMatchScores
        [
            ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
            ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
            ['', 'BP', '', '', '', '', '', ''],
            ['', '', 'WP', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['WP', 'WP', '', 'WP', 'WP', 'WP', 'WP', 'WP'],
            ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ], [false, false], //isUnderCheck
        [true, true], //canCastleKing
        [true, true], //canCastleQueen
        { row: null, col: null }); //enpassantPosition
        expect(next_move.stateAfterMove.delta.deltaFrom.row).toBe(3);
        expect(next_move.stateAfterMove.delta.deltaFrom.col).toBe(2);
        expect(next_move.stateAfterMove.delta.deltaTo.row).toBe(2);
        expect(next_move.stateAfterMove.delta.deltaTo.col).toBe(1);
    });
    it("createComputerMove returns attack move from Black' index", function () {
        aiService.pieceTypeIndex = 0;
        var next_move = createComputerMove(B_TURN, null, //endMatchScores
        [
            ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
            ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
            ['', 'BP', '', '', '', '', '', ''],
            ['', '', 'WP', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['WP', 'WP', '', 'WP', 'WP', 'WP', 'WP', 'WP'],
            ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ], [false, false], //isUnderCheck
        [true, true], //canCastleKing
        [true, true], //canCastleQueen
        { row: null, col: null }); //enpassantPosition
        expect(next_move.stateAfterMove.delta.deltaFrom.row).toBe(2);
        expect(next_move.stateAfterMove.delta.deltaFrom.col).toBe(1);
        expect(next_move.stateAfterMove.delta.deltaTo.row).toBe(3);
        expect(next_move.stateAfterMove.delta.deltaTo.col).toBe(2);
    });
    it("createComputerMove resets pieceTypeIndex (max reached)", function () {
        aiService.pieceTypeIndex = aiService.RListSize - 1;
        var next_move = createComputerMove(W_TURN, null, //endMatchScores
        [
            ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
            ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
            ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ], [false, false], //isUnderCheck
        [true, true], //canCastleKing
        [true, true], //canCastleQueen
        { row: null, col: null }); //enpassantPosition
        expect(aiService.pieceTypeIndex).toBe(0);
        expect(next_move.stateAfterMove.delta.deltaFrom.row).toBe(6);
        expect(next_move.stateAfterMove.delta.deltaFrom.col).toBe(7);
        expect(next_move.stateAfterMove.delta.deltaTo.row).toBe(4);
        expect(next_move.stateAfterMove.delta.deltaTo.col).toBe(7);
    });
    it("createComputerMove runs out of origin indexes and reset pieceTypeIndex", function () {
        aiService.pieceTypeIndex = aiService.RListSize - 1;
        var next_move = createComputerMove(W_TURN, null, //endMatchScores
        [
            ['', 'BN', '', '', 'BK', '', 'BN', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', 'BP', '', '', '', '', ''],
            ['', '', 'WP', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', 'WN', '', '', 'WK', '', 'WN', '']
        ], [false, false], //isUnderCheck
        [true, true], //canCastleKing
        [true, true], //canCastleQueen
        { row: null, col: null }); //enpassantPosition
        expect(aiService.pieceTypeIndex).toBe(2);
        expect(next_move.stateAfterMove.delta.deltaFrom.row).toBe(7);
        expect(next_move.stateAfterMove.delta.deltaFrom.col).toBe(6);
        expect(next_move.stateAfterMove.delta.deltaTo.row).toBe(5);
        expect(next_move.stateAfterMove.delta.deltaTo.col).toBe(7);
    });
    it("createComputerMove no possible moves", function () {
        var error = false;
        try {
            var next_move = createComputerMove(W_TURN, null, //endMatchScores
            [
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['', '', 'BP', '', '', '', '', ''],
                ['', '', 'WP', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '']
            ], [false, false], //isUnderCheck
            [true, true], //canCastleKing
            [true, true], //canCastleQueen
            { row: null, col: null }); //enpassantPosition
        }
        catch (e) {
            error = true;
        }
        expect(error).toBe(true);
    });
});
//# sourceMappingURL=aiService_test.js.map