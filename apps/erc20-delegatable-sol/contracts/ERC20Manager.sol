//SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import { Delegatable } from "./Delegatable.sol";
import { DelegatableCore } from "./DelegatableCore.sol";
import "@delegatable/delegatable-sol/contracts/TypesAndDecoders.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ERC20Manager
 * @author McOso
 * @notice Manages the erc20 delegation
 */
contract ERC20Manager is Delegatable, Ownable {
  /* ===================================================================================== */
  /* Constructor & Modifiers                                                               */
  /* ===================================================================================== */

  mapping(bytes32 => bool) revokedMap;

  constructor() Delegatable("ERC20Manager", "1") {}

  /* ===================================================================================== */
  /* External Functions                                                                    */
  /* ===================================================================================== */

  // ========================
  // READS
  // ========================
  function verifyExternalDelegationSignature(SignedDelegation memory _signedDelegation, bytes32 _domainHash) public view virtual returns (address signer) {
      Delegation memory delegation_ = _signedDelegation.delegation;
      bytes32 sigHash_ = getExternalDelegationTypedDataHash(delegation_, _domainHash);
      return recover(sigHash_, _signedDelegation.signature);
  }

  function getExternalDelegationTypedDataHash(Delegation memory _delegation, bytes32 _domainHash) public pure returns (bytes32 sigHash) {
      return keccak256(
          abi.encodePacked(
              "\x19\x01",
              _domainHash,
              GET_DELEGATION_PACKETHASH(_delegation)
          )
      );
  }

  function isRevoked(SignedDelegation memory _signedDelegation) public view returns (bool revoked) {
    bytes32 delegationHash_ = GET_SIGNEDDELEGATION_PACKETHASH(_signedDelegation);
    return revokedMap[delegationHash_];
  }

  // ========================
  // WRITES
  // ========================
  function approveTransferProxy(
    address _token,
    address _from,
    uint256 _amount,
    uint256 _deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external {
    require(msg.sender == address(this), "ERC20Manager:invalid-sender");
    IERC20Permit(_token).permit(_from, address(this), _amount, _deadline, v, r, s);
  }

  function transferProxy(
    address _token,
    address _to,
    uint256 _amount
  ) external returns (bool) {
    require(msg.sender == address(this), "ERC20Manager:transferProxy-not-authorized");
    return IERC20(_token).transferFrom(_msgSender(), _to, _amount);
  }

  function revoke(SignedDelegation calldata _signedDelegation) external {
    address signer_ = verifyExternalDelegationSignature(_signedDelegation, domainHash);
    require(msg.sender == signer_, "ERC20Manager:unauthorized-revoke");

    bytes32 delegationHash_ = GET_SIGNEDDELEGATION_PACKETHASH(_signedDelegation);
    revokedMap[delegationHash_] = true;
  }

  function invoke(SignedInvocation[] calldata signedInvocations)
    external
    override
    returns (bool success)
  {
      for (uint256 i = 0; i < signedInvocations.length; i++) {
          SignedInvocation calldata signedInvocation = signedInvocations[i];

          for (uint256 j = 0; j < signedInvocation.invocations.batch.length; j++){
            Invocation memory invocation = signedInvocation.invocations.batch[j];
            for (uint256 k = 0; k < invocation.authority.length; k++){
              require(!isRevoked(invocation.authority[k]), "ERC20Manager:revoked-delegation");
            }
          }
          
          address invocationSigner = verifyInvocationSignature(
              signedInvocation
          );
          _enforceReplayProtection(
              invocationSigner,
              signedInvocations[i].invocations.replayProtection
          );
          success = _invoke(
              signedInvocation.invocations.batch,
              invocationSigner
          );
      }
  }

  /* ===================================================================================== */
  /* Internal Functions                                                                    */
  /* ===================================================================================== */
  function _msgSender()
    internal
    view
    virtual
    override(DelegatableCore, Context)
    returns (address sender)
  {
    if (msg.sender == address(this)) {
      bytes memory array = msg.data;
      uint256 index = msg.data.length;
      assembly {
        sender := and(mload(add(array, index)), 0xffffffffffffffffffffffffffffffffffffffff)
      }
    } else {
      sender = msg.sender;
    }
    return sender;
  }
}
