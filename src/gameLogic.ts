type Board = string[][];
type Pos = {row:number, col:number};

interface IState {  //this has to be used for ismoveok()
  board:Board;
  isUnderCheck: Boolean;
  canCastleKing: Boolean;
  canCastleQueen: Boolean;
  enpassantPosition:any;
}

interface IMove2{ //this has to be used for ismoveok()
  deltaFrom:Pos;
  deltaTo:Pos;
  promoteTo:string;
}

module gameLogic {
  export function getInitialBoard():Board {
    return [
      ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
      ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
      ['',   '',   '',   '',   '',   '',   '',   ''],
      ['',   '',   '',   '',   '',   '',   '',   ''],
      ['',   '',   '',   '',   '',   '',   '',   ''],
      ['',   '',   '',   '',   '',   '',   '',   ''],
      ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
      ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
      ];
  }

  // Returns true if the game ended in a tie because there are no available moves for any pieces
  function isTie(board:Board, turnIndex:number, isUnderCheck:[Boolean,Boolean], canCastleKing:[Boolean,Boolean], canCastleQueen:[Boolean,Boolean], enpassantPosition:Pos) {
    if (isUnderCheck[turnIndex]) {
      return false;
    }
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j] !== '' && board[i][j].charAt(0) === getTurn(turnIndex)) {
          let curPos = {row: i, col: j};
          switch (board[i][j].charAt(1)) {
            case 'K':
              if (canKingMoveAnywhere(board, turnIndex, curPos,
                  isUnderCheck, canCastleKing, canCastleQueen)) {
                return false;
              }
              break;
            case 'Q':
              if (canQueenMoveAnywhere(board, turnIndex, curPos)) {
                return false;
              }
              break;
            case 'R':
              if (canRookMoveAnywhere(board, turnIndex, curPos)) {
                return false;
              }
              break;
            case 'B':
              if (canBishopMoveAnywhere(board, turnIndex, curPos)) {
                return false;
              }
              break;
            case 'N':
              if (canKnightMoveAnywhere(board, turnIndex, curPos)) {
                return false;
              }
              break;
            case 'P':
              if (canPawnMoveAnywhere(board, turnIndex, curPos, enpassantPosition)) {
                return false;
              }
              break;
          }
        }
      }
    }
    return true;
  }

  // Returns the winner (either 'W' or 'B') or '' if there is no winner
  function getWinner(board:Board, turnIndex:number, isUnderCheck:[Boolean,Boolean], canCastleKing:[Boolean,Boolean], canCastleQueen:[Boolean,Boolean], enpassantPosition:Pos):string {
    if (!isUnderCheck[turnIndex]) {
      return '';
    }
    let kingsPosition = findKingsPosition(board, turnIndex);
    // if there is no available moves for king
    if (!canKingMoveAnywhere(board, 
                             turnIndex,
                             kingsPosition,
                             isUnderCheck,
                             canCastleKing,
                             canCastleQueen)) {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          let PieceEmpty = (board[i][j] === '');
          let PieceTeam = board[i][j].charAt(0);
          if (!PieceEmpty && PieceTeam === getTurn(turnIndex)) {
            switch (board[i][j].charAt(1)) {
              case 'Q':
                if (canQueenMoveAnywhere(board, turnIndex, {row: i, col: j})) {
                  return '';
                }
                break;
              case 'R':
                if (canRookMoveAnywhere(board, turnIndex, {row: i, col: j})) {
                  return '';
                }
                break;
              case 'B':
                if (canBishopMoveAnywhere(board, turnIndex, {row: i, col: j})) {
                  return '';
                }
                break;
              case 'N':
                if (canKnightMoveAnywhere(board, turnIndex, {row: i, col: j})) {
                  return '';
                }
                break;
              case 'P':
                if (canPawnMoveAnywhere(board, turnIndex, {row: i, col: j}, enpassantPosition)) {
                  return '';
                }
                break;
            }
          }
        }
      }
      // if we reached here then there is no piece to save the king
      return getOpponent(turnIndex);
    }
 }

 // Returns the move that should be performed when player givin a state
