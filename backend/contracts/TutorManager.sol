// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TutorSession.sol";

contract TutorManager {
    struct Review {
        address reviewer;
        uint8 rating;
        string comment;
    }

    struct TutorProfile {
        bool registered;
        uint256 sessionPrice;
        Review[] reviews;
        mapping(address => bool) hasReviewed;
    }

    mapping(address => TutorProfile) public tutors;
    TutorSession[] public sessions;

    // Tutor registers and sets price
    function registerTutor(uint256 price) external {
        tutors[msg.sender].registered = true;
        tutors[msg.sender].sessionPrice = price;
    }

    // Student creates a session with a tutor
    function createSession(address tutorAddr) external returns (address) {
        require(tutors[tutorAddr].registered, "Tutor not found");

        TutorSession session = new TutorSession(
            tutorAddr,
            msg.sender,
            tutors[tutorAddr].sessionPrice
        );

        sessions.push(session);
        return address(session);
    }

    // Student leaves 1 review max per tutor
    function leaveReview(
        address tutorAddr,
        uint8 rating,
        string calldata comment
    ) external {
        TutorProfile storage t = tutors[tutorAddr];
        require(t.registered, "Tutor not found");
        require(!t.hasReviewed[msg.sender], "Already reviewed");
        require(rating >= 1 && rating <= 5, "Rating");

        t.reviews.push(Review(msg.sender, rating, comment));
        t.hasReviewed[msg.sender] = true;
    }

    // Fetch all reviews
    function getReviews(address tutorAddr)
        external
        view
        returns (Review[] memory)
    {
        return tutors[tutorAddr].reviews;
    }
}
