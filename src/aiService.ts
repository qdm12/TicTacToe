module aiService {
    let pieceTypeIndex:number = 0;
    let secondary_counter:number = 0;
    
    /** Returns the move that the computer player should do for the given state in move. */
    export function findComputerMove(move:IMove, rotate:boolean):IMove {
        let next_move:IMove;
        next_move = findAttackMove(move, rotate);
        if(next_move === null){ //No attack move found
            next_move = findRingMove(move); //find a "random" move
        }
        let audio = new Audio('sounds/piece_drop.wav');
        audio.play();
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
        let audio = new Audio('sounds/piece_lift.mp3');
        audio.play();
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
                            let stateBeforeMove:IState;
                            stateBeforeMove.board = board;
                            stateBeforeMove.delta.deltaFrom = deltaFrom;
                            stateBeforeMove.delta.deltaTo = deltaTo;
                            stateBeforeMove.delta.isUnderCheck = isUnderCheck;
                            stateBeforeMove.delta.canCastleKing = canCastleKing;
                            stateBeforeMove.delta.canCastleQueen = canCastleQueen;
                            stateBeforeMove.delta.enpassantPosition = enpassantPosition;
                            return gameLogic.createMove(stateBeforeMove, turnIndex);
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
        if(team === 'W'){
            return 1; //XXX check that
        }else{
            return 0;
        }
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
        let PriorityList = ['P', 'N', 'B', 'R', 'Q', 'K'];
        let possible_destinations:any;
        while(true){
            switch(PriorityList[pieceTypeIndex]){ //This makes the piece kind "random"
                case 'P':secondary_counter = secondary_counter + 1;
                case 'N':secondary_counter = secondary_counter + 2;
                case 'B':secondary_counter = secondary_counter + 4;
                case 'R':secondary_counter = secondary_counter + 5;
                case 'Q':secondary_counter = secondary_counter + 7;
                case 'K':secondary_counter = secondary_counter + 14;
            }
            for(let i = 0; i < possible_moves.length; i++){
                deltaFrom = possible_moves[i][0];
                if(board[deltaFrom.row][deltaFrom.col].charAt(1) === PriorityList[pieceTypeIndex]){
                    possible_destinations = possible_moves[i][1];
                    deltaTo = possible_destinations[secondary_counter % possible_destinations.length];
                    let stateBeforeMove:IState;
                    stateBeforeMove.board = board;
                    stateBeforeMove.delta.deltaFrom = deltaFrom;
                    stateBeforeMove.delta.deltaTo = deltaTo;
                    stateBeforeMove.delta.isUnderCheck = isUnderCheck; //change to stateBeforeMove = stateAfterMove
                    stateBeforeMove.delta.canCastleKing = canCastleKing;
                    stateBeforeMove.delta.canCastleQueen = canCastleQueen;
                    stateBeforeMove.delta.enpassantPosition = enpassantPosition;
                    return gameLogic.createMove(stateBeforeMove, turnIndex);
                }
            }
            if(secondary_counter === 14){ //14 because 14 possible destinations max
                secondary_counter = 0;
                pieceTypeIndex++;
                if(pieceTypeIndex === PriorityList.length){
                    pieceTypeIndex = 0;
                }         
            }
        }
    }
}
