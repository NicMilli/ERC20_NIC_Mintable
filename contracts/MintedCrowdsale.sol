pragma solidity 0.8.10;

import "./CrowdSale1.sol";
import "./ERC20Mintable.sol";

/**
 * @title MintedCrowdsale
 * @dev Extension of Crowdsale contract whose tokens are minted in each purchase.
 * Token ownership should be transferred to MintedCrowdsale for minting.
 */
abstract contract MintedCrowdsale is CrowdSale1 {
   
    function _deliverTokens(address beneficiary, uint256 tokenAmount) internal virtual  override {
        // Potentially dangerous assumption about the type of the token.
        //super._deliverTokens(beneficiary, tokenAmount);
        require(
            ERC20Mintable(address(token())).mint(beneficiary, tokenAmount),
                "MintedCrowdsale: minting failed"
        );
    }
}