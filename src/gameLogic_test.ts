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
  
  it("Playing legally but setting the turn back to myself is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:1,col:0}, //deltaFrom
        {row:2,col:0}, //deltaTo
        B_TURN, //turnIndexBeforeMove
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
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [false, false], //canCastleQueenBeforeMove
        [false, false], //canCastleQueenAfterMove
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
  
  it("Playing without winning making you win is illegal", function() {
    expectMove(
        ILLEGAL,
        [0,1], //endMatchScores
        {row:1,col:0}, //deltaFrom
        {row:2,col:0}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        NO_ONE_TURN, //turnIndexAfterMove
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
  
  it("Moving a piece out of the board is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:0,col:7}, //deltaFrom
        {row:0,col:8}, //deltaTo
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
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', '', 'BR'],
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
        [false, false], //canCastleQueenBeforeMove
        [false, false], //canCastleQueenAfterMove
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
  
  //BISHOP MOVEMENTS
  it("Bishop: Move of bishop is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:0,col:5}, //deltaFrom
        {row:2,col:7}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', '', 'BP'],
        ['',   '',   '',   '',   '',   '',   'BP',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', '', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', '', 'BP'],
        ['',   '',   '',   '',   '',   '',   'BP',   'BB'],
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
  
  it("Bishop: Move of bishop is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:0,col:5}, //deltaFrom
        {row:2,col:5}, //deltaTo
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
  
  
  
  
  
  //QUEEN MOVEMENTS
  it("Queen: Move of queen is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:0,col:3}, //deltaFrom
        {row:2,col:3}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', '', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   'BP',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', '', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', '', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   'BQ',   '',   '',   '',   ''],
        ['',   '',   '',   'BP',   '',   '',   '',   ''],
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
  
  it("Queen: Move of queen is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:0,col:3}, //deltaFrom
        {row:2,col:2}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', '', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', '', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', '', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   'BQ',   '',   '',   '',   '',   ''],
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
        [false, false], //canCastleKingBeforeMove
        [false, false], //canCastleKingAfterMove
        [false, false], //canCastleQueenBeforeMove
        [false, false], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("King: Move of king is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:2,col:4}, //deltaFrom
        {row:3,col:0}, //deltaTo
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
        ['BK',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [false, false], //canCastleKingBeforeMove
        [false, false], //canCastleKingAfterMove
        [false, false], //canCastleQueenBeforeMove
        [false, false], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });


  
  
  //ROOK MOVEMENTS
  it("Rook: Move of rook (Black, Queen side) is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:0,col:0}, //deltaFrom
        {row:2,col:0}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['BP',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['BR',   '',   '',   '',   '',   '',   '',   ''],
        ['BP',   '',   '',   '',   '',   '',   '',   ''],
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
        [true, false], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Rook: Move of rook (Black, King side) is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:0,col:7}, //deltaFrom
        {row:2,col:7}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', ''],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', ''],
        ['',   '',   '',   '',   '',   '',   '',   'BR'],
        ['',   '',   '',   '',   '',   '',   '',   'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, false], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Rook: Move of rook is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:0,col:0}, //deltaFrom
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
        ['', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['BR',   '',   '',   '',   '',   '',   '',   ''],
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
        [true, false], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  
  
  
  
  
  
  
  
  
  
  
  //ISTIE MOVEMENTS
  it("IsTie: Only Pawns can move", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:1,col:7}, //deltaFrom
        {row:2,col:7}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['', '', '', '', '', '', '', ''],
        ['BP', 'BP', '', '', '', '', '', 'BP'],
        ['BK',   'BP',   '',   '',   '',   '',   '',   ''],
        ['BP',   'BP',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   'WK',   '',   '',   '',   '']
        ],
        //boardAfterMove
        [
        ['', '', '', '', '', '', '', ''],
        ['BP', 'BP', '', '', '', '', '', ''],
        ['BK',   'BP',   '',   '',   '',   '',   '',   'BP'],
        ['BP',   'BP',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   'WK',   '',   '',   '',   '']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [false, false], //canCastleKingBeforeMove
        [false, false], //canCastleKingAfterMove
        [false, false], //canCastleQueenBeforeMove
        [false, false], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("IsTie: Bishop can move", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:1,col:7}, //deltaFrom
        {row:0,col:6}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['', '', '', '', '', '', '', ''],
        ['BP', 'BP', '', '', '', '', '', 'BB'],
        ['BK',   'BP',   '',   '',   '',   '',   '',   ''],
        ['BP',   'BP',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   'WK',   '',   '',   '',   '']
        ],
        //boardAfterMove
        [
        ['', '', '', '', '', '', 'BB', ''],
        ['BP', 'BP', '', '', '', '', '', ''],
        ['BK',   'BP',   '',   '',   '',   '',   '',   ''],
        ['BP',   'BP',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   'WK',   '',   '',   '',   '']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [false, false], //canCastleKingBeforeMove
        [false, false], //canCastleKingAfterMove
        [false, false], //canCastleQueenBeforeMove
        [false, false], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("IsTie: Rook can move", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:1,col:7}, //deltaFrom
        {row:1,col:6}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['', '', '', '', '', '', '', ''],
        ['BP', 'BP', '', '', '', '', '', 'BR'],
        ['BK',   'BP',   '',   '',   '',   '',   '',   ''],
        ['BP',   'BP',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   'WK',   '',   '',   '',   '']
        ],
        //boardAfterMove
        [
        ['', '', '', '', '', '', '', ''],
        ['BP', 'BP', '', '', '', '', 'BR', ''],
        ['BK',   'BP',   '',   '',   '',   '',   '',   ''],
        ['BP',   'BP',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   'WK',   '',   '',   '',   '']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [false, false], //canCastleKingBeforeMove
        [false, false], //canCastleKingAfterMove
        [false, false], //canCastleQueenBeforeMove
        [false, false], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("IsTie: Queen can move", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:1,col:7}, //deltaFrom
        {row:1,col:6}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['', '', '', '', '', '', '', ''],
        ['BP', 'BP', '', '', '', '', '', 'BQ'],
        ['BK',   'BP',   '',   '',   '',   '',   '',   ''],
        ['BP',   'BP',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   'WK',   '',   '',   '',   '']
        ],
        //boardAfterMove
        [
        ['', '', '', '', '', '', '', ''],
        ['BP', 'BP', '', '', '', '', 'BQ', ''],
        ['BK',   'BP',   '',   '',   '',   '',   '',   ''],
        ['BP',   'BP',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   'WK',   '',   '',   '',   '']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [false, false], //canCastleKingBeforeMove
        [false, false], //canCastleKingAfterMove
        [false, false], //canCastleQueenBeforeMove
        [false, false], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("IsTie: None can move", function() { //XXX ERROR
    expectMove(
        OK,
        [0,0], //endMatchScores
        {row:5,col:1}, //deltaFrom
        {row:6,col:1}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        NO_ONE_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['', '', '', '', '', '', 'WP', 'WK'],
        ['', '', '', '', '', '', 'WP', 'WP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   'BP',   '',   '',   '',   '',   '',   ''],
        ['BP',   '',   '',   '',   '',   '',   '',   ''],
        ['BK',   'BP',   '',   '',   '',   '',   '',   '']
        ],
        //boardAfterMove
        [
        ['', '', '', '', '', '', 'WP', 'WK'],
        ['', '', '', '', '', '', 'WP', 'WP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['BP',   'BP',   '',   '',   '',   '',   '',   ''],
        ['BK',   'BP',   '',   '',   '',   '',   '',   '']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [false, false], //canCastleKingBeforeMove
        [false, false], //canCastleKingAfterMove
        [false, false], //canCastleQueenBeforeMove
        [false, false], //canCastleQueenAfterMove
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
        [false, false], //canCastleKingBeforeMove
        [false, false], //canCastleKingAfterMove
        [false, false], //canCastleQueenBeforeMove
        [false, false], //canCastleQueenAfterMove
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
        [false, false], //canCastleKingBeforeMove
        [false, false], //canCastleKingAfterMove
        [false, false], //canCastleQueenBeforeMove
        [false, false], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Undercheck Black winner with extra white Queen", function() {
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
        ['', '', '', '', '', '', 'WP', ''],
        ['', '', '', '', '', '', 'WP', 'WQ']
        ],
        //boardAfterMove
        [
        ['BK', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   'BR',   '',   '',   ''],
        ['',   'BR',   'WK',   '',   '',   '',   '',   ''],
        ['',   'BR',   '',   '',   '',   '',   '',   ''],
        ['', '', '', '', '', '', 'WP', ''],
        ['', '', '', '', '', '', 'WP', 'WQ']
        ],
        [true, false], //isUnderCheckBeforeMove
        [true, false], //isUnderCheckAfterMove
        [false, false], //canCastleKingBeforeMove
        [false, false], //canCastleKingAfterMove
        [false, false], //canCastleQueenBeforeMove
        [false, false], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Undercheck Black winner with extra white rook", function() {
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
        ['', '', '', '', '', '', '', 'WR']
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
        ['', '', '', '', '', '', '', 'WR']
        ],
        [true, false], //isUnderCheckBeforeMove
        [true, false], //isUnderCheckAfterMove
        [false, false], //canCastleKingBeforeMove
        [false, false], //canCastleKingAfterMove
        [false, false], //canCastleQueenBeforeMove
        [false, false], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Undercheck Black winner with extra white bishop", function() {
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
        ['', '', '', '', '', '', 'WP', ''],
        ['', '', '', '', '', '', '', 'WB']
        ],
        //boardAfterMove
        [
        ['BK', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   'BR',   '',   '',   ''],
        ['',   'BR',   'WK',   '',   '',   '',   '',   ''],
        ['',   'BR',   '',   '',   '',   '',   '',   ''],
        ['', '', '', '', '', '', 'WP', ''],
        ['', '', '', '', '', '', '', 'WB']
        ],
        [true, false], //isUnderCheckBeforeMove
        [true, false], //isUnderCheckAfterMove
        [false, false], //canCastleKingBeforeMove
        [false, false], //canCastleKingAfterMove
        [false, false], //canCastleQueenBeforeMove
        [false, false], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Undercheck Black winner with extra white knight", function() {
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
        ['', '', '', '', '', '', '', 'WN']
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
        ['', '', '', '', '', '', '', 'WN']
        ],
        [true, false], //isUnderCheckBeforeMove
        [true, false], //isUnderCheckAfterMove
        [false, false], //canCastleKingBeforeMove
        [false, false], //canCastleKingAfterMove
        [false, false], //canCastleQueenBeforeMove
        [false, false], //canCastleQueenAfterMove
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
        [false, true], //canCastleKingBeforeMove
        [false, true], //canCastleKingAfterMove
        [false, true], //canCastleQueenBeforeMove
        [false, true], //canCastleQueenAfterMove
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
        [false, true], //canCastleKingBeforeMove
        [false, true], //canCastleKingAfterMove
        [false, true], //canCastleQueenBeforeMove
        [false, true], //canCastleQueenAfterMove
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
        [false, true], //canCastleKingBeforeMove
        [false, true], //canCastleKingAfterMove
        [false, true], //canCastleQueenBeforeMove
        [false, true], //canCastleQueenAfterMove
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
        [false, true], //canCastleKingBeforeMove
        [false, true], //canCastleKingAfterMove
        [false, true], //canCastleQueenBeforeMove
        [false, true], //canCastleQueenAfterMove
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
        [false, true], //canCastleKingBeforeMove
        [false, true], //canCastleKingAfterMove
        [false, true], //canCastleQueenBeforeMove
        [false, true], //canCastleQueenAfterMove
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
        ['', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['BP',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [true, false], //isUnderCheckAfterMove
        [true, false], //canCastleKingBeforeMove
        [true, false], //canCastleKingAfterMove
        [true, false], //canCastleQueenBeforeMove
        [true, false], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  




  //CASTLING MOVES
  it("Castling king on the king side is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:0,col:4}, //deltaFrom
        {row:0,col:6}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', '', '', 'BR'],
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
        ['BR', 'BN', 'BB', 'BQ', '', 'BR', 'BK', ''],
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
        [true, false], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, false], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Castling king on the queen side is legal", function() {
    expectMove(
        OK,
        null, //endMatchScores
        {row:0,col:4}, //deltaFrom
        {row:0,col:2}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', '', '', '', 'BK', 'BB', 'BN', 'BR'],
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
        ['', '', 'BK', 'BR', '', 'BB', 'BN', 'BR'],
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
        [true, false], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, false], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Castling king if king is already under attack is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:0,col:4}, //deltaFrom
        {row:0,col:6}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', '', '', '', 'BK', '', '', 'BR'],
        ['BP', 'BP', 'BP', 'BP', '', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   'WR',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', '']
        ],
        //boardAfterMove
        [
        ['BR', '', '', '', '', 'BR', 'BK', ''],
        ['BP', 'BP', 'BP', 'BP', '', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   'WR',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', '']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [false, false], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, true], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  
  it("Castling king on the king side if any empty cell is under attack is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:0,col:4}, //deltaFrom
        {row:0,col:6}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', '', '', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', '', '', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   'WR',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', '']
        ],
        //boardAfterMove
        [
        ['BR', 'BN', 'BB', 'BQ', '', 'BR', 'BK', ''],
        ['BP', 'BP', 'BP', 'BP', 'BP', '', '', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   'WR',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', '']
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
  
  it("Castling king on the queen side if any empty cell is under attack is illegal", function() {
    expectMove(
        ILLEGAL,
        null, //endMatchScores
        {row:0,col:4}, //deltaFrom
        {row:0,col:2}, //deltaTo
        B_TURN, //turnIndexBeforeMove
        W_TURN, //turnIndexAfterMove
        //boardBeforeMove
        [
        ['BR', '', '', '', 'BK', 'BB', 'BN', 'BR'],
        ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   'WR',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        //boardAfterMove
        [
        ['', '', 'BK', 'BR', '', 'BB', 'BN', 'BR'],
        ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   'WR',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false, false], //isUnderCheckBeforeMove
        [false, false], //isUnderCheckAfterMove
        [true, true], //canCastleKingBeforeMove
        [true, true], //canCastleKingAfterMove
        [true, true], //canCastleQueenBeforeMove
        [true, false], //canCastleQueenAfterMove
        {row: null, col: null}, //enpassantPositionBeforeMove
        {row: null, col: null}); //enpassantPositionAfterMove
  });
  

  
  
  

});
