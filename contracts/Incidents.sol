pragma solidity ^0.4.24;

contract Incidents {

    struct Comment {
        uint totalLike;
        bool badge;
        string content; 
        string reply;
    }

	string incident;
    string state;
    uint commentNum = 1;
    uint progressNum = 1;
    mapping (uint => Comment) comments;
    mapping (uint => string) progresses;

	constructor(string _incident) public {
		incident = _incident;
        state = "확인중";
 	}

    function addProgress(string content) public returns (uint) {
        progresses[progressNum] = content;
        progressNum += 1;
        return progressNum;
    }

    function addComment(string content) public returns (uint) {
        comments[commentNum] = Comment(0, false, content, '');
        commentNum += 1;
        return commentNum;
    }

    function changeState(string newState) public returns (string) {
        state = newState;
        return state;
    }

    function addReply(uint commentIndex, string content) public returns (string) {
        comments[commentIndex].reply = content;
        return comments[commentIndex].reply;
    }

	function like(uint commentIndex) public returns (uint) {
        comments[commentIndex].totalLike += 1;
		return comments[commentIndex].totalLike;
	}

	function unlike(uint commentIndex) public returns (uint) {
        comments[commentIndex].totalLike -= 1;
		return comments[commentIndex].totalLike;
	}
}
