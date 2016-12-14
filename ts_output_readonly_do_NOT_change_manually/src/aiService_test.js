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
                enpassantPosition: enpassantPosition }
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
        var rotate = false; //Try if true ?? XXX
        return aiService.createComputerMove(move, rotate);
    }
    it("createComputerMove returns random-ring move for Pawn' index", function () {
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
    it("createComputerMove returns attack move' index", function () {
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
    /*
  
    it("X finds an immediate winning move", function() {
      let move = createComputerMove(
          [['', '', 'O'],
           ['O', 'X', 'X'],
           ['O', 'X', 'O']], 0, 1);
      expect(angular.equals(move.stateAfterMove.delta, {row: 0, col: 1})).toBe(true);
    });
  
    it("X finds an immediate winning move in less than a second", function() {
      let move = aiService.findComputerMove({
        endMatchScores: null,
        turnIndexAfterMove: 0,
        stateAfterMove: {
          board: [['', '', 'O'],
                  ['O', 'X', 'X'],
                  ['O', 'X', 'O']],
          delta: null
        }
      });
      expect(angular.equals(move.stateAfterMove.delta, {row: 0, col: 1})).toBe(true);
    });
  
    it("O finds an immediate winning move", function() {
      let move = createComputerMove(
          [['', '', 'O'],
           ['O', 'X', 'X'],
           ['O', 'X', 'O']], 1, 1);
      expect(angular.equals(move.stateAfterMove.delta, {row: 0, col: 0})).toBe(true);
    });
  
    it("X prevents an immediate win", function() {
      let move = createComputerMove(
          [['X', '', ''],
           ['O', 'O', ''],
           ['X', '', '']], 0, 2);
      expect(angular.equals(move.stateAfterMove.delta, {row: 1, col: 2})).toBe(true);
    });
  
    it("O prevents an immediate win", function() {
      let move = createComputerMove(
          [['X', 'X', ''],
           ['O', '', ''],
           ['', '', '']], 1, 2);
      expect(angular.equals(move.stateAfterMove.delta, {row: 0, col: 2})).toBe(true);
    });
  
    it("O prevents another immediate win", function() {
      let move = createComputerMove(
          [['X', 'O', ''],
           ['X', 'O', ''],
           ['', 'X', '']], 1, 2);
      expect(angular.equals(move.stateAfterMove.delta, {row: 2, col: 0})).toBe(true);
    });
  
    it("X finds a winning move that will lead to winning in 2 steps", function() {
      let move = createComputerMove(
          [['X', '', ''],
           ['O', 'X', ''],
           ['', '', 'O']], 0, 3);
      expect(angular.equals(move.stateAfterMove.delta, {row: 0, col: 1})).toBe(true);
    });
  
    it("O finds a winning move that will lead to winning in 2 steps", function() {
      let move = createComputerMove(
          [['', 'X', ''],
           ['X', 'X', 'O'],
           ['', 'O', '']], 1, 3);
      expect(angular.equals(move.stateAfterMove.delta, {row: 2, col: 2})).toBe(true);
    });
  
    it("O finds a cool winning move that will lead to winning in 2 steps", function() {
      let move = createComputerMove(
          [['X', 'O', 'X'],
           ['X', '', ''],
           ['O', '', '']], 1, 3);
      expect(angular.equals(move.stateAfterMove.delta, {row: 2, col: 1})).toBe(true);
    });
  
    it("O finds the wrong move due to small depth", function() {
      let move = createComputerMove(
          [['X', '', ''],
           ['', '', ''],
           ['', '', '']], 1, 3);
      expect(angular.equals(move.stateAfterMove.delta, {row: 0, col: 1})).toBe(true);
    });
  
    it("O finds the correct move when depth is big enough", function() {
      let move = createComputerMove(
          [['X', '', ''],
           ['', '', ''],
           ['', '', '']], 1, 6);
      expect(angular.equals(move.stateAfterMove.delta, {row: 1, col: 1})).toBe(true);
    });
  
    it("X finds a winning move that will lead to winning in 2 steps", function() {
      let move = createComputerMove(
          [['', '', ''],
           ['O', 'X', ''],
           ['', '', '']], 0, 5);
      expect(angular.equals(move.stateAfterMove.delta, {row: 0, col: 0})).toBe(true);
    });
    */
});
//# sourceMappingURL=aiService_test.js.map