describe("In Chess", function() {
  let OK = true;
  let ILLEGAL = false;
  let W_TURN = 0;
  let B_TURN = 1;
  let NO_ONE_TURN = -1;
  let NO_ONE_WINS: number[] = null;
  let W_WIN_SCORES = [1, 0];
  let B_WIN_SCORES = [0, 1];
  let TIE_SCORES = [0, 0];
  
  function expectStateTransition(isOk:boolean, stateTransition:IStateTransition) {
    if (isOk) {
      gameLogic.checkMoveOk(stateTransition);
    } else {
      // We expect an exception to be thrown :)
      let didThrowException = false;
      try {
        gameLogic.checkMoveOk(stateTransition);
      } catch (e) {
        didThrowException = true;
      }
      if (!didThrowException) {
        throw new Error("We expect an illegal move, but checkMoveOk didn't throw any exception!")
      }
    }   
  }
    
  function expectMove(isOk: boolean,
                      endMatchScores: number[], 
                      deltaFrom: Pos,
                      deltaTo: Pos,
                      turnIndexBeforeMove: number, 
                      turnIndexAfterMove: number,
                      boardBeforeMove: Board, 
                      boardAfterMove: Board, 
                      isUnderCheckBeforeMove:[boolean,boolean],
                      isUnderCheckAfterMove:[boolean,boolean],
                      canCastleKingBeforeMove: [boolean, boolean],
                      canCastleKingAfterMove: [boolean, boolean],
                      canCastleQueenBeforeMove: [boolean, boolean],
                      canCastleQueenAfterMove: [boolean, boolean],
                      enpassantPositionBeforeMove:Pos,
                      enpassantPositionAfterMove:Pos):void{
    let stateBeforeMove:IState = {
        board:boardBeforeMove,
        delta:{
            deltaFrom:deltaFrom,
            deltaTo:deltaTo,
            isUnderCheck:isUnderCheckBeforeMove,
            canCastleKing:canCastleKingBeforeMove,
            canCastleQueen:canCastleQueenBeforeMove,
            enpassantPosition:enpassantPositionBeforeMove
        }
    };
    let stateTransition: IStateTransition = {
      turnIndexBeforeMove: turnIndexBeforeMove,
      stateBeforeMove: stateBeforeMove,
      numberOfPlayers: null,
      move: {endMatchScores: endMatchScores,
             turnIndexAfterMove: turnIndexAfterMove,
             stateAfterMove: {board: boardAfterMove,
                              delta: {deltaFrom:deltaFrom,
                                      deltaTo:deltaTo,
                                      isUnderCheck:isUnderCheckAfterMove,
                                      canCastleKing:canCastleKingAfterMove,
                                      canCastleQueen:canCastleQueenAfterMove,
                                      enpassantPosition:enpassantPositionAfterMove}
                              }
             }
    };
    expectStateTransition(isOk, stateTransition);
  }

  it("Initial move", function() {
    let move:IMove = {
        endMatchScores: NO_ONE_WINS,
        turnIndexAfterMove: B_TURN,
        stateAfterMove: {
            board:[
      ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
      ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
      ['',   '',   '',   '',   '',   '',   '',   ''],
      ['',   '',   '',   '',   '',   '',   '',   ''],
      ['',   '',   '',   '',   '',   '',   '',   ''],
      ['WP',   '',   '',   '',   '',   '',   '',   ''],
      ['', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
      ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
      ], 
            delta: null}        
    }
    let stateTransition:IStateTransition = {
        turnIndexBeforeMove: W_TURN,
        stateBeforeMove:null,
        numberOfPlayers:null,
        move:move
    }
    expectStateTransition(OK, stateTransition);
  });

  
  it("Initial move setting turn to Black player is illegal", function() {
    let move:IMove = {
        turnIndexAfterMove: W_TURN,
        endMatchScores: NO_ONE_WINS,
        stateAfterMove: {
            board:[
      ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
      ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
      ['',   '',   '',   '',   '',   '',   '',   ''],
      ['',   '',   '',   '',   '',   '',   '',   ''],
      ['',   '',   '',   '',   '',   '',   '',   ''],
      ['',   '',   '',   '',   '',   '',   '',   ''],
      ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
      ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
      ], 
            delta: null}        
    }
    let stateTransition:IStateTransition = {
        turnIndexBeforeMove: B_TURN,
        stateBeforeMove:null,
        numberOfPlayers:null,
        move:move
    }
    expectStateTransition(ILLEGAL, stateTransition);
  });
  
  
  // FUNDAMENTALS CHECKING
  it("Playing when it is not my turn is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:1,col:0}, //deltaFrom
        {row:2,col:0}, //deltaTo
        W_TURN, //turnIndexBeforeMove
        B_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['BP',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Not moving is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:1,col:0}, //deltaFrom
        {row:1,col:0}, //deltaTo
        W_TURN, //turnIndexBeforeMove
        B_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Moving and cloning is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:6,col:0}, //deltaFrom
        {row:5,col:0}, //deltaTo
        W_TURN, //turnIndexBeforeMove
        B_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Moving to a friendly piece is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:0,col:0}, //deltaFrom
        {row:1,col:0}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BR', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Illegal piece type is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:6,col:1}, //deltaFrom
        {row:5,col:1}, //deltaTo
        W_TURN, //turnIndexBeforeMove
        B_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WX', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  
  
  
  
  
  
  
  
  
  //PAWN MOVEMENTS  
  it("Pawn: Moving WP from 6x0 to 5x0 is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:6,col:0}, //deltaFrom
        {row:5,col:0}, //deltaTo
        W_TURN, //turnIndexBeforeMove
        B_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP',   '',   '',   '',   '',   '',   '',   ''],
        ['', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Pawn: Moving WP from 6x0 to 4x0 is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:6,col:0}, //deltaFrom
        {row:4,col:0}, //deltaTo
        W_TURN, //turnIndexBeforeMove
        B_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Pawn: Attacking with WP from 6x0 to 5x1 is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:6,col:0}, //deltaFrom
        {row:5,col:1}, //deltaTo
        W_TURN, //turnIndexBeforeMove
        B_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   'BP',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   'WP',   '',   '',   '',   '',   '',   ''],
        ['', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Pawn: Attacking en passant with WP from 4x0 to 3x1 is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:4,col:0}, //deltaFrom
        {row:3,col:1}, //deltaTo
        W_TURN, //turnIndexBeforeMove
        B_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP',   'BP',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   'WP',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: 4, col: 1}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Pawn: Moving to an en passant attack position (black) is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:2,col:1}, //deltaFrom
        {row:3,col:1}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   'BP',   '',   '',   '',   '',   '',   ''],
        ['WP',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP',   'BP',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: 3, col: 1}); //enpassantPositionAfterMove
  });
  
  it("Pawn: Moving to an en passant attack position (white) is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:5,col:0}, //deltaFrom
        {row:4,col:0}, //deltaTo
        W_TURN, //turnIndexBeforeMove
        B_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   'BP',   '',   '',   '',   '',   '',   ''],
        ['WP',   '',   '',   '',   '',   '',   '',   ''],
        ['', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP',   'BP',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: 4, col: 0}); //enpassantPositionAfterMove
  });
  
  it("Pawn: Promoting pawn to Queen is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:6,col:0}, //deltaFrom
        {row:7,col:1}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['BP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'BQ', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Pawn: Moving WP from 5x0 to 3x0 is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:5,col:0}, //deltaFrom
        {row:3,col:0}, //deltaTo
        W_TURN, //turnIndexBeforeMove
        B_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP',   '',   '',   '',   '',   '',   '',   ''],
        ['', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
 
  //KNIGHT MOVEMENTS
  it("Knight: Moving above a piece is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:0,col:1}, //deltaFrom
        {row:2,col:0}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', '', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['BN',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Knight: Attacking an ennemy piece is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:0,col:1}, //deltaFrom
        {row:2,col:2}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   'WP',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', '', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', '', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   'BN',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', '', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Knight: Moving in a straight line is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:0,col:1}, //deltaFrom
        {row:4,col:1}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', '', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   'BN',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  
  
  
  //KING MOVEMENTS
  it("King: Move of king is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:2,col:4}, //deltaFrom
        {row:3,col:4}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', '', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   'BK',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', '', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   'BK',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  //UNDERCHECK MOVEMENTS
  it("Undercheck Black winner", function() {
    expectMove(
        OK,
        [0,1], //endMatchScores
        {row:2,col:4}, //deltaFrom
        {row:3,col:4}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        NO_ONE_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BK', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['',   '',   '',   '',   'BR',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   'BR',   'WK',   '',   '',   '',   '',   ''],
        ['',   'BR',   '',   '',   '',   '',   '',   ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '']
        ],
        //boardAfterMove
        [
        ['BK', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   'BR',   '',   '',   ''],
        ['',   'BR',   'WK',   '',   '',   '',   '',   ''],
        ['',   'BR',   '',   '',   '',   '',   '',   ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '']
        ],
        [true, false], //isUnderCheckBeforeMove
        [true, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Undercheck White winner", function() {
    expectMove(
        OK,
        [1,0], //endMatchScores
        {row:2,col:4}, //deltaFrom
        {row:3,col:4}, //deltaTo
        W_TURN, //turnIndexBeforeMove
        NO_ONE_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['WK', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['',   '',   '',   '',   'WR',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   'WR',   'BK',   '',   '',   '',   '',   ''],
        ['',   'WR',   '',   '',   '',   '',   '',   ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '']
        ],
        //boardAfterMove
        [
        ['WK', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   'WR',   '',   '',   ''],
        ['',   'WR',   'BK',   '',   '',   '',   '',   ''],
        ['',   'WR',   '',   '',   '',   '',   '',   ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '']
        ],
        [false, true], //isUnderCheckBeforeMove
        [false, true], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
 
  it("Undercheck but Queen can save the King is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:1,col:3}, //deltaFrom
        {row:2,col:3}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   'WK',   '',   '',   ''],
        ['',   '',   '',   'WQ',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', '', '', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', '', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   'BP',   '',   '',   '',   ''],
        ['',   '',   '',   '',   'WK',   '',   '',   ''],
        ['',   '',   '',   'WQ',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', '', '', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [true, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Undercheck but Rook can save the King is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:1,col:3}, //deltaFrom
        {row:2,col:3}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   'WK',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   'WR',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['', 'WN', 'WB', 'WQ', '', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', '', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   'BP',   '',   '',   '',   ''],
        ['',   '',   '',   '',   'WK',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   'WR',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['', 'WN', 'WB', 'WQ', '', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [true, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Undercheck but Bishop can save the King is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:1,col:3}, //deltaFrom
        {row:2,col:3}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   'WK',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WB',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', '', 'WQ', '', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', '', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   'BP',   '',   '',   '',   ''],
        ['',   '',   '',   '',   'WK',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WB',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', '', 'WQ', '', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [true, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Undercheck but Knight can save the King is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:1,col:3}, //deltaFrom
        {row:2,col:3}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   'WK',   '',   '',   ''],
        ['',   '',   'WN',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', '', 'WB', 'WQ', '', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', '', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   'BP',   '',   '',   '',   ''],
        ['',   '',   '',   '',   'WK',   '',   '',   ''],
        ['',   '',   'WN',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', '', 'WB', 'WQ', '', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [true, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Undercheck but Pawn can save the King is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:1,col:3}, //deltaFrom
        {row:2,col:3}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   'WP',   '',   'WK',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', '', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', '', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', '', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   'BP',   '',   '',   '',   ''],
        ['',   '',   'WP',   '',   'WK',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', '', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', '', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [true, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  

  
    it("King is missing from game is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:1,col:0}, //deltaFrom
        {row:2,col:0}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        NO_ONE_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', '', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', '', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [true, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  
  
  /*  
  it("placing WR in 5x0 from initial state is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:7,col:0}, //deltaFrom
        {row:5,col:0}, //deltaTo
        W_TURN, //turnIndexBeforeMove
        B_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WR',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("placing WR in 5x0 from initial state is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:7,col:0}, //deltaFrom
        {row:5,col:0}, //deltaTo
        W_TURN, //turnIndexBeforeMove
        B_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   'WP',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   'WP',   '',   '',   '',   '',   '',   ''],
        ['WR',   '',   '',   '',   '',   '',   '',   ''],
        ['', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  

  
  
  

  */
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
