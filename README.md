# **Chess** 2016, NYU

## I - What is implemented
- Chess game with all rules (even enPassant, castling, etc.)
- AI which selects an attack move or a random move, favorising low importance pieces such as the pawn.
- Rotation (only when there is a player vs player)
- Normal mode, "?playAgainstComputer", "?onlyAIs" mode
- Karma unit tests for gameLogic (95%), aiService (100%)
- Uncomplete support for Community games.


## II - How to run tests
To run tests with Karma:
- Install npm
- `npm install` in the working directory
- `grunt karma` in the working directory

## III - Future work
- Write end-to-end tests
- Produce dist with Grunt
- Finish up GoDaddy server setup, the Facebook App and PhoneGap.
- Setup Jenkins with Markdown badge to show to code coverage.
- Finish integrating the chat with CommunityFire (especially HTML requirements).
- Improve AI with "one move ahead thinking"
- Add translations and text (there is no text for now)
- Show a nice display message when the game is over, instead of just alert.
- Add AI animations.
- Display a Promotion menu in Javascript when a pawn reaches the other side.
- Fix up checkmoveok eventually to reach 100% code coverage.
- Show pieces removed from the game
- Show a temporary notification when a special move is used (enpassant, castling...)
