pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract Incidents {
    using SafeMath for uint;

    struct Comment {
        uint totalLike;
        bool badge;
        string content;
        string reply;
    }

	string incident;
    uint commentNum = 0;
    uint progressNum = 0;
    mapping (uint => Comment) comments;
    mapping (uint => string) progresses;

	constructor(string _incident) public {
		incident = _incident;
 	}

    function addProgress(string content) public returns (uint) {
        uint progressId = progressNum;
        progresses[progressId] = content;
        progressNum.add(1);
        return progressId;
    }

    function addComment(string content) public returns (uint) {
        uint commentId = commentNum;
        comments[commentId] = Comment(0, false, content, '');
        commentNum.add(1);
        return commentId;
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
        comments[commentId].totalLike.add(1);
		return comments[commentId].totalLike;
	}

	function unlike(uint commentId) public returns (uint) {
        comments[commentId].totalLike = comments[commentId].totalLike-1;
		return comments[commentId].totalLike;
	}
}
