module aiService {
    //10 Pawns, 5 Knight, 3 Bishops, 3 rooks, 2 queen, 1 king
    let RandomList = ['P', 'N', 'P', 'B', 'P', 'N', 'P', 'B', 'N', 'P', 'B', 'P', 'R', 'P', 'N', 'R', 'Q', 'N', 'P', 'Q', 'P', 'R', 'K', 'P'];
    let pieceTypeIndex:number = Math.floor(Math.random()*RandomList.length);
    //overwrite initial pieceTypeIndex for unit testing    
    
    /** Returns the move that the computer player should do for the given state in move. */
    export function createComputerMove(move:IMove, rotate:boolean):IMove {
        let next_move:IMove;
        next_move = findAttackMove(move, rotate);
        if(next_move === null){ //No attack move found
            next_move = findRingMove(move); //find a "random" move
        }
        //if there is no move possible at all, next_move is null
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
        let possible_destinations:any;
        let possible_origin_indexes:any = [];
        while(possible_origin_indexes.length === 0){
            for(let i = 0; i < possible_moves.length; i++){
                deltaFrom = possible_moves[i][0];
                if(board[deltaFrom.row][deltaFrom.col].charAt(1) === RandomList[pieceTypeIndex]){
                    possible_origin_indexes.push(i);
                }
            }
            if(possible_origin_indexes.length === 0){ //no origins for this piece Type
                pieceTypeIndex++;
                if(pieceTypeIndex === RandomList.length){
                    pieceTypeIndex = 0;
                }
            }
        }
        //We have found at least one origin for the type RandomList[pieceTypeIndex]
        let origin_index = pieceTypeIndex % possible_origin_indexes.length; //"Random"
        let pm_index = possible_origin_indexes[origin_index];
        deltaFrom = possible_moves[pm_index][0];
        possible_destinations = possible_moves[pm_index][1];
        let pd_index = pieceTypeIndex % possible_destinations.length; //"Random"
        deltaTo = possible_destinations[pd_index];
        move.stateAfterMove.delta.deltaFrom = deltaFrom;
        move.stateAfterMove.delta.deltaTo = deltaTo;
        pieceTypeIndex++; //changes the piece Type for next AI move
        if(pieceTypeIndex === RandomList.length){
            pieceTypeIndex = 0; //reset the index when it reaches its max
        }
        return gameLogic.createMove(move.stateAfterMove, turnIndex);
    }
}
