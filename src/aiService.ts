module aiService {
    let pieceTypeIndex:number = 0;
    
    /** Returns the move that the computer player should do for the given state in move. */
    export function findComputerMove(move:IMove, rotate:boolean):IMove {
        let next_move:IMove;
        next_move = findAttackMove(move, rotate);
        if(next_move === null){ //No attack move found
            next_move = findRingMove(move); //find a "random" move
        }
        return next_move;
    }
    
    function findAttackMove(move:IMove, rotate:boolean):IMove{
        let board:Board = move.stateAfterMove.board;
        let turnIndex:number = move.turnIndexAfterMove;
        let isUnderCheck:[boolean,boolean] = move.stateAfterMove.delta.isUnderCheck;
        let canCastleKing:[boolean,boolean] = move.stateAfterMove.delta.canCastleKing;
        let canCastleQueen:[boolean,boolean] = move.stateAfterMove.delta.canCastleQueen;
        let enpassantPosition:Pos = move.stateAfterMove.delta.enpassantPosition;
        let possible_moves = gameLogic.getPossibleMoves(board,
                                                        turnIndex,
                                                        isUnderCheck,
                                                        canCastleKing,
                                                        canCastleQueen,
                                                        enpassantPosition);         
        if(!possible_moves.length){
            console.log("AI: findAttackMove: There is no possible move");
            return null;
        }
        //Searches for attack move
        let deltaFrom:Pos;
        let deltaTo:Pos;
        let PriorityList = ['P', 'N', 'B', 'R', 'Q', 'K'];
        let possible_destinations:any;
        for(let p = 0; p < PriorityList.length; p++){ //XXX change to auto
            for(let i = 0; i < possible_moves.length; i++){
                deltaFrom = possible_moves[i][0];
                if(board[deltaFrom.row][deltaFrom.col].charAt(1) === PriorityList[p]){
                    possible_destinations = possible_moves[i][1];
                    for (let j = 0; j < possible_destinations.length; j++) {
                        deltaTo = possible_destinations[j];
                        if(isEnnemyCell(turnIndex,board,deltaTo,rotate)){
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
    
    function isEnnemyCell(turnIndex:number, board:Board, deltaTo:Pos, rotate:boolean):boolean{
        let teamIndex:number = findCellTeamIndex(board, deltaTo, rotate);
        if(teamIndex === 1 - turnIndex){
            return true;
        }
        return false;
    }
    
    function findCellTeamIndex(board:Board, deltaTo:Pos, rotate:boolean):number{
        if(rotate) {
            deltaTo.row = 7 - deltaTo.row;
            deltaTo.col = 7 - deltaTo.col;
        }
        let team:string = board[deltaTo.row][deltaTo.col].charAt(0);
        if(team === 'W'){ //White team
            return 0;
        }
        return 1; //Black team
    }
    
    function findRingMove(move:IMove):IMove{
        let board:Board = move.stateAfterMove.board;
        let turnIndex:number = move.turnIndexAfterMove;
        let isUnderCheck:[boolean,boolean] = move.stateAfterMove.delta.isUnderCheck;
        let canCastleKing:[boolean,boolean] = move.stateAfterMove.delta.canCastleKing;
        let canCastleQueen:[boolean,boolean] = move.stateAfterMove.delta.canCastleQueen;
        let enpassantPosition:Pos = move.stateAfterMove.delta.enpassantPosition;
        let possible_moves = gameLogic.getPossibleMoves(board,
                                                        turnIndex,
                                                        isUnderCheck,
                                                        canCastleKing,
                                                        canCastleQueen,
                                                        enpassantPosition);         
        if(!possible_moves.length){
            console.log("AI: findRingMove: There is no possible move");
            return null;
        }
        let deltaFrom:Pos;
        let deltaTo:Pos;
        //10 Pawns, 5 Knight, 3 Bishops, 3 rooks, 2 queen, 1 king
        let PriorityList = ['P', 'N', 'P', 'B', 'P', 'N', 'P', 'B', 'N', 'P', 'B', 'P', 'R', 'P', 'N', 'R', 'Q', 'N', 'P', 'Q', 'P', 'R', 'K', 'P'];
        let possible_destinations:any;
        while(true){
            for(let i = 0; i < possible_moves.length; i++){
                deltaFrom = possible_moves[i][0];
                if(board[deltaFrom.row][deltaFrom.col].charAt(1) === PriorityList[pieceTypeIndex]){
                    possible_destinations = possible_moves[i][1];
                    deltaTo = possible_destinations[pieceTypeIndex % possible_destinations.length];
                    move.stateAfterMove.delta.deltaFrom = deltaFrom;
                    move.stateAfterMove.delta.deltaTo = deltaTo;
                    pieceTypeIndex++;
                    if(pieceTypeIndex === PriorityList.length){
                        pieceTypeIndex = 0;
                    }
                    return gameLogic.createMove(move.stateAfterMove, turnIndex);
                }
            }
            pieceTypeIndex++;
            if(pieceTypeIndex === PriorityList.length){
                pieceTypeIndex = 0;
            }
        }
    }
}
