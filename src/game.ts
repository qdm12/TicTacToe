interface SupportedLanguages {
  en: string, iw: string,
  pt: string, zh: string,
  el: string, fr: string,
  hi: string, es: string,
};

interface Translations {
  [index: string]: SupportedLanguages;
}

module game {
  // Global variables are cleared when getting updateUI.
  // I export all variables to make it easy to debug in the browser by
  // simply typing in the console, e.g.,
  // game.currentUpdateUI
  export let currentUpdateUI: IUpdateUI = null;
  export let didMakeMove: boolean = false; // You can only make one move per updateUI
  let dragAnimationEndedTimeout: ng.IPromise<any> = null;
  let maybePlayAIliftTimeout: ng.IPromise<any> = null;
  let maybeSendComputerMoveTimeout: ng.IPromise<any> = null;
  export let state: IState = null;
  // For community games.
  export let yourPlayerInfo: IPlayerInfo = null;
  
  let gameArea:any;
  let draggingStartedRowCol:any = null; // The {row: YY, col: XX} where dragging started.
  let draggingPiece:any = null;
  let draggingPieceAvailableMoves:any = null;
  let rotated:boolean = false;
  

  export function init() {
    registerServiceWorker();
    translate.setTranslations(getTranslations());
    translate.setLanguage('en');
    resizeGameAreaService.setWidthToHeight(1);
    moveService.setGame({
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      checkMoveOk: gameLogic.checkMoveOk,
      updateUI: updateUI,
    });
    dragAndDropService.addDragListener("gameArea", handleDragEvent);
    gameArea = document.getElementById("gameArea");
  }

    function registerServiceWorker() {
    // I prefer to use appCache over serviceWorker (because iOS doesn't support serviceWorker, so we have to use appCache) I've added this code for a future where all browsers support serviceWorker (so we can deprecate appCache!)
        if (!window.applicationCache && 'serviceWorker' in navigator) {
            let n:any = navigator;
            log.log('Calling serviceWorker.register');
            n.serviceWorker.register('service-worker.js').then(function(registration: any) {
                log.log('ServiceWorker registration successful with scope: ', registration.scope);
            }).catch(function(err: any) {
                log.log('ServiceWorker registration failed: ', err);
            });
        }
    }

    function getTranslations(): Translations {
        return {}; //XXX to fill in
    }
  
  export function updateUI(params: IUpdateUI): void {
    log.info("Game got updateUI:", params);
    didMakeMove = false; // Only one move per updateUI
    currentUpdateUI = params;
    clearTimeouts();
    state = params.move.stateAfterMove;
    console.log("isFirstMove():"+isFirstMove());
    if (isFirstMove()) {
      state = gameLogic.getInitialState();
      currentUpdateUI.move.stateAfterMove = state;
    }else{
        dragAnimationEndedTimeout = $timeout(maybeRotateBoard, 300);
    }
    maybePlayAIliftTimeout = $timeout(maybePlayAIlift, 1500);
    maybeSendComputerMoveTimeout = $timeout(maybeSendComputerMove, 2200);
  }

  function clearTimeouts() {
    if (dragAnimationEndedTimeout) {
      $timeout.cancel(dragAnimationEndedTimeout);
      dragAnimationEndedTimeout = null;
    }
    if (maybePlayAIliftTimeout) {
      $timeout.cancel(maybePlayAIliftTimeout);
      maybePlayAIliftTimeout = null;
    }
    if (maybeSendComputerMoveTimeout) {
      $timeout.cancel(maybeSendComputerMoveTimeout);
      maybeSendComputerMoveTimeout = null;
    }
  }

  function maybeRotateBoard(){
    console.log("isFirstMove():"+isFirstMove());
    if(currentUpdateUI.playersInfo[0].playerId !== '' && currentUpdateUI.playersInfo[1].playerId !== ''){
        let transform:string;
        rotated = !rotated;
        gameArea.classList.toggle('rotate180');
        if(yourPlayerIndex()){ //black team, index 1
            transform = 'rotate(180deg)';
        }else{ //white team
            transform = 'rotate(0deg) translate(-50%, -50%)';            
        }
        let piece:any;
        for(let i = 0; i < 8; i++){
            for(let j = 0; j < 8; j++){
                piece = document.getElementById("e2e_test_img_" + getPieceKindInId(i, j) + '_' + + i + "x" + j);
                piece.style['transform'] = transform;
                piece.style['-moz-transform'] = transform;
                piece.style['-webkit-transform'] = transform;
                piece.style['-o-transform'] = transform;
                piece.style['-ms-transform'] = transform;
            }
        }
    }
  }

  function maybePlayAIlift(){
      if (!isComputerTurn()) return;
      let audio = new Audio('sounds/piece_lift.mp3');
      audio.play();
  }
    
  function maybeSendComputerMove() {
    if (!isComputerTurn()) return;
    let nextMove:IMove = aiService.createComputerMove(currentUpdateUI.move);
    log.info("Computer move: ", nextMove);
    makeMove(nextMove);
  }
  

  
  
