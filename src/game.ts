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
  export let animationEndedTimeout: ng.IPromise<any> = null;
  export let state: IState = null;
  // For community games.
  export let proposals: number[][] = null;
  export let yourPlayerInfo: IPlayerInfo = null;
  
  let gameArea:any;
  let draggingStartedRowCol:any = null; // The {row: YY, col: XX} where dragging started.
  let draggingPiece:any = null;
  let draggingPieceAvailableMoves:any = null;
  let nextZIndex = 1;
  

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
      communityUI: communityUI,
      getStateForOgImage: null,
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

  export function communityUI(communityUI: ICommunityUI) { //HELP
    log.info("Game got communityUI:", communityUI);
    // If only proposals changed, then do NOT call updateUI. Then update proposals.
    let nextUpdateUI: IUpdateUI = {
        playersInfo: [],
        playMode: communityUI.yourPlayerIndex,
        move: communityUI.move,
        numberOfPlayers: communityUI.numberOfPlayers,
        stateBeforeMove: communityUI.stateBeforeMove,
        turnIndexBeforeMove: communityUI.turnIndexBeforeMove,
        yourPlayerIndex: communityUI.yourPlayerIndex,
      };
    if (angular.equals(yourPlayerInfo, communityUI.yourPlayerInfo) &&
        currentUpdateUI && angular.equals(currentUpdateUI, nextUpdateUI)) {
      // We're not calling updateUI to avoid disrupting the player if he's in the middle of a move.
    } else {
      // Things changed, so call updateUI.
      updateUI(nextUpdateUI);
    }
    // This must be after calling updateUI, because we nullify things there (like playerIdToProposal&proposals&etc)
    yourPlayerInfo = communityUI.yourPlayerInfo;
    let playerIdToProposal = communityUI.playerIdToProposal; 
    didMakeMove = !!playerIdToProposal[communityUI.yourPlayerInfo.playerId];
    proposals = [];
    for (let i = 0; i < 8; i++) {
      proposals[i] = [];
      for (let j = 0; j < 8; j++) {
        proposals[i][j] = 0;
      }
    }
    for (let playerId in playerIdToProposal) {
      let proposal = playerIdToProposal[playerId];
      let delta = proposal.data;
      proposals[delta.deltaFrom.row][delta.deltaFrom.col]++; //XXX that might be wrong
    }
  }
  export function isProposal(row: number, col: number) {
    return proposals && proposals[row][col] > 0;
  } 
  export function isProposal1(row: number, col: number) {
    return proposals && proposals[row][col] == 1;
  } 
  export function isProposal2(row: number, col: number) {
    return proposals && proposals[row][col] == 2;
  }
  
  export function updateUI(params: IUpdateUI): void {
    log.info("Game got updateUI:", params);
    didMakeMove = false; // Only one move per updateUI
    currentUpdateUI = params;
    clearAnimationTimeout();
    state = params.move.stateAfterMove;
    if (isFirstMove()) {
      state = gameLogic.getInitialState();
    }
    // We calculate the AI move only after the animation finishes,
    // because if we call aiService now
    // then the animation will be paused until the javascript finishes.
    animationEndedTimeout = $timeout(animationEndedCallback, 1100);
  }

  function animationEndedCallback() {
    log.info("Animation ended");
    maybeSendComputerMove();
  }

  function clearAnimationTimeout() {
    if (animationEndedTimeout) {
      $timeout.cancel(animationEndedTimeout);
      animationEndedTimeout = null;
    }
  }

  function maybeSendComputerMove() {
    if (!isComputerTurn()) return;
    let audio = new Audio('sounds/piece_lift.mp3');
    audio.play();
    let nextMove:IMove = aiService.createComputerMove(currentUpdateUI.move);
    log.info("Computer move: ", nextMove);
    makeMove(nextMove);
  }
  
    //window.e2e_test_stateService = stateService;
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
            let col:number = Math.floor(8 * x / gameArea.clientWidth);
            let row:number = Math.floor(8 * y / gameArea.clientHeight);
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

    function dragDoneHandler(fromPos:Pos, toPos:Pos) {
        if (window.location.search === '?throwException') {
          throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!isMyTurn()){
            return;
        }
        state.delta.deltaFrom = fromPos;
        state.delta.deltaTo = toPos;
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
    if (!proposals) {
      moveService.makeMove(move);
    } else {
      let delta = move.stateAfterMove.delta;
      let myProposal:IProposal = {
        data: delta,
        chatDescription: '' + (delta.deltaTo.row + 1) + 'x' + (delta.deltaTo.col + 1),
        playerInfo: yourPlayerInfo,
      };
      // Decide whether we make a move or not (if we have 2 other proposals supporting the same thing).
      if (proposals[delta.deltaTo.row][delta.deltaTo.col] < 2) { //XXX That might be wrong HELP
        move = null;
      }
      moveService.communityMove(myProposal, move);
    }
  }
  
    export let shouldShowImage = function(row:number, col:number) {
        return state.board[row][col] !== "" || isProposal(row, col); //HELP
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
        return state.board[row][col].charAt(0) === pieceKind ||
                (isProposal(row, col) && currentUpdateUI.move.turnIndexAfterMove == turnIndex);
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
