// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TutorSession {
    address public tutor;
    address public student;
    uint256 public price;

    bool public studentConfirmed;
    bool public tutorConfirmed;
    bool public isPaid;

    constructor(address _tutor, address _student, uint256 _price) {
        tutor = _tutor;
        student = _student;
        price = _price;
    }

    // Student deposits the session payment
    function payForSession() external payable {
        require(msg.sender == student, "Only student can pay");
        require(!isPaid, "Already paid");
        require(msg.value == price, "Incorrect amount");

        isPaid = true;
    }

    // Tutor or student confirm the session is complete
    function confirmSessionComplete() external {
        require(msg.sender == tutor || msg.sender == student, "Not authorized");
        require(isPaid, "Payment not made yet");

        if (msg.sender == tutor) tutorConfirmed = true;
        if (msg.sender == student) studentConfirmed = true;

        // Release funds once BOTH confirm
        if (tutorConfirmed && studentConfirmed) {
            payable(tutor).transfer(price);
        }
    }
}
