describe("aiService", function() {
  let W_TURN = 0;
  let B_TURN = 1;
  
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
        switch(numberOfTimesCalledRandom){
            case 1: return 0.2134;
            case 2: return 0.1752;
            case 3: return 0.6658;
            case 4: return 0.8875;
            case 5: return 0.4821;
            case 6: return 0.8952;
            case 7: return 0.9877;
            default: throw new Error("Called Math.random more times than expected");
        }
    };
  
  it("createComputerMove returns random-ring move for Pawn' index from White", function() {
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
    expect(next_move.stateAfterMove.delta.deltaFrom.col).toBe(0);
    expect(next_move.stateAfterMove.delta.deltaTo.row).toBe(5);
    expect(next_move.stateAfterMove.delta.deltaTo.col).toBe(0);
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
