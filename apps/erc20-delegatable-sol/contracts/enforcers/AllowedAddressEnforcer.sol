//SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@delegatable/delegatable-sol/contracts/CaveatEnforcer.sol";
import { BytesLib } from "@delegatable/delegatable-sol/contracts/libraries/BytesLib.sol";

contract AllowedAddressEnforcer is CaveatEnforcer {
  /**
   * @notice Allows the delegator to limit what address the delegate may send to.
   * @param terms - A series of 20byte addresses, representing the addresses that the delegate is allowed to send to.
   * @param transaction - The transaction the delegate might try to perform.
   * @param delegationHash - The hash of the delegation being operated on.
   * @dev Only compatible with ERC20 transferFrom.
   */
  function enforceCaveat(
      bytes calldata terms,
      Transaction calldata transaction,
      bytes32 delegationHash
  ) public view override returns (bool) {
    address targetAddress = BytesLib.toAddress(transaction.data, 48);
    for (uint256 i = 0; i < terms.length; i += 20) {
        address allowedAddress = BytesLib.toAddress(terms[i:i + 20], 0);
        if (allowedAddress == targetAddress) {
            return true;
        }
    }
    revert("AllowedAddressEnforcer:address-not-allowed");
  }
}