    function handleDragEvent(type:string, clientX:number, clientY:number) {
        if(isComputerTurn()){
            return;
        }
        // Center point in gameArea
        let x:number = clientX - gameArea.offsetLeft;
        let y:number = clientY - gameArea.offsetTop;
        if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= gameArea.clientHeight) {
            if (!draggingPiece) {
                return; //to prevent to click outside of gameArea
            }
        } else {
            // Inside gameArea. Let's find the containing square's row and col
            let row:number = Math.floor(8 * y / gameArea.clientHeight);
            let col:number = Math.floor(8 * x / gameArea.clientWidth);
            if(rotated){
                row = 7 - row;
                col = 7 - col;
            }
            if (type === "touchstart" && !draggingStartedRowCol) {
                // drag started
                let PieceEmpty = (state.board[row][col] === '');
                let PieceTeam = state.board[row][col].charAt(0);
                if (!PieceEmpty && PieceTeam === getTurn(yourPlayerIndex())) {
                    //valid drag
                    let audio = new Audio('sounds/piece_lift.mp3');
                    audio.play();
                    draggingStartedRowCol = {row: row, col: col};
                    draggingPiece = document.getElementById(
                                            "e2e_test_img_" +
                                            getPieceKindInId(row, col) + 
                                            '_' +
                                            draggingStartedRowCol.row + 
                                            "x" + 
                                            draggingStartedRowCol.col);
                    if (draggingPiece) {
                        draggingPiece.style['z-index'] = 1;
                        draggingPiece.style.width = '60%';
                    }

                    draggingPieceAvailableMoves = getDraggingPieceAvailableMoves(row, col);
                    for (let i = 0; i < draggingPieceAvailableMoves.length; i++) {
                        draggingPieceAvailableMoves[i].style['stroke-width'] = '10';
                        draggingPieceAvailableMoves[i].style.stroke = 'rgba(255, 128, 0, 1)';
                        draggingPieceAvailableMoves[i].setAttribute("rx", "5");
                        draggingPieceAvailableMoves[i].setAttribute("ry", "5");
                    }
                }
            }
            if (!draggingPiece) {
                return;
            }
            if (type === "touchend") {
                dragDoneHandler(draggingStartedRowCol, {row: row, col: col});
            } else { // Drag continue
                let width = gameArea.clientWidth/8;
                let height = gameArea.clientHeight/8;
                let ToCenter = {x: col*width + width/2, 
                                y: row*height + height/2};
                let FromCenter = {x: draggingStartedRowCol.col*width + width/2, 
                                  y: draggingStartedRowCol.row*height + height/2};
                draggingPiece.style.left = (ToCenter.x - FromCenter.x+gameArea.clientWidth/16) + "px";
                draggingPiece.style.top = (ToCenter.y - FromCenter.y+gameArea.clientWidth/16) + "px";                
            }
        }
        if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
            // drag ended
            // return the piece to its original style (then angular will take care to hide it).
            draggingPiece.style.width = '40%';
            draggingPiece.style.top = '50%';
            draggingPiece.style.left = '50%';
            for (let i = 0; i < draggingPieceAvailableMoves.length; i++) {
                draggingPieceAvailableMoves[i].style['stroke-width'] = '';
                draggingPieceAvailableMoves[i].style['stroke'] = '';
                draggingPieceAvailableMoves[i].setAttribute("rx", "");
                draggingPieceAvailableMoves[i].setAttribute("ry", "");
            }
            draggingStartedRowCol = null;
            draggingPiece = null;
            draggingPieceAvailableMoves = null;
        }
    }
    
    function getDraggingPieceAvailableMoves(row:number, col:number) {
        let select_Position:Pos = {row:row, col:col};
        let possibleMoves = gameLogic.getPossibleMoves(state.board,
                                                       yourPlayerIndex(),
                                                       state.delta.isUnderCheck,
                                                       state.delta.canCastleKing,
                                                       state.delta.canCastleQueen,
                                                       state.delta.enpassantPosition);
        let draggingPieceAvailableMoves:any = [];
        let index:number = cellInPossibleMoves(select_Position, possibleMoves);
        if (index !== -1) {
            for (let i = 0; i < possibleMoves[index][1].length; i++) {
                let availablePos:Pos = possibleMoves[index][1][i];
                draggingPieceAvailableMoves.push(document.getElementById(
                                                "MyBackground" +
                                                availablePos.row + 
                                                "x" + 
                                                availablePos.col));
            }
        }
        return draggingPieceAvailableMoves;
    }

    function dragDoneHandler(deltaFrom:Pos, deltaTo:Pos) {
        if (window.location.search === '?throwException') {
          throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!isMyTurn()){
            return;
        }
        state.delta.deltaFrom = deltaFrom;
        state.delta.deltaTo = deltaTo;
        let nextMove: IMove = null;
        try {
            nextMove = gameLogic.createMove(state, yourPlayerIndex());
        } catch (e) {
          log.info("Error occured when creating new move");
          return;
        }
        makeMove(nextMove);
    }
  
  function makeMove(move: IMove) {
    if (didMakeMove) { // Only one move per updateUI
      return;
    }
    didMakeMove = true;
    let audio = new Audio('sounds/piece_drop.wav');
    audio.play();
    if(gameOver(move.endMatchScores)){
        return;
    }
    moveService.makeMove(move);
  }
  
  function gameOver(endMatchScores:number[]):boolean{ //XXX ERROR here
    let message:string = "Game over ! ";
    if(angular.equals(endMatchScores, [0,0])){
        message += "Game ended in a Tie";
    }else if(angular.equals(endMatchScores, [1,0])){
        message += "White team has won";
    }else if(angular.equals(endMatchScores, [0,1])){
        message += "Black team has won";
    }
    if(endMatchScores){
        alert(message);
        return true;
    }
    return false;
  }
  
    export let shouldShowImage = function(row:number, col:number) {
        return state.board[row][col] !== "";
    };

    export let getImageSrc = function(row:number, col:number) {
        switch(state.board[row][col]) {
            case 'WK': return 'chess_graphics/chess_pieces/W_King.png';
            case 'WQ': return 'chess_graphics/chess_pieces/W_Queen.png';
            case 'WR': return 'chess_graphics/chess_pieces/W_Rook.png';
            case 'WB': return 'chess_graphics/chess_pieces/W_Bishop.png';
            case 'WN': return 'chess_graphics/chess_pieces/W_Knight.png';
            case 'WP': return 'chess_graphics/chess_pieces/W_Pawn.png';
            case 'BK': return 'chess_graphics/chess_pieces/B_King.png';
            case 'BQ': return 'chess_graphics/chess_pieces/B_Queen.png';
            case 'BR': return 'chess_graphics/chess_pieces/B_Rook.png';
            case 'BB': return 'chess_graphics/chess_pieces/B_Bishop.png';
            case 'BN': return 'chess_graphics/chess_pieces/B_Knight.png';
            case 'BP': return 'chess_graphics/chess_pieces/B_Pawn.png';
            default: return '';
        }
    };
  
    export let getPieceKindInId = function(row:number, col:number):string {
        if (state.board) {
            return state.board[row][col];
        }
    };
    
    export let getBackgroundFill = function(row:number, col:number):string {
        if (isLight(row, col)){
            return 'rgb(133, 87, 35)';
        }
        return 'rgb(185, 156, 107)';
    };
    
    function isLight(row:number, col:number) {
        let rowIsEven = row % 2 === 0;
        let colIsEven = col % 2 === 0;
        return !(rowIsEven && colIsEven || !rowIsEven && !colIsEven);
    }

  function isFirstMove() {
    return !currentUpdateUI.move.stateAfterMove;
  }

  function yourPlayerIndex() {
    return currentUpdateUI.yourPlayerIndex;
  }

  function isComputer() {
    let playerInfo = currentUpdateUI.playersInfo[currentUpdateUI.yourPlayerIndex];
    // In community games, playersInfo is [].
    return playerInfo && playerInfo.playerId === '';
  }

  function isComputerTurn() {
    return isMyTurn() && isComputer();
  }

  function isHumanTurn() {
    return isMyTurn() && !isComputer();
  }

  function isMyTurn() {
    return !didMakeMove && // you can only make one move per updateUI.
      currentUpdateUI.move.turnIndexAfterMove >= 0 && // game is ongoing
      currentUpdateUI.yourPlayerIndex === currentUpdateUI.move.turnIndexAfterMove; // it's my turn
  }

    export let canSelect = function(row:number, col:number) {
        if(!state.board){
            return false;
        }else if(isComputerTurn()){
            return false;
        }else if (isMyTurn()) {
            if (state.board[row][col].charAt(0) === getTurn(yourPlayerIndex())) {
                let select_Position:Pos = {row: row, col: col};
                let possibleMoves = gameLogic.getPossibleMoves(state.board,
                                                               yourPlayerIndex(),
                                                               state.delta.isUnderCheck,
                                                               state.delta.canCastleKing,
                                                               state.delta.canCastleQueen,
                                                               state.delta.enpassantPosition);
                return cellInPossibleMoves(select_Position, possibleMoves) !== -1;
            }
            return false;
        }
    };
  
    function getTurn(turnIndex:number) {
        if (turnIndex === 0){
            return 'W';
        }
        return 'B';
    }

    function cellInPossibleMoves(select_Position:Pos, possibleMoves:any):number {
        for (let i = 0; i < possibleMoves.length; i++) {
            if (angular.equals(select_Position, possibleMoves[i][0])){
                return i;
            }
        }
        return -1;
    }
    function isPiece(row: number, col: number, turnIndex: number, pieceKind: string): boolean {
        return state.board[row][col].charAt(0) === pieceKind;
    }
  
  export function isBlackPiece(row: number, col: number): boolean {
    return isPiece(row, col, 1, 'B');
  }
}

angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
  .run(function () {
    $rootScope['game'] = game;
    game.init();
  });
