import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function deploy(hardhat: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hardhat;

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("ERC20Manager", {
    contract: "ERC20Manager",
    from: deployer,
    args: [],
    skipIfAlreadyDeployed: false,
    log: true,
  });

  // await deploy("ERC20FromAllowanceEnforcer", {
  //   contract: "ERC20FromAllowanceEnforcer",
  //   from: deployer,
  //   args: [],
  //   skipIfAlreadyDeployed: false,
  //   log: true,
  // });

  // await deploy("TimestampBeforeEnforcer", {
  //   contract: "TimestampBeforeEnforcer",
  //   from: deployer,
  //   args: [],
  //   skipIfAlreadyDeployed: false,
  //   log: true,
  // });

  // await deploy("TimestampAfterEnforcer", {
  //   contract: "TimestampAfterEnforcer",
  //   from: deployer,
  //   args: [],
  //   skipIfAlreadyDeployed: false,
  //   log: true,
  // });

  // await deploy("AllowedAddressEnforcer", {
  //   contract: "AllowedAddressEnforcer",
  //   from: deployer,
  //   args: [],
  //   skipIfAlreadyDeployed: false,
  //   log: true,
  // });

  /*
  for dev testing

  await deploy("TokenPermit", {
    contract: "TokenPermit",
    from: deployer,
    args: [],
    skipIfAlreadyDeployed: false,
    log: true,
  });

      */

}
