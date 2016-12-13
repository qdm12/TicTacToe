module aiService {
	
	export function createComputerMove(board: Board, turnIndex:number, isUnderCheck:[Boolean,Boolean], canCastleKing:[Boolean,Boolean], canCastleQueen:[Boolean,Boolean], 
										enpassantPosition:Pos): IMove {
											
	// set a high priority attack move first
	
		if (gameLogic.canPawnMoveAnywhere) {
			toPos = gameLogic.getPawnPossibleMoves(board:Board, turnIndex:number, startPos:Pos);
			for (auto x: toPos) {
				if (gameLogic.isPositionUnderAttack(board, turnIndex, x)) {
					gameLogic.createMove(board, deltaFrom, deltaTo, playerIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, null);
					return 1;
				}
			}
		}
		
		else if (gameLogic.canQueenMoveAnywhere) {
			toPos = gameLogic.getQueenPossibleMoves(board:Board, turnIndex:number, startPos:Pos);
			for (auto x: toPos) {
				if (gameLogic.isPositionUnderAttack(board, turnIndex, x)) {
					gameLogic.createMove(board, deltaFrom, deltaTo, playerIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, null);
					return 1;
				}
			}
		}
		
		else if (gameLogic.canRookMoveAnywhere) {
			toPos = gameLogic.getRookPossibleMoves(board:Board, turnIndex:number, startPos:Pos);
			for (auto x: toPos) {
				if (gameLogic.isPositionUnderAttack(board, turnIndex, x)) {
					gameLogic.createMove(board, deltaFrom, deltaTo, playerIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, null);
					return 1;
				}
			}
		}
		
		else if (gameLogic.canBishopMoveAnywhere) {
			toPos = gameLogic.getBishopPossibleMoves(board:Board, turnIndex:number, startPos:Pos);
			for (auto x: toPos) {
				if (gameLogic.isPositionUnderAttack(board, turnIndex, x)) {
					gameLogic.createMove(board, deltaFrom, deltaTo, playerIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, null);
					return 1;
				}
			}
		}
		
		else if (gameLogic.canQueenMoveAnywhere) {
			toPos = gameLogic.getQueenPossibleMoves(board:Board, turnIndex:number, startPos:Pos);
			for (auto x: toPos) {
				if (gameLogic.isPositionUnderAttack(board, turnIndex, x)) {
					gameLogic.createMove(board, deltaFrom, deltaTo, playerIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, null);
					return 1;
				}
			}
		}
		
		else if (gameLogic.canKnightMoveAnywhere) {
			toPos = gameLogic.getKnightPossibleMoves(board:Board, turnIndex:number, startPos:Pos);
			for (auto x: toPos) {
				if (gameLogic.isPositionUnderAttack(board, turnIndex, x)) {
					gameLogic.createMove(board, deltaFrom, deltaTo, playerIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, null);
					return 1;
				}
			}
		}
		
		else if (gameLogic.canKingMoveAnywhere) {
			toPos = gameLogic.getKingPossibleMoves(board:Board, turnIndex:number, startPos:Pos);
			for (auto x: toPos) {
				if (gameLogic.isPositionUnderAttack(board, turnIndex, x)) {
					gameLogic.createMove(board, deltaFrom, deltaTo, playerIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, null);
					return 1;
				}
			}
		}
		
		else {
	
	//return a random move for a computer player and update the board
	
	
											
			let random = Math.floor(Math.random()*6) + 1;
			
			switch (random)
			{
			LINE15:
				case'1': {
					if (gameLogic.canQueenMoveAnywhere(board:Board, turnIndex:number, startPos:Pos) == true) {
						gameLogic.getQueenPossibleMoves(board:Board, turnIndex:number, startPos:Pos);
						let rand = toPos[Math.floor(Math.random() * toPos.length)];
						gameLogic.createMove(board, deltaFrom, deltaTo, playerIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, null);
						return 1;
					}
				}
			
				case'2': {
					if (gameLogic.canRookMoveAnywhere(board:Board, turnIndex:number, startPos:Pos) == true) {
						gameLogic.getRookPossibleMoves(board:Board, turnIndex:number, startPos:Pos);
						let rand = toPos[Math.floor(Math.random() * toPos.length)];
						gameLogic.createMove(board, deltaFrom, deltaTo, playerIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, null);
						return 1;
					}
				}
			
				case'3': {
					if (gameLogic.canBishopMoveAnywhere(board:Board, turnIndex:number, startPos:Pos) == true) {
						gameLogic.getBishopPossibleMoves(board:Board, turnIndex:number, startPos:Pos);
						let rand = toPos[Math.floor(Math.random() * toPos.length)];
						gameLogic.createMove(board, deltaFrom, deltaTo, playerIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, null);
						return 1;
					}
				}
			
			
				case'4': {
					if (gameLogic.canKnightMoveAnywhere(board:Board, turnIndex:number, startPos:Pos) == true) {
						gameLogic.getKnightPossibleMoves(board:Board, turnIndex:number, startPos:Pos);
						let rand = toPos[Math.floor(Math.random() * toPos.length)];
						gameLogic.createMove(board, deltaFrom, deltaTo, playerIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, null);
						return 1;
					}
				}
			
				case'5': {
					if (gameLogic.canPawnMoveAnywhere(board:Board, turnIndex:number, startPos:Pos) == true) {
						gameLogic.getPawnPossibleMoves(board:Board, turnIndex:number, startPos:Pos);
						let rand = toPos[Math.floor(Math.random() * toPos.length)];
						gameLogic.createMove(board, deltaFrom, deltaTo, playerIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, null);
						return 1;
					}
				}
			
				case'6': {
					if (gameLogic.canKingMoveAnywhere(board:Board, turnIndex:number, startPos:Pos) == true) {
						gameLogic.getKingPossibleMoves(board:Board, turnIndex:number, startPos:Pos);
						let rand = toPos[Math.floor(Math.random() * toPos.length)];
						gameLogic.createMove(board, deltaFrom, deltaTo, playerIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, null);
						return 1;
					}
				}
				
				default: {
					goto LINE15;
					break;
				}
			}
		}
	}
}