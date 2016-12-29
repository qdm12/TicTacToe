# **Chess** 2016, NYU

## I - What has been done
- Chess game with all classic rules and advanced rules (even enPassant, castling, etc.)
- AI which selects an attack move or a random move, favorising low importance pieces such as the pawn.
- Rotation (only when there is a player vs player)
- Three different modes supported:
  - Normal mode ([Player vs Player](https://qdm12.github.io/Chess_2016/))
  
  ![Chess pvp](https://www.dropbox.com/s/14k8rsisrs03ak5/chess_normal.gif?dl=1)
  
  - Player vs AI ([?playAgainstComputer](https://qdm12.github.io/Chess_2016/?playAgainstTheComputer))
  
  ![Chess pvAI](https://www.dropbox.com/s/9z8ycj9hgcywfz7/chess_againstAI.gif?dl=1)
  
  - AI vs AI ([?onlyAIs](https://qdm12.github.io/Chess_2016/?onlyAIs))

  ![Chess AIvAI](https://www.dropbox.com/s/obep1zxdgdci5g0/chess_onlyAI.gif?dl=1)

- Karma unit tests for gameLogic (95%), aiService (100%)
  - Screenshot of the 58 unit tests passing ![tests passing](/readme/karma_pass.jpg)
  - Screenshot of the total code coverage ![coverage](/readme/coverage.jpg)
- Online website at [pgbomit.com](https://www.pgbomit.com)
  - Screenshot of the pgbomit.com website ![pgbomit](/readme/pgbomit.com.jpg)
- PhoneGap present at [github.com/tropicdragon/phonegap-tictactoe](https://github.com/tropicdragon/phonegap-tictactoe)
- Dist version

## II - How to run tests
To run tests with Karma:
- Install npm and grunt somehow
- `grunt karma` in the working directory

## III - Future work
- Write end-to-end tests
- Use more plugins for PhoneGap and add the app on Apple store, Play store and so on
- Setup Jenkins with Markdown badge to show the code coverage.
- Finish integrating the chat with Firebase.
- Improve AI with "one move ahead thinking".
- Add translations and text (there is no text for now)
- Show a nice display message when the game is over, instead of just the JS alert.
- Add AI animations instead of instantaneous moves.
- Display a Promotion menu in Javascript when a pawn reaches the other side.
- Fix up checkmoveok eventually to reach 100% code coverage.
- Show pieces removed from the game
- Show a temporary notification when a special move is used (enpassant, castling...)

## Authors
- Quentin McGaw
- Tianmao Jiang / Javons / Jeremy 
- Alexandra Serralta
