pragma solidity 0.8.10;

import "./ERC20Mintable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract NicToken is ERC20Mintable {
    constructor() ERC20("Nic'S ERC20 Token", "NIC") {
    }
}