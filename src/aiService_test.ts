describe("aiService", function() {
    let W_TURN = 0;
    let B_TURN = 1;
    let random_start_value = 0.2; //for pawn
  
    function createState(board: Board,
                         isUnderCheck:[boolean,boolean],
                         canCastleKing:[boolean,boolean],
                         canCastleQueen:[boolean,boolean],
                         enpassantPosition:Pos):IState{
        return {board: board,
                delta: {deltaFrom:null,
                        deltaTo:null,
                        isUnderCheck:isUnderCheck,
                        canCastleKing:canCastleKing,
                        canCastleQueen:canCastleQueen,
                        enpassantPosition:enpassantPosition,
                        fiftymovecounter:0}
        }
    }

    function createComputerMove(turnIndex: number,
                               endMatchScores:any,
                               board: Board,
                               isUnderCheck:[boolean, boolean],
                               canCastleKing:[boolean, boolean],
                               canCastleQueen:[boolean, boolean],
                               enpassantPosition:Pos): IMove {
        let move: IMove = {
            turnIndexAfterMove: turnIndex,
            endMatchScores: endMatchScores,
            stateAfterMove: createState(board, isUnderCheck, canCastleKing, 
                                        canCastleQueen, enpassantPosition)
        }
        return aiService.createComputerMove(move);
    }
  
    let numberOfTimesCalledRandom = 0;
    Math.random = function () {
        numberOfTimesCalledRandom++;
        if(numberOfTimesCalledRandom >= 100){
            //we are stuck, we need to change value (no more possible moves)
            return 0.65; //for knight
        }
        return random_start_value;
    };
  
  it("createComputerMove returns deterministic random move for Pawn from White", function() {
    random_start_value = 0.2; //for pawn
    let next_move:IMove = createComputerMove(
        W_TURN,
        null, //endMatchScores
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
        [false,false], //isUnderCheck
        [true,true], //canCastleKing
        [true,true], //canCastleQueen
        {row:null, col:null}); //enpassantPosition
    expect(next_move.stateAfterMove.delta.deltaFrom.row).toBe(6);
    expect(next_move.stateAfterMove.delta.deltaFrom.col).toBe(4);
    expect(next_move.stateAfterMove.delta.deltaTo.row).toBe(5);
    expect(next_move.stateAfterMove.delta.deltaTo.col).toBe(4);
  });
  
  it("createComputerMove returns deterministic random move for Rook from White", function() {
    random_start_value = 0.45; //for rook
    let next_move:IMove = createComputerMove(
        W_TURN,
        null, //endMatchScores
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP',   '',   '',   '',   '',   '',   '',   ''],
        ['WR', '', '', '', 'WK', '', '', '']
        ],
        [false,false], //isUnderCheck
        [true,true], //canCastleKing
        [true,true], //canCastleQueen
        {row:null, col:null}); //enpassantPosition
    expect(next_move.stateAfterMove.delta.deltaFrom.row).toBe(7);
    expect(next_move.stateAfterMove.delta.deltaFrom.col).toBe(0);
    expect(next_move.stateAfterMove.delta.deltaTo.row).toBe(7);
    expect(next_move.stateAfterMove.delta.deltaTo.col).toBe(1);
  });
  
  it("createComputerMove returns deterministic random move for Knight from White", function() {
    random_start_value = 0.51; //for knight
    let next_move:IMove = createComputerMove(
        W_TURN,
        null, //endMatchScores
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WN', '', '', '', 'WK', '', '', '']
        ],
        [false,false], //isUnderCheck
        [true,true], //canCastleKing
        [true,true], //canCastleQueen
        {row:null, col:null}); //enpassantPosition
    expect(next_move.stateAfterMove.delta.deltaFrom.row).toBe(7);
    expect(next_move.stateAfterMove.delta.deltaFrom.col).toBe(0);
    expect(next_move.stateAfterMove.delta.deltaTo.row).toBe(6);
    expect(next_move.stateAfterMove.delta.deltaTo.col).toBe(2);
  });
  
  it("createComputerMove returns deterministic random move for Bishop from White", function() {
    random_start_value = 0.75; //for bishop
    let next_move:IMove = createComputerMove(
        W_TURN,
        null, //endMatchScores
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   'WP',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WB', '', '', '', 'WK', '', '', '']
        ],
        [false,false], //isUnderCheck
        [true,true], //canCastleKing
        [true,true], //canCastleQueen
        {row:null, col:null}); //enpassantPosition
    expect(next_move.stateAfterMove.delta.deltaFrom.row).toBe(7);
    expect(next_move.stateAfterMove.delta.deltaFrom.col).toBe(0);
    expect(next_move.stateAfterMove.delta.deltaTo.row).toBe(6);
    expect(next_move.stateAfterMove.delta.deltaTo.col).toBe(1);
  });
  
  it("createComputerMove returns deterministic random move for Queen from White", function() {
    random_start_value = 0.87; //for queen
    let next_move:IMove = createComputerMove(
        W_TURN,
        null, //endMatchScores
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   'WP',   '',   '',   '',   '',   ''],
        ['WP',   '',   '',   '',   '',   '',   '',   ''],
        ['WQ', 'WP', '', '', 'WK', '', '', '']
        ],
        [false,false], //isUnderCheck
        [true,true], //canCastleKing
        [true,true], //canCastleQueen
        {row:null, col:null}); //enpassantPosition
    expect(next_move.stateAfterMove.delta.deltaFrom.row).toBe(7);
    expect(next_move.stateAfterMove.delta.deltaFrom.col).toBe(0);
    expect(next_move.stateAfterMove.delta.deltaTo.row).toBe(6);
    expect(next_move.stateAfterMove.delta.deltaTo.col).toBe(1);
  });
  
  
  it("createComputerMove returns deterministic random move for King from White", function() {
    random_start_value = 0.96; //for king
    let next_move:IMove = createComputerMove(
        W_TURN,
        null, //endMatchScores
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WK', '', '', '', '', '', '', '']
        ],
        [false,false], //isUnderCheck
        [true,true], //canCastleKing
        [true,true], //canCastleQueen
        {row:null, col:null}); //enpassantPosition
    expect(next_move.stateAfterMove.delta.deltaFrom.row).toBe(7);
    expect(next_move.stateAfterMove.delta.deltaFrom.col).toBe(0);
    expect(next_move.stateAfterMove.delta.deltaTo.row).toBe(6);
    expect(next_move.stateAfterMove.delta.deltaTo.col).toBe(0);
  });
  
  it("createComputerMove returns deterministic random move for knight after trying pawn from White", function() {
    random_start_value = 0.2; //Start with pawn
    //then it will reach 100 and go to the knight choice
    let next_move:IMove = createComputerMove(
        W_TURN,
        null, //endMatchScores
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['BP',   '',   '',   '',   '',   '',   '',   ''],
        ['WP',   '',   '',   '',   '',   '',   '',   ''],
        ['WN', '', '', '', '', '', '', 'WK']
        ],
        [false,false], //isUnderCheck
        [true,true], //canCastleKing
        [true,true], //canCastleQueen
        {row:null, col:null}); //enpassantPosition
    expect(next_move.stateAfterMove.delta.deltaFrom.row).toBe(7);
    expect(next_move.stateAfterMove.delta.deltaFrom.col).toBe(0);
    expect(next_move.stateAfterMove.delta.deltaTo.row).toBe(6);
    expect(next_move.stateAfterMove.delta.deltaTo.col).toBe(2);
  });
  
  
  it("createComputerMove returns attack move from White' index", function() {
    let next_move:IMove = createComputerMove(
        W_TURN,
        null, //endMatchScores
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   'BP',   '',   '',   '',   '',   '',   ''],
        ['',   '',   'WP',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', '', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false,false], //isUnderCheck
        [true,true], //canCastleKing
        [true,true], //canCastleQueen
        {row:null, col:null}); //enpassantPosition
    expect(next_move.stateAfterMove.delta.deltaFrom.row).toBe(3);
    expect(next_move.stateAfterMove.delta.deltaFrom.col).toBe(2);
    expect(next_move.stateAfterMove.delta.deltaTo.row).toBe(2);
    expect(next_move.stateAfterMove.delta.deltaTo.col).toBe(1);
  });
  
  it("createComputerMove returns attack move from Black' index", function() {
    let next_move:IMove = createComputerMove(
        B_TURN,
        null, //endMatchScores
        [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['',   'BP',   '',   '',   '',   '',   '',   ''],
        ['',   '',   'WP',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['',   '',   '',   '',   '',   '',   '',   ''],
        ['WP', 'WP', '', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
        ],
        [false,false], //isUnderCheck
        [true,true], //canCastleKing
        [true,true], //canCastleQueen
        {row:null, col:null}); //enpassantPosition
    expect(next_move.stateAfterMove.delta.deltaFrom.row).toBe(2);
    expect(next_move.stateAfterMove.delta.deltaFrom.col).toBe(1);
    expect(next_move.stateAfterMove.delta.deltaTo.row).toBe(3);
    expect(next_move.stateAfterMove.delta.deltaTo.col).toBe(2);
  });
  
  it("createComputerMove no possible moves", function() {
    let error:boolean = false;
    try{
        let next_move:IMove = createComputerMove(
            W_TURN,
            null, //endMatchScores
            [
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['',   '',   '',   '',   '',   '',   '',   ''],
            ['',   '',   'BP',   '',   '',   '',   '',   ''],
            ['',   '',   'WP',   '',   '',   '',   '',   ''],
            ['',   '',   '',   '',   '',   '',   '',   ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '']
            ],
            [false,false], //isUnderCheck
            [true,true], //canCastleKing
            [true,true], //canCastleQueen
            {row:null, col:null}); //enpassantPosition
    }catch (e){
        error = true;
    }
    expect(error).toBe(true);
  });
});
