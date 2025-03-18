// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LandRegistry {
    address public government; // Original deployer
    mapping(address => bool) public governmentUsers; // Multiple government users

    struct Land {
        uint id;
        string surveyNumber;
        string details;
        address owner;
        uint value; // In wei
        bool isRegistered;
        bool isListed;
    }

    mapping(uint => Land) public lands;
    uint public landCount;

    // Pending registrations and transfers
    mapping(uint => bool) public pendingRegistrations;
    mapping(uint => address) public pendingTransfers;

    event LandRegistrationRequested(uint id, string surveyNumber, address owner);
    event LandRegistered(uint id, string surveyNumber, address owner);
    event LandListed(uint id, uint value);
    event TransferRequested(uint id, address from, address to);
    event TransferApproved(uint id, address from, address to, uint stampDuty);

    constructor() {
        government = msg.sender; // Deployer is the initial government
        governmentUsers[msg.sender] = true; // Add deployer to government users
    }

    modifier onlyGovernment() {
        require(governmentUsers[msg.sender], "Only government can call this");
        _;
    }

    // Add a new government user
    function addGovernment(address _gov) public onlyGovernment {
        governmentUsers[_gov] = true;
    }

    // Register new land (civilian request)
    function requestLandRegistration(string memory _surveyNumber, string memory _details) public {
        landCount++;
        lands[landCount] = Land(landCount, _surveyNumber, _details, msg.sender, 0, false, false);
        pendingRegistrations[landCount] = true;
        emit LandRegistrationRequested(landCount, _surveyNumber, msg.sender);
    }

    // Government approves registration
    function approveLandRegistration(uint _id) public onlyGovernment {
        require(pendingRegistrations[_id], "Not pending approval");
        lands[_id].isRegistered = true;
        delete pendingRegistrations[_id];
        emit LandRegistered(_id, lands[_id].surveyNumber, lands[_id].owner);
    }

    // List land for sale
    function listLand(uint _id, uint _value) public {
        require(lands[_id].isRegistered, "Land not registered");
        require(lands[_id].owner == msg.sender, "Only owner can list");
        lands[_id].isListed = true;
        lands[_id].value = _value;
        emit LandListed(_id, _value);
    }

    // Request land transfer (buy)
    function requestTransfer(uint _id, address _newOwner) public {
        require(lands[_id].isRegistered, "Land not registered");
        require(lands[_id].isListed, "Land not listed");
        pendingTransfers[_id] = _newOwner;
        emit TransferRequested(_id, lands[_id].owner, _newOwner);
    }

    // Government approves transfer with stamp duty
    function approveTransfer(uint _id, uint _stampDuty) public onlyGovernment payable {
        require(pendingTransfers[_id] != address(0), "No transfer pending");
        require(msg.value >= _stampDuty, "Insufficient stamp duty");

        address oldOwner = lands[_id].owner;
        address newOwner = pendingTransfers[_id];
        lands[_id].owner = newOwner;
        lands[_id].isListed = false;
        delete pendingTransfers[_id];

        payable(government).transfer(_stampDuty); // Send stamp duty to government
        payable(oldOwner).transfer(msg.value - _stampDuty); // Remaining to seller

        emit TransferApproved(_id, oldOwner, newOwner, _stampDuty);
    }

    // Get land details
    function getLand(uint _id) public view returns (uint, string memory, string memory, address, uint, bool) {
        Land memory land = lands[_id];
        return (land.id, land.surveyNumber, land.details, land.owner, land.value, land.isListed);
    }
}