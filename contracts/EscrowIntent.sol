// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EscrowIntentManager {
    // Enum to represent the state of an intent
    enum IntentState { Pending, Resolved }

    // Struct to represent an intent
    struct Intent {
        uint256 id;
        address creator;
        string description;
        IntentState state;
        uint256 amount; // Escrowed amount in Ether
    }

    // Mapping of intent ID to intent details
    mapping(uint256 => Intent) public intents;

    // Counter for intent IDs
    uint256 private intentCounter;

    // Events
    event IntentCreated(uint256 indexed id, address indexed creator, string description, uint256 amount);
    event IntentResolved(uint256 indexed id, address indexed resolver, uint256 amount);

    // Modifier to ensure the intent exists
    modifier intentExists(uint256 _id) {
        require(intents[_id].creator != address(0), "Intent does not exist");
        _;
    }

    // Modifier to ensure the intent is still pending
    modifier isPending(uint256 _id) {
        require(intents[_id].state == IntentState.Pending, "Intent is already resolved");
        _;
    }

    // Function to create a new intent with an escrowed amount
    function createIntent(string memory _description) external payable returns (uint256) {
        require(msg.value > 0, "Must escrow some Ether");

        intentCounter++;
        intents[intentCounter] = Intent({
            id: intentCounter,
            creator: msg.sender,
            description: _description,
            state: IntentState.Pending,
            amount: msg.value
        });

        emit IntentCreated(intentCounter, msg.sender, _description, msg.value);

        return intentCounter;
    }

    // Function to resolve an intent and release the escrow to the resolver
    function resolveIntent(uint256 _id) external intentExists(_id) isPending(_id) {
        Intent storage intent = intents[_id];

        uint256 escrowAmount = intent.amount;
        address resolver = msg.sender;

        intent.state = IntentState.Resolved;
        intent.amount = 0; // Clear the escrowed amount

        // Transfer the escrowed Ether to the resolver
        payable(resolver).transfer(escrowAmount);

        emit IntentResolved(_id, resolver, escrowAmount);
    }

    // Function to get the details of an intent
    function getIntent(uint256 _id)
        external
        view
        intentExists(_id)
        returns (uint256, address, string memory, IntentState, uint256)
    {
        Intent memory intent = intents[_id];
        return (intent.id, intent.creator, intent.description, intent.state, intent.amount);
    }
}
