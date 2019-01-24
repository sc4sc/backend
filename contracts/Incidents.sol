pragma solidity ^0.4.24;

contract Incidents {

    struct Comment {
        uint totalLike;
        bool badge;
        string content; 
        string reply;
    }

	string incident;
    uint commentNum = 1;
    uint progressNum = 1;
    mapping (uint => Comment) comments;
    mapping (uint => string) progresses;

	constructor(string _incident) public {
		incident = _incident;
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

    function addReply(uint commentId, string content) public returns (string) {
        comments[commentId].reply = content;
        return comments[commentId].reply;
    }

    function badge(uint commentId) public returns (bool) {
        comments[commentId].badge = true;
        return comments[commentId].badge;
    }

	function like(uint commentId) public returns (uint) {
        comments[commentId].totalLike += 1;
		return comments[commentId].totalLike;
	}

	function unlike(uint commentId) public returns (uint) {
        comments[commentId].totalLike -= 1;
		return comments[commentId].totalLike;
	}
}
