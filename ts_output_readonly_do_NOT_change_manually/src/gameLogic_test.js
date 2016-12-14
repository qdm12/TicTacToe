describe("In Chess", function () {
    var OK = true;
    var ILLEGAL = false;
    var W_TURN = 0;
    var B_TURN = 1;
    var NO_ONE_TURN = -1;
    var NO_ONE_WINS = null;
    var W_WIN_SCORES = [1, 0];
    var B_WIN_SCORES = [0, 1];
    var TIE_SCORES = [0, 0];
    function expectStateTransition(isOk, stateTransition) {
        if (isOk) {
            gameLogic.checkMoveOk(stateTransition);
        }
        else {
            // We expect an exception to be thrown :)
            var didThrowException = false;
            try {
                gameLogic.checkMoveOk(stateTransition);
            }
            catch (e) {
                didThrowException = true;
            }
            if (!didThrowException) {
                throw new Error("We expect an illegal move, but checkMoveOk didn't throw any exception!");
            }
        }
    }
    function expectMove(isOk, turnIndexBeforeMove, turnIndexAfterMove, boardBeforeMove, boardAfterMove, endMatchScores, deltaFrom, deltaTo, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition) {
        var stateBeforeMove = null;
        if (boardBeforeMove) {
            stateBeforeMove = { board: boardBeforeMove, delta: null };
        }
        var stateTransition = {
            turnIndexBeforeMove: turnIndexBeforeMove,
            stateBeforeMove: stateBeforeMove,
            numberOfPlayers: null,
            move: { endMatchScores: endMatchScores,
                turnIndexAfterMove: turnIndexAfterMove,
                stateAfterMove: { board: boardAfterMove,
                    delta: { deltaFrom: deltaFrom,
                        deltaTo: deltaTo,
                        isUnderCheck: isUnderCheck,
                        canCastleKing: canCastleKing,
                        canCastleQueen: canCastleQueen,
                        enpassantPosition: enpassantPosition }
                }
            }
        };
        expectStateTransition(isOk, stateTransition);
    }
    it("Initial move", function () {
        var move = {
            turnIndexAfterMove: B_TURN,
            endMatchScores: NO_ONE_WINS,
            stateAfterMove: {
                board: [
                    ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
                    ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
                    ['', '', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', '', ''],
                    ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
                    ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
                ],
                delta: null
            }
        };
        var stateTransition = {
            turnIndexBeforeMove: W_TURN,
            stateBeforeMove: null,
            numberOfPlayers: null,
            move: move
        };
        expectStateTransition(OK, stateTransition);
    });
    it("Initial move setting turn to Black player is illegal", function () {
        var move = {
            turnIndexAfterMove: W_TURN,
            endMatchScores: NO_ONE_WINS,
            stateAfterMove: {
                board: [
                    ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
                    ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
                    ['', '', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', '', ''],
                    ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
                    ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
                ],
                delta: null
            }
        };
        var stateTransition = {
            turnIndexBeforeMove: B_TURN,
            stateBeforeMove: null,
            numberOfPlayers: null,
            move: move
        };
        expectStateTransition(OK, stateTransition);
    });
    it("placing WP in 5x0 from initial state is legal", function () {
        expectMove(OK, W_TURN, B_TURN, [
            ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
            ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
            ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ], [
            ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
            ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['WP', '', '', '', '', '', '', ''],
            ['', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
            ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ], null, //endMatchScores
        { row: 6, col: 0 }, //deltaFrom
        { row: 5, col: 0 }, //deltaTo
        [false, false], //isUnderCheck
        [true, true], //canCastleKing
        [true, true], //canCastleQueen
        { row: null, col: null }); //enpassantPosition
    });
    /*
    it("placing X in 0x0 from initial state but setting the turn to yourself is illegal", function() {
      expectMove(ILLEGAL, X_TURN, null, 0, 0,
        [['X', '', ''],
         ['', '', ''],
         ['', '', '']], X_TURN, NO_ONE_WINS);
    });
  
    it("placing X in 0x0 from initial state and winning is illegal", function() {
      expectMove(ILLEGAL, X_TURN, null, 0, 0,
        [['X', '', ''],
         ['', '', ''],
         ['', '', '']], NO_ONE_TURN, X_WIN_SCORES);
    });
  
    it("placing X in 0x0 from initial state and setting the wrong board is illegal", function() {
      expectMove(ILLEGAL, X_TURN, null, 0, 0,
        [['X', 'X', ''],
         ['', '', ''],
         ['', '', '']], O_TURN, NO_ONE_WINS);
    });
  
    it("placing O in 0x1 after X placed X in 0x0 is legal", function() {
      expectMove(OK, O_TURN,
        [['X', '', ''],
         ['', '', ''],
         ['', '', '']], 0, 1,
        [['X', 'O', ''],
         ['', '', ''],
         ['', '', '']], X_TURN, NO_ONE_WINS);
    });
  
    it("placing an O in a non-empty position is illegal", function() {
      expectMove(ILLEGAL, O_TURN,
        [['X', '', ''],
         ['', '', ''],
         ['', '', '']], 0, 0,
        [['O', '', ''],
         ['', '', ''],
         ['', '', '']], X_TURN, NO_ONE_WINS);
    });
  
    it("cannot move after the game is over", function() {
      expectMove(ILLEGAL, O_TURN,
        [['X', 'O', ''],
         ['X', 'O', ''],
         ['X', '', '']], 2, 1,
        [['X', 'O', ''],
         ['X', 'O', ''],
         ['X', 'O', '']], X_TURN, NO_ONE_WINS);
    });
  
    it("placing O in 2x1 is legal", function() {
      expectMove(OK, O_TURN,
        [['O', 'X', ''],
         ['X', 'O', ''],
         ['X', '', '']], 2, 1,
        [['O', 'X', ''],
         ['X', 'O', ''],
         ['X', 'O', '']], X_TURN, NO_ONE_WINS);
    });
  
    it("X wins by placing X in 2x0 is legal", function() {
      expectMove(OK, X_TURN,
        [['X', 'O', ''],
         ['X', 'O', ''],
         ['', '', '']], 2, 0,
        [['X', 'O', ''],
         ['X', 'O', ''],
         ['X', '', '']], NO_ONE_TURN, X_WIN_SCORES);
    });
  
    it("O wins by placing O in 1x1 is legal", function() {
      expectMove(OK, O_TURN,
        [['X', 'X', 'O'],
         ['X', '', ''],
         ['O', '', '']], 1, 1,
        [['X', 'X', 'O'],
         ['X', 'O', ''],
         ['O', '', '']], NO_ONE_TURN, O_WIN_SCORES);
    });
  
    it("the game ties when there are no more empty cells", function() {
      expectMove(OK, X_TURN,
        [['X', 'O', 'X'],
         ['X', 'O', 'O'],
         ['O', 'X', '']], 2, 2,
        [['X', 'O', 'X'],
         ['X', 'O', 'O'],
         ['O', 'X', 'X']], NO_ONE_TURN, TIE_SCORES);
    });
  
    it("move without board is illegal", function() {
      expectMove(ILLEGAL, X_TURN,
        [['X', 'O', 'X'],
         ['X', 'O', 'O'],
         ['O', 'X', '']], 2, 2,
        null, NO_ONE_TURN, TIE_SCORES);
    });
  
    it("placing X outside the board (in 0x3) is illegal", function() {
      expectMove(ILLEGAL, X_TURN,
        [['', '', ''],
         ['', '', ''],
         ['', '', '']], 0, 3,
        [['', '', '', 'X'],
         ['', '', ''],
         ['', '', '']], O_TURN, NO_ONE_WINS);
    });
    */
});
//# sourceMappingURL=gameLogic_test.js.map