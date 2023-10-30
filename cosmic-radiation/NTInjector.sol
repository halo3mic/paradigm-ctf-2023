pragma solidity ^0.8.0;

contract NTInjector {
    constructor(address payable _reciever) payable {
        selfdestruct(_reciever);
    }
}
