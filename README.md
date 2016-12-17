# **Chess** 2016, NYU

## I - What is implemented
- Chess game with all classic rules and advanced rules (even enPassant, castling, etc.)
- AI which selects an attack move or a random move, favorising low importance pieces such as the pawn.
- Rotation (only when there is a player vs player)
- Normal mode, "?playAgainstComputer" mode and "?onlyAIs" mode
- Karma unit tests for gameLogic (95%), aiService (100%)
  - Screenshot of the 58 unit tests passing ![tests passing](/readme/karma_pass.jpg)
  - Screenshot of the total code coverage ![coverage](/readme/coverage.jpg)


## II - How to run tests
To run tests with Karma:
- Install npm and grunt somehow
- `grunt karma` in the working directory

## III - Future work
- Write end-to-end tests
- Produce dist with Grunt
- Finish up GoDaddy server setup, the Facebook App and PhoneGap.
- Setup Jenkins with Markdown badge to show the code coverage.
- Finish integrating the chat with Firebase.
- Improve AI with "one move ahead thinking".
- Add translations and text (there is no text for now)
- Show a nice display message when the game is over, instead of just the JS alert.
- Add AI animations.
- Display a Promotion menu in Javascript when a pawn reaches the other side.
- Fix up checkmoveok eventually to reach 100% code coverage.
- Show pieces removed from the game
- Show a temporary notification when a special move is used (enpassant, castling...)

## Authors
- Quentin McGaw
- TianMao Jiang / Javons / Jeremy 
- Alexandra Serralta
