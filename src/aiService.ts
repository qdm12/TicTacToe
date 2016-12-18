interface IPieceProbabilities{
    //              Action scores   % proba   acc_prob
    pawn:number;    //100           33        33
    rook:number;    //40            14        33+14=47
    knight:number;  //65            22        69
    bishop:number;  //50            15        84
    queen:number;   //30            11        95
    king:number;    //15            5         100
    //Total:          300
}

module aiService {
    //10 Pawns, 5 Knight, 3 Bishops, 3 rooks, 2 queen, 1 king
    let probabilities:IPieceProbabilities = {pawn:33, rook:14, knight:22,
                                             bishop:15, queen:11, king:5}
    
    function get_random(max:number):number{
        return Math.floor(Math.random() * max); //between 0 and max
    }
    
    
    function get_next_piece_type(r:number):string{ //random but based on probabilities given
        let acc_prob:number = probabilities.pawn;
        if(r <= acc_prob){
            return 'P';
        }
        acc_prob += probabilities.rook;
        if(r <= acc_prob){
            return 'R';
        }
        acc_prob += probabilities.knight;
        if(r <= acc_prob){
            return 'N';
        }
        acc_prob += probabilities.bishop;
        if(r <= acc_prob){
            return 'B';
        }
        acc_prob += probabilities.queen;
        if(r <= acc_prob){
            return 'Q';
        }
        acc_prob += probabilities.king;
        if(r <= acc_prob){
            return 'K';
        }
    }
    
    /** Returns the move that the computer player should do for the given state in move. */
    export function createComputerMove(move:IMove):IMove {
        let next_move:IMove;
        next_move = findAttackMove(move);
        if(next_move === null){ //No attack move found
            next_move = findProbabilisticMove(move); //find a "random" move
        }
        //if there is no move possible at all, next_move is null
        return next_move;
    }
    
    function findAttackMove(move:IMove):IMove{
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
            throw new Error("AI: There is no possible move anymore.");
        }
        //Searches for attack move
        let deltaFrom:Pos;
        let deltaTo:Pos;
        let PriorityList = ['K', 'P', 'N', 'B', 'R', 'Q'];
        let possible_destinations:any;
        for(let p = 0; p < PriorityList.length; p++){ //XXX change to auto
            for(let i = 0; i < possible_moves.length; i++){
                deltaFrom = possible_moves[i][0];
                if(board[deltaFrom.row][deltaFrom.col].charAt(1) === PriorityList[p]){
                    possible_destinations = possible_moves[i][1];
                    for (let j = 0; j < possible_destinations.length; j++) {
                        deltaTo = possible_destinations[j];
                        if(isEnnemyCell(turnIndex,board,deltaTo)){
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
    
    function isEnnemyCell(turnIndex:number, board:Board, deltaTo:Pos):boolean{
        let teamIndex:number = findCellTeamIndex(board, deltaTo);
        return teamIndex === 1 - turnIndex;
    }
    
    function findCellTeamIndex(board:Board, deltaTo:Pos):number{
        let team:string = board[deltaTo.row][deltaTo.col].charAt(0);
        if(team === 'W'){ //White team
            return 0;
        }else if(team === 'B'){
            return 1; //Black team
        }else{
            return -1; //Empty cell
        }
    }
    
    function findProbabilisticMove(move:IMove):IMove{
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
        let deltaFrom:Pos;
        let deltaTo:Pos;
        let possible_destinations:any;
        let possible_moves_deltaFrom_indexes:number[] = [];
        let random = get_random(100);
        let pieceType:string = get_next_piece_type(random);
        while(possible_moves_deltaFrom_indexes.length === 0){
            /*no infinite loop because we checked previously that there 
              was at least one possible move*/
            for(let i = 0; i < possible_moves.length; i++){
                deltaFrom = possible_moves[i][0];
                if(board[deltaFrom.row][deltaFrom.col].charAt(1) === pieceType){
                    possible_moves_deltaFrom_indexes.push(i);
                }
            }
            if(possible_moves_deltaFrom_indexes.length === 0){ //no origins for this piece Type
                random = get_random(100);
                pieceType = get_next_piece_type(random);
            }
        }
        //We have found at least one origin for the piece type
        let x:number = random % possible_moves_deltaFrom_indexes.length;
        let pm_index:number = possible_moves_deltaFrom_indexes[x];        
        deltaFrom = possible_moves[pm_index][0];
        possible_destinations = possible_moves[pm_index][1];
        let pd_index:number = random % possible_destinations.length;        
        deltaTo = possible_destinations[pd_index];
        move.stateAfterMove.delta.deltaFrom = deltaFrom;
        move.stateAfterMove.delta.deltaTo = deltaTo;
        return gameLogic.createMove(move.stateAfterMove, turnIndex);
    }
}