export function createMove(board:Board, deltaFrom:Pos, deltaTo:Pos, turnIndexBeforeMove:number,
                           isUnderCheck:[Boolean,Boolean], canCastleKing:[Boolean,Boolean], canCastleQueen:[Boolean,Boolean], 
                           enpassantPosition:Pos, promoteTo:string) {    
    // initialize all variables
    if (!board) { board = getInitialBoard(); }
    if (!isUnderCheck) { isUnderCheck = [false, false]; }
    if (!canCastleKing) { canCastleKing = [true, true]; }
    if (!canCastleQueen) { canCastleQueen = [true, true]; }
    if (!enpassantPosition) { enpassantPosition = {row: null, col: null}; }
    if (!promoteTo) { promoteTo = ''; }
    
    if (deltaFrom.row === deltaTo.row && deltaFrom.col === deltaTo.col) {
      throw new Error ("Cannot move to the same position.");
    }
    let PieceEmpty = (board[deltaTo.row][deltaTo.col] === '');
    let PieceTeam = board[deltaTo.row][deltaTo.col].charAt(0);
    if (!PieceEmpty && PieceTeam === getTurn(turnIndexBeforeMove)) {
      throw new Error("One can only make a move in an empty position or capture opponent's piece!");
    }
    if (getWinner(board,
                  turnIndexBeforeMove,
                  isUnderCheck,
                  canCastleKing,
                  canCastleQueen,
                  enpassantPosition) //there is a winner 'W' or 'B'
        ||
        isTie(board,
              turnIndexBeforeMove,
              isUnderCheck,
              canCastleKing,
              canCastleQueen,
              enpassantPosition)) {
      throw new Error("Can only make a move if the game is not over!");
    }
    let boardAfterMove = angular.copy(board),
        isUnderCheckAfterMove = angular.copy(isUnderCheck),
        canCastleKingAfterMove = angular.copy(canCastleKing),
        canCastleQueenAfterMove = angular.copy(canCastleQueen),
        enpassantPositionAfterMove = angular.copy(enpassantPosition),
        promoteToAfterMove = angular.copy(promoteTo);
    if (getTurn(turnIndexBeforeMove) !== board[deltaFrom.row][deltaFrom.col].charAt(0)) {
      throw new Error("Illegal to move this piece!");
    }

    // update the board according to the moving piece
    switch(board[deltaFrom.row][deltaFrom.col].charAt(1)) {
      case 'K':
        if (isCastlingKing(board, deltaFrom, deltaTo, turnIndexBeforeMove, canCastleKing)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = board[deltaFrom.row][deltaFrom.col];
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
          boardAfterMove[deltaTo.row][deltaTo.col - 1] = getTurn(turnIndexBeforeMove) + 'R';
          boardAfterMove[deltaTo.row][7] = '';
          canCastleKingAfterMove[turnIndexBeforeMove] = false;
          canCastleQueenAfterMove[turnIndexBeforeMove] = false;
        }
        else if (isCastlingQueen(board, deltaFrom, deltaTo, turnIndexBeforeMove, canCastleQueen)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = board[deltaFrom.row][deltaFrom.col];
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
          boardAfterMove[deltaTo.row][deltaTo.col + 1] = getTurn(turnIndexBeforeMove) + 'R';
          boardAfterMove[deltaTo.row][0] = '';
          canCastleKingAfterMove[turnIndexBeforeMove] = false;
          canCastleQueenAfterMove[turnIndexBeforeMove] = false;
        }
        else if(canKingMove(board, deltaFrom, deltaTo, turnIndexBeforeMove)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = board[deltaFrom.row][deltaFrom.col];
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
        } else {
          throw new Error("Illegal move for king.");
        }
        break;
      case 'Q':
        if(canQueenMove(board, deltaFrom, deltaTo, turnIndexBeforeMove)) {
            boardAfterMove[deltaTo.row][deltaTo.col] = board[deltaFrom.row][deltaFrom.col];
            boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
        } else {
          throw new Error("Illegal move for Queen");
        }
        break;
      case 'R':
        if(canRookMove(board, deltaFrom, deltaTo, turnIndexBeforeMove)) {
            boardAfterMove[deltaTo.row][deltaTo.col] = board[deltaFrom.row][deltaFrom.col];
            boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
        } else {
          throw new Error("Illegal move for Rook");
        }
        break;
      case 'B':
        if(canBishopMove(board, deltaFrom, deltaTo, turnIndexBeforeMove)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = board[deltaFrom.row][deltaFrom.col];
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
        } else {
          throw new Error("Illegal move for Bishop");
        }
        break;
      case 'N':
        if(canKnightMove(board, deltaFrom, deltaTo, turnIndexBeforeMove)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = board[deltaFrom.row][deltaFrom.col];
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
        } else {
          throw new Error("Illegal move for Knight");
        }
        break;
      case 'P':
        if(canPawnMove(board, deltaFrom, deltaTo, turnIndexBeforeMove, enpassantPosition)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = board[deltaFrom.row][deltaFrom.col];
          // capture the opponent pawn with enpassant
          if (enpassantPosition.row &&
              deltaFrom.row === enpassantPosition.row &&
              deltaFrom.col !== deltaTo.col &&
              (Math.abs(deltaFrom.col - enpassantPosition.col) === 1)) {
            boardAfterMove[enpassantPosition.row][enpassantPosition.col] = '';
          }
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
          enpassantPositionAfterMove.row = null;
          enpassantPositionAfterMove.col = null;

          // check for enpassant
          if (getTurn(turnIndexBeforeMove) === "W" &&
              deltaTo.row === 4) {
            if (boardAfterMove[deltaTo.row][deltaTo.col - 1] === "BP" ||
                boardAfterMove[deltaTo.row][deltaTo.col + 1] === "BP") {
              enpassantPositionAfterMove.row = deltaTo.row;
              enpassantPositionAfterMove.col = deltaTo.col;
            }
          }
          if (getTurn(turnIndexBeforeMove) === "B" &&
              deltaTo.row === 3) {
            if (boardAfterMove[deltaTo.row][deltaTo.col - 1] === "WP" ||
                boardAfterMove[deltaTo.row][deltaTo.col + 1] === "WP") {
              enpassantPositionAfterMove.row = deltaTo.row;
              enpassantPositionAfterMove.col = deltaTo.col;
            }
          }

          // check for promotion
          if (deltaTo.row === 0 || deltaTo.row === 7) {
            if (!promoteToAfterMove){
              promoteToAfterMove = getTurn(turnIndexBeforeMove) + "Q"
            }
            boardAfterMove[deltaTo.row][deltaTo.col] = promoteToAfterMove;
            // promoteToAfterMove = '';
          }
        } else {
          throw new Error("Illegal move for Pawn");
        }
        break;
      default:
        throw new Error("Unknown piece type!");
    }
    let turnIndexAfterMove = 1 - turnIndexBeforeMove;
    if (isUnderCheckByPositions(boardAfterMove, turnIndexAfterMove)) {
      isUnderCheckAfterMove[turnIndexAfterMove] = true;
    }
    let winner = getWinner(boardAfterMove,
                           turnIndexAfterMove,
                           isUnderCheckAfterMove,
                           canCastleKingAfterMove,
                           canCastleQueenAfterMove,
                           enpassantPositionAfterMove);
    let scores:any;
    if (winner === 'W'){
      scores = [1,0];
    } else if (winner == 'B'){
      scores = [0,1];
    } else if (isTie(boardAfterMove,
                     turnIndexAfterMove,
                     isUnderCheckAfterMove,
                     canCastleKingAfterMove,
                     canCastleQueenAfterMove,
                     enpassantPositionAfterMove)) {
      scores = [0,0];
    }
    let firstOperation:any;
    if(scores != null){ //game is over
      firstOperation = {endMatch: {endMatchScores: scores}};
    } else { //games continues
      firstOperation = {setTurn: {turnIndex: turnIndexAfterMove}};
    }
    return [firstOperation,
            {set: {key: 'board', value: boardAfterMove}},
            {set: {key: 'deltaFrom', value: {row: deltaFrom.row, col: deltaFrom.col}}},
            {set: {key: 'deltaTo', value: {row: deltaTo.row, col: deltaTo.col}}},
            {set: {key: 'isUnderCheck', value: isUnderCheckAfterMove}},
            {set: {key: 'canCastleKing', value: canCastleKingAfterMove}},
            {set: {key: 'canCastleQueen', value: canCastleQueenAfterMove}},
            {set: {key: 'enpassantPosition', value: enpassantPositionAfterMove}},
            {set: {key: 'promoteTo', value: promoteToAfterMove}},
            ];
  }

  // Returns true if the conditions of castle to king side satisfied
  function isCastlingKing(board:Board, deltaFrom:Pos, deltaTo:Pos, turnIndex:number, canCastleKing:[Boolean,Boolean]) {
    let caslingRow = 0;
    if (getTurn(turnIndex) === 'W'){
      caslingRow = 7;
    }
    if (isPositionUnderAttack(board, turnIndex, deltaFrom)) {
      return false;
    }
    if (canCastleKing[turnIndex] &&
        deltaFrom.row === caslingRow &&
        deltaFrom.col === 4 &&
        deltaTo.col - deltaFrom.col === 2) {
      for (let j = 5; j <= 6; j++) {
        if (board[deltaFrom.row][j] !== '') {
          return false;
        }
        if (isPositionUnderAttack(board, turnIndex, {row: deltaFrom.row, col: j})) {
          return false;
        }
      }
      return board[caslingRow][7] === getTurn(turnIndex) + 'R';
    }
    return false;
  }

  // Returns true if the conditions of castle to queen side satisfied
  function isCastlingQueen(board:Board, deltaFrom:Pos, deltaTo:Pos, turnIndex:number, canCastleQueen:[Boolean,Boolean]) {
    let caslingRow = 0;
    if (getTurn(turnIndex) === 'W'){
      caslingRow = 7;
    }
    if (isPositionUnderAttack(board, turnIndex, deltaFrom)) {
      return false;
    }
    if (canCastleQueen[turnIndex] &&
        deltaFrom.row === caslingRow &&
        deltaFrom.col === 4 &&
        deltaFrom.col - deltaTo.col === 2) {
      for (let j = 1; j < 4; j++) {
        if (board[deltaFrom.row][j] !== '') {
          return false;
        }
        if (isPositionUnderAttack(board, turnIndex, {row: deltaFrom.row, col: j})) {
          return false;
        }
      }
      return board[caslingRow][0] === getTurn(turnIndex) + 'R';
    }
    return false;
  }

  // Returns true if the deltaTo is available for king to move
  function canKingMove(board:Board, deltaFrom:Pos, deltaTo:Pos, turnIndex:number) {
    if (isOutOfBound(deltaTo)) {
      return false;
    }
    let PieceEmpty = (board[deltaTo.row][deltaTo.col] === '');
    let PieceTeam = board[deltaTo.row][deltaTo.col].charAt(0);
    if (!PieceEmpty && PieceTeam !== getTurn(turnIndex)) {
      return false;
    }
    for (let i = deltaFrom.row - 1; i < deltaFrom.row + 2; i++) {
      for (let j = deltaFrom.col - 1; j < deltaFrom.col + 2; j++) {
        if (isOutOfBound({row: i, col: j})) {
          continue;
        }
        if (i === deltaTo.row && j === deltaTo.col) {
          return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
        }
      }
    }
    return false;
  }

  // Returns true if the king has any place to move
  function canKingMoveAnywhere(board:Board, turnIndex:number, startPos:any, isUnderCheck:[Boolean,Boolean], canCastleKing:[Boolean,Boolean], canCastleQueen:[Boolean,Boolean]) {
    // standard moves
    for (let i = startPos.row - 1; i < startPos.row + 2; i++) {
      for (let j = startPos.col - 1; j < startPos.col + 2; j++) {
        let curPos = {row: i, col: j};
        if (isOutOfBound(curPos)){
          continue;
        }
        let PieceEmpty = (board[i][j] === '');
        let PieceTeam = board[i][j].charAt(0);
        if (!PieceEmpty && PieceTeam !== getTurn(turnIndex)) {
          if (moveAndCheck(board, turnIndex, startPos, curPos)) {
            return true;
          }
        }
      }
    }
    // casling moves
    if (!isUnderCheck[turnIndex]){
      if (isCastlingKing(board,
                         startPos,
                         {row: startPos.row, col: startPos.col + 2},
                         turnIndex,
                         canCastleKing)) {
        return true;
      }
      if(isCastlingQueen(board,
                         startPos,
                         {row: startPos.row, col: startPos.col - 2},
                         turnIndex,
                         canCastleQueen)) {
        return true;
      }
    }
    return false;
  }

  // Returns a list of positions available for king to move
  export function getKingPossibleMoves(board:Board, turnIndex:number, startPos:any, isUnderCheck:[Boolean,Boolean], canCastleKing:[Boolean,Boolean], canCastleQueen:[Boolean,Boolean]) {
    let destinations:any = [];
    // standard moves
    for (let i = startPos.row - 1; i < startPos.row + 2; i++) {
      for (let j = startPos.col - 1; j < startPos.col + 2; j++) {
        let curPos = {row: i, col: j};
        if (isOutOfBound(curPos)){
          continue;
        }
        let PieceEmpty = (board[i][j] === '');
        let PieceTeam = board[i][j].charAt(0);
        if (!PieceEmpty && PieceTeam !== getTurn(turnIndex)) {
          if (moveAndCheck(board, turnIndex, startPos, curPos)) {
            destinations.push(curPos);
          }
        }
      }
    }
    // casling moves
    if (!isUnderCheck[turnIndex]){
      if (isCastlingKing(board,
                         startPos,
                         {row: startPos.row, col: startPos.col + 2},
                         turnIndex,
                         canCastleKing)) {
        destinations.push({row: startPos.row, col: startPos.col + 2});
      }
      if(isCastlingQueen(board,
                         startPos,
                         {row: startPos.row, col: startPos.col - 2},
                         turnIndex,
                         canCastleQueen)) {
        destinations.push({row: startPos.row, col: startPos.col - 2});
      }
    }
    return destinations;
  }

  // Returns true if the current player's king is under check
  function isUnderCheckByPositions(board:Board, turnIndex:number) {
    let kingsPosition = findKingsPosition(board, turnIndex);
    return isPositionUnderAttack(board, turnIndex, kingsPosition);
  }

  // Returns true if the position is under attack by any opponent pieces
  function isPositionUnderAttack(board:Board, turnIndex:number, position:Pos):Boolean {
    let attPositions:any = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let PieceEmpty = (board[i][j] === '');
        let PieceTeam = board[i][j].charAt(0);
        if (!PieceEmpty && PieceTeam !== getTurn(turnIndex)) {
          var curPos = {row: i, col: j};
          switch (board[i][j].charAt(1)) {
            case 'K':
              if (canKingMove(board, curPos, position, 1 - turnIndex)) {
                return true;
              }
              break;
            case 'Q':
              if (canQueenMove(board, curPos, position, 1 - turnIndex)) {
                return true;
              }
              break;
            case 'R':
              if (canRookMove(board, curPos, position, 1 - turnIndex)) {
                return true;
              }
              break;
            case 'B':
              if (canBishopMove(board, curPos, position, 1 - turnIndex)) {
                return true;
              }
              break;
            case 'N':
              if (canKnightMove(board, curPos, position, 1 - turnIndex)) {
                return true;
              }
              break;
            case 'P':
              if (canPawnMove(board, curPos, position, 1 - turnIndex, null)) {
                return true;
              }
              break;
          }
        }
      }
    }
  }

  // Returns the position of the current player's king
  function findKingsPosition(board:Board, turnIndex:number) {
    let kingPiece = getTurn(turnIndex) + "K";
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j] === kingPiece) {
          return {row: i, col: j};
        }
      }
    }
    throw new Error("Your king is missing and the game should end!");
  }

  // Returns true if queen can move from deltaFrom to deltaTo
  function canQueenMove(board:Board, deltaFrom:Pos, deltaTo:Pos, turnIndex:number) {
    return canRookMove(board, deltaFrom, deltaTo, turnIndex) ||
           canBishopMove(board, deltaFrom, deltaTo, turnIndex);
  }

  // Returns true if the queen has any place to move
  function canQueenMoveAnywhere(board:Board, turnIndex:number, startPos:Pos) {
    return canRookMoveAnywhere(board, turnIndex, startPos) ||
           canBishopMoveAnywhere(board, turnIndex, startPos);
  }

  // Returns all available positions for queen to move
  export function getQueenPossibleMoves(board:Board, turnIndex:number, startPos:Pos) {
    return getRookPossibleMoves(board, turnIndex, startPos).concat(
           getBishopPossibleMoves(board, turnIndex, startPos));
  }

  // Returns true if the rook can move from deltaFrom to deltaTo
  function canRookMove(board:Board, deltaFrom:Pos, deltaTo:Pos, turnIndex:number) {
    if (isOutOfBound(deltaTo)) {
      return false;
    }
    let endPieceEmpty = (board[deltaTo.row][deltaTo.col] === '');
    let endPieceTeam = board[deltaTo.row][deltaTo.col].charAt(0);
    if (!endPieceEmpty && endPieceTeam === getTurn(turnIndex)) {
      return false;
    }
    if (deltaFrom.row === deltaTo.row) {
      if (deltaFrom.col === deltaTo.col) { 
        return false; 
      }
      let col1 = deltaTo.col + 1;
      let col2 = deltaFrom.col;
      if (deltaFrom.col < deltaTo.col){
        col1 = deltaFrom.col + 1;
        col2 = deltaTo.col;
      }
      for (let i = col1; i < col2; i++) {
        if (board[deltaFrom.row][i] !== '') {
          return false;
        }
      }
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    }
    else if (deltaFrom.col === deltaTo.col) {
      if (deltaFrom.row === deltaTo.row) {
        return false;
      }
      let row1 = deltaTo.row + 1;
      let row2 = deltaFrom.row;
      if (deltaFrom.row < deltaTo.row){
        row1 = deltaFrom.row + 1;
        row2 = deltaTo.row;
      }
      for (let i = row1; i < row2; i++) {
        if (board[i][deltaFrom.col] !== '') {
          return false;
        }
      }
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    } else {
      return false;
    }
  }

  // Returns true if the rook has any place to move
  function canRookMoveAnywhere(board:Board, turnIndex:number, startPos:Pos) {
    for (let i = 1; i < 8; i++) {
      let endPos1:Pos = {row: startPos.row + i, col: startPos.col},
          endPos2:Pos = {row: startPos.row - i, col: startPos.col},
          endPos3:Pos = {row: startPos.row, col: startPos.col + i},
          endPos4:Pos = {row: startPos.row, col: startPos.col - i};
      if (canRookMove(board, startPos, endPos1, turnIndex)) { return true; }
      if (canRookMove(board, startPos, endPos2, turnIndex)) { return true; }
      if (canRookMove(board, startPos, endPos3, turnIndex)) { return true; }
      if (canRookMove(board, startPos, endPos4, turnIndex)) { return true; }
    }
    return false;
  }

  // Returns all available positions for rook to move
  export function getRookPossibleMoves(board:Board, turnIndex:number, startPos:Pos) {
    let toPos:any = [];
    for (let i = 1; i < 8; i++) {
      let endPos1:Pos = {row: startPos.row + i, col: startPos.col},
          endPos2:Pos = {row: startPos.row - i, col: startPos.col},
          endPos3:Pos = {row: startPos.row, col: startPos.col + i},
          endPos4:Pos = {row: startPos.row, col: startPos.col - i};
      if (canRookMove(board, startPos, endPos1, turnIndex)) { toPos.push(endPos1); }
      if (canRookMove(board, startPos, endPos2, turnIndex)) { toPos.push(endPos2); }
      if (canRookMove(board, startPos, endPos3, turnIndex)) { toPos.push(endPos3); }
      if (canRookMove(board, startPos, endPos4, turnIndex)) { toPos.push(endPos4); }
    }
    return toPos;
  }

  // Returns true if the bishop can move from deltaFrom to deltaTo
  function canBishopMove(board:Board, deltaFrom:Pos, deltaTo:Pos, turnIndex:number):Boolean {
    if (isOutOfBound(deltaTo)) {
      return false;
    }
    let endPieceEmpty = (board[deltaTo.row][deltaTo.col] === '');
    let endPieceTeam = board[deltaTo.row][deltaTo.col].charAt(0);
    if (!endPieceEmpty && endPieceTeam === getTurn(turnIndex)) {
      return false;
    }
    let diffRow = Math.abs(deltaFrom.row - deltaTo.row)
    let diffCol = Math.abs(deltaFrom.col - deltaTo.col)
    if ((!diffRow && !diffCol) || (diffRow !== diffCol)) {
      return false;
    }
    else {
      for (let i = 1; i < diffRow; i++) {
        let cell = '';
        let col = deltaFrom.col - i;
        if (deltaFrom.col < deltaTo.col){
          col = deltaFrom.col + i;
        }
        if (deltaFrom.row < deltaTo.row) {
          cell = board[deltaFrom.row + i][col];
        } else {
          cell = board[deltaFrom.row - i][col];
        }
        if (cell !== '') {
          return false;
        }
      }
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    }
  }

  // Returns true if the rook has any place to move
  function canBishopMoveAnywhere(board:Board, turnIndex:number, startPos:any):Boolean {
    for (let i = 1; i < 8; i++) {
      let endPos1:Pos = {row: startPos.row - i, col: startPos.col - i},
          endPos2:Pos = {row: startPos.row - i, col: startPos.col + i},
          endPos3:Pos = {row: startPos.row + i, col: startPos.col - i},
          endPos4:Pos = {row: startPos.row + i, col: startPos.col + i};
      if (canBishopMove(board, startPos, endPos1, turnIndex)) { return true; }
      if (canBishopMove(board, startPos, endPos2, turnIndex)) { return true; }
      if (canBishopMove(board, startPos, endPos3, turnIndex)) { return true; }
      if (canBishopMove(board, startPos, endPos4, turnIndex)) { return true; }
    }
    return false;
  }

  // Returns the list of available positions for bishop to move
  export function getBishopPossibleMoves(board:Board, turnIndex:number, startPos:any) {
    let toPos:any = [];
    for (let i = 1; i < 8; i++) {
      let endPos1:Pos = {row: startPos.row - i, col: startPos.col - i},
          endPos2:Pos = {row: startPos.row - i, col: startPos.col + i},
          endPos3:Pos = {row: startPos.row + i, col: startPos.col - i},
          endPos4:Pos = {row: startPos.row + i, col: startPos.col + i};
      if (canBishopMove(board, startPos, endPos1, turnIndex)) { toPos.push(endPos1); }
      if (canBishopMove(board, startPos, endPos2, turnIndex)) { toPos.push(endPos2); }
      if (canBishopMove(board, startPos, endPos3, turnIndex)) { toPos.push(endPos3); }
      if (canBishopMove(board, startPos, endPos4, turnIndex)) { toPos.push(endPos4); }
    }
    return toPos;
  }

  // Returns true if the knight can move from deltaFrom to deltaTo
  function canKnightMove(board:Board, deltaFrom:Pos, deltaTo:Pos, turnIndex:number):Boolean {
    if (isOutOfBound(deltaTo)) {
      return false;
    }
    let endPieceEmpty = (board[deltaTo.row][deltaTo.col] === '');
    let endPieceTeam = board[deltaTo.row][deltaTo.col].charAt(0);
    if (!endPieceEmpty && endPieceTeam === getTurn(turnIndex)) {
      return false;
    }
    let diffRow = Math.abs(deltaFrom.row - deltaTo.row);
    let diffCol = Math.abs(deltaFrom.col - deltaTo.col);
    if (diffRow === 2 && diffCol === 1) {
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    } else if (diffRow === 1 && diffCol === 2) {
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    }
    return false;
  }

  // Returns true if the knight has any place available to move
  function canKnightMoveAnywhere(board:Board, turnIndex:number, startPos:any):Boolean {
    for (let i = startPos.row - 2; i < startPos.row + 3; i++) {
      if (i === startPos.row) {
        continue;
      }
      for (let j = startPos.col - 2; j < startPos.col + 3; j++) {
        if (j === startPos.col) {
          continue;
        }
        let endPos = {row: i, col: j};
        if (canKnightMove(board, startPos, endPos, turnIndex)) {
          return true;
        }
      }
    }
    return false;
  }

  // Returns the list of available positions for knight to move
  export function getKnightPossibleMoves(board:Board, turnIndex:number, startPos:any) {
    let toPos:any = [];
    for (let i = startPos.row - 2; i < startPos.row + 3; i++) {
      if (i === startPos.row) {
        continue;
      }
      for (let j = startPos.col - 2; j < startPos.col + 3; j++) {
        if (j === startPos.col) {
          continue;
        }
        let endPos:Pos = {row: i, col: j};
        if (canKnightMove(board, startPos, endPos, turnIndex)) {
          toPos.push(endPos);
        }
      }
    }
    return toPos;
  }

  // Returns true if the pawn can move from deltaFrom to deltaTo
  function canPawnMove(board:Board, deltaFrom:Pos, deltaTo:Pos, turnIndex:number, enpassantPosition:Pos) {
    if (isOutOfBound(deltaTo)) {
      return false;
    }
    let endPieceEmpty = (board[deltaTo.row][deltaTo.col] === '');
    let endPieceTeam = board[deltaTo.row][deltaTo.col].charAt(0);
    if (!endPieceEmpty && endPieceTeam === getTurn(turnIndex)) {
      return false;
    }
    // check if is first move with two squares
    let diffRow = Math.abs(deltaFrom.row - deltaTo.row);
    let diffCol = Math.abs(deltaFrom.col - deltaTo.col)
    if (
        (diffRow === 2 &&
         endPieceEmpty &&
         deltaFrom.col === deltaTo.col &&
         deltaFrom.row === (getTurn(turnIndex) === "W" ? 6 : 1) &&
         board[(deltaFrom.row > deltaTo.row ? deltaFrom.row : deltaTo.row) - 1][deltaTo.col] === ''
        ) || (
         diffRow === 1 &&
         endPieceEmpty &&
         deltaFrom.col === deltaTo.col
        ) || (
         diffRow === 1 && 
         diffCol === 1 &&
         endPieceTeam !== getTurn(turnIndex) &&
         !endPieceEmpty
        ) || (
         diffRow === 1 && 
         diffCol === 1 &&
         endPieceEmpty &&
         enpassantPosition &&
         enpassantPosition.row &&
         enpassantPosition.col &&
         deltaFrom.row === enpassantPosition.row &&
         Math.abs(deltaFrom.col - enpassantPosition.col) === 1
        )
       ){
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    }
    return false;
  }

  // Returns true if the pawn has any place available to move
  function canPawnMoveAnywhere(board:Board, turnIndex:number, startPos:any, enpassantPosition:Pos) {
    let endPos:Pos = {row:0, col:0};
    let blackTurn:Boolean = (getTurn(turnIndex) === 'B');

    //standard move
    if (blackTurn){
      endPos.row = startPos.row + 1;
    } else {
      endPos.row = startPos.row - 1;
    }
    for (let i = startPos.col-1; i <= startPos.col+1; i++) {
      if (i < 0 || i > 7){
        continue;
      }
      endPos.col = i;
      if (canPawnMove(board, startPos, endPos, turnIndex, enpassantPosition)) {
        return true;
      }
    }
    //Starting move of 2 cells
    if (startPos.row === (blackTurn ? 1 : 6)){
      endPos.col = startPos.col;
      if (blackTurn){
        endPos.row++;
      } else {
        endPos.row--;
      }
      if (canPawnMove(board, startPos, endPos, turnIndex, enpassantPosition)) {
        return true;
      }
    }
    return false;
  }

  // Returns the list of available positions for pawn to move
  function getPawnPossibleMoves(board:Board, turnIndex:number, startPos:any, enpassantPosition:Pos) {
    let toPos:any = [];
    let endPos:Pos = {row:0, col:0};
    let blackTurn:Boolean = (getTurn(turnIndex) === 'B');

    //standard move
    if (blackTurn){
      endPos.row = startPos.row + 1;
    } else {
      endPos.row = startPos.row - 1;
    }
    for (let i = startPos.col-1; i <= startPos.col+1; i++) {
      if (i < 0 || i > 7){
        continue;
      }
      endPos.col = i;
      if (canPawnMove(board, startPos, endPos, turnIndex, enpassantPosition)) {
        //console.log("found one: from "+startPos.row+","+startPos.col+" to "+endPos.row+","+endPos.col);
        toPos.push({row: endPos.row, col: endPos.col}); //enpassant move and regular
      }
    }
    //Starting move of 2 cells
    if (startPos.row === (blackTurn ? 1 : 6)){
      endPos.col = startPos.col;
      if (blackTurn){
        endPos.row++;
      } else {
        endPos.row--;
      }
      if (canPawnMove(board, startPos, endPos, turnIndex, enpassantPosition)) {
        toPos.push(endPos);
      }
    }
    return toPos;
  }

  // Returns true if you can actually move the piece (check condition)
  function moveAndCheck(board:Board, turnIndex:number, startPos:Pos, endPos:Pos):Boolean {
    if (board[endPos.row][endPos.col] === getOpponent(turnIndex) + 'K') {
      return true;
    }
    let boardAfterMove = angular.copy(board);
    boardAfterMove[endPos.row][endPos.col] = boardAfterMove[startPos.row][startPos.col];
    boardAfterMove[startPos.row][startPos.col] = '';
    if (isUnderCheckByPositions(boardAfterMove, turnIndex)) {
      return false;
    }
    return true;
  }

  // Returns opponent initial
  function getOpponent(turnIndex:number) {
    if (turnIndex === 0){
      return 'B';
    }
    return 'W';
  }

  // Returns turnIndex initial
  function getTurn(turnIndex:number) {
    if (turnIndex === 0){
      return 'W';
    }
    return 'B';
  }

  function isOutOfBound(pos:Pos):Boolean{
    if (pos.row < 0 || pos.col < 0 || pos.row > 7 || pos.col > 7) {
      return true;
    }
    return false;
  }


  // Returns true if move is ok
  // params contains move, stateBeforeMove and turnIndexBeforeMove
  export function isMoveOk(params:any) {
    try {
      let deltaFrom = params.move[2].set.value;
      let deltaTo = params.move[3].set.value;
      let promoteTo = params.move[8].set.value;
      let board = params.stateBeforeMove.board;
      let isUnderCheck = params.stateBeforeMove.isUnderCheck;
      let canCastleKing = params.stateBeforeMove.canCastleKing;
      let canCastleQueen = params.stateBeforeMove.canCastleQueen;
      let enpassantPosition = params.stateBeforeMove.enpassantPosition;
      let expectedMove = createMove(board,
                                    deltaFrom,
                                    deltaTo,
                                    params.turnIndexBeforeMove,
                                    isUnderCheck,
                                    canCastleKing,
                                    canCastleQueen,
                                    enpassantPosition,
                                    promoteTo);
      if (!angular.equals(params.move, expectedMove)) {
        return false;
      }
    } catch (e) {
      return false;
    }
    return true;
  }

  /* Returns all the possible moves for the given state and turnIndex.
   * Returns an empty array if the game is over. */
  export function getPossibleMoves(board:Board, turnIndex:number, isUnderCheck:[Boolean,Boolean], canCastleKing:[Boolean,Boolean], canCastleQueen:[Boolean,Boolean], enpassantPosition:Pos) {
    if (!board) {
      return [];
    }
    let possibleMoves:any = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let PieceEmpty = (board[i][j] === '');
        let PieceTeam = board[i][j].charAt(0);
        if (!PieceEmpty && PieceTeam === getTurn(turnIndex)) {
          let startPos:Pos = {row: i, col: j};
          switch(board[i][j].charAt(1)) {
            case 'K':
              possibleMoves.push([startPos,
                                  getKingPossibleMoves(board,
                                                       turnIndex,
                                                       startPos,
                                                       isUnderCheck,
                                                       canCastleKing,
                                                       canCastleQueen)
                                  ]);
              break;
            case 'Q':
              possibleMoves.push([startPos,
                                  getQueenPossibleMoves(board,
                                                        turnIndex,
                                                        startPos)
                                  ]);
              break;
            case 'R':
              possibleMoves.push([startPos,
                                  getRookPossibleMoves(board,
                                                       turnIndex,
                                                       startPos)
                                  ]);
              break;
            case 'B':
              possibleMoves.push([startPos,
                                  getBishopPossibleMoves(board,
                                                         turnIndex,
                                                         startPos)
                                  ]);
              break;
            case 'N':
              possibleMoves.push([startPos,
                                  getKnightPossibleMoves(board,
                                                         turnIndex,
                                                         startPos)
                                  ]);
              break;
            case 'P':
              possibleMoves.push([startPos,
                                  getPawnPossibleMoves(board,
                                                       turnIndex,
                                                       startPos,
                                                       enpassantPosition)
                                  ]);
              break;
          }
        }
      }
    }
    let nonEmptyPossibleMoves:any = [];
    for (let i = 0; i < possibleMoves.length; i++) {
      if (possibleMoves[i][1].length) {
        nonEmptyPossibleMoves.push(possibleMoves[i]);
      }
    }
    return nonEmptyPossibleMoves;
  }
}