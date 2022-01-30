const hre = require("hardhat");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const { expect } = chai;

const moveTimeForward = async seconds => {
  await network.provider.send("evm_increaseTime", [seconds]);
  await network.provider.send("evm_mine");
};

const toWantUnit = (num, precision) => {
  if (precision) {
    return ethers.BigNumber.from(num * 10 ** precision);
  }
  return ethers.utils.parseEther(num);
};

describe("Vaults", function () {
  let Vault;
  let Strategy;
  let Treasury;
  let Want;
  let vault;
  let strategy;
  const paymentSplitterAddress = "0x63cbd4134c2253041F370472c130e92daE4Ff174";
  let treasury;
  let want;
  // const ustAddress = "0xe2D27f06F63d98b8e11b38b5b08A75D0c8dD62B9";
  // const iustAddress = "0xf13252C1044Aa83b910C77322e67387E187F64cA";
  // const wethAddress = "0x74b23882a30290451a17c44f4f05243b6b58c76d";
  // const iwethAddress = "0xcc3e89fbc10e155f1164f8c9cf0703acde53f6fd";
  const wftmAddress = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";
  const iwftmAddress = "0xd528697008ac67a21818751a5e3c58c8dae54696";
  const wantAddress = wftmAddress;
  const iWantAddress = iwftmAddress;
  let self;
  let wantWhale;
  let selfAddress;
  let strategist;
  let owner;

  beforeEach(async function () {
    //reset network
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: "https://rpc.ftm.tools/",
            blockNumber: 29491600,
          },
        },
      ],
    });
    console.log("providers");
    //get signers
    [owner, addr1, addr2, addr3, addr4, ...addrs] = await ethers.getSigners();
    // const wantHolder = "0x83612e0b5ec960d02553e7f084f7c6ac957f90e2"; // ust
    // const wantWhaleAddress = "0xc3d8beb4662dcfcabe95859cd5be08e9a29af83e"; // ust
    // const wantHolder = "0x93c08a3168fc469f3fc165cd3a471d19a37ca19e"; // weth
    // const wantWhaleAddress = "0xca436e14855323927d6e6264470ded36455fc8bd"; // weth
    const wantHolder = "0x97988fc6443fcfaaa001ee320d5ebfcbf510a521"; // wftm
    const wantWhaleAddress = "0x90e2101966a495bb20f61143c469e1ae5e822ca8"; // wftm
    const strategistAddress = "0x3b410908e71Ee04e7dE2a87f8F9003AFe6c1c7cE";
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [wantHolder],
    });
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [wantWhaleAddress],
    });
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [strategistAddress],
    });
    self = await ethers.provider.getSigner(wantHolder);
    wantWhale = await ethers.provider.getSigner(wantWhaleAddress);
    strategist = await ethers.provider.getSigner(strategistAddress);
    selfAddress = await self.getAddress();
    ownerAddress = await owner.getAddress();
    console.log("addresses");

    //get artifacts
    Strategy = await ethers.getContractFactory("ReaperAutoCompoundIronBankLeverage");
    Vault = await ethers.getContractFactory("ReaperVaultv1_3");
    Treasury = await ethers.getContractFactory("ReaperTreasury");
    Want = await ethers.getContractFactory("@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20");
    console.log("artifacts");

    //deploy contracts
    treasury = await Treasury.deploy();
    console.log("treasury");
    want = await Want.attach(wantAddress);
    console.log("want attached");
    vault = await Vault.deploy(
      wantAddress,
      "Iron Bank Single Stake Vault",
      "rfIronBank",
      432000,
      0,
      ethers.utils.parseEther("999999"),
    );
    console.log("vault");

    console.log(`vault.address: ${vault.address}`);
    console.log(`treasury.address: ${treasury.address}`);

    strategy = await Strategy.deploy(
      vault.address,
      [treasury.address, paymentSplitterAddress],
      [strategistAddress],
      iWantAddress,
    );
    console.log("strategy");

    await vault.initialize(strategy.address);

    console.log(`Strategy deployed to ${strategy.address}`);
    console.log(`Vault deployed to ${vault.address}`);
    console.log(`Treasury deployed to ${treasury.address}`);

    //approving LP token and vault share spend
    await want.approve(vault.address, ethers.utils.parseEther("1000000000"));
    console.log("approvals1");
    await want.connect(self).approve(vault.address, ethers.utils.parseEther("1000000000"));
    console.log("approvals2");
    console.log("approvals3");
    await want.connect(wantWhale).approve(vault.address, ethers.utils.parseEther("1000000000"));
    console.log("approvals4");
    await vault.connect(wantWhale).approve(vault.address, ethers.utils.parseEther("1000000000"));
  });

  describe("Deploying the vault and strategy", function () {
    xit("should initiate vault with a 0 balance", async function () {
      console.log(1);
      const totalBalance = await vault.balance();
      console.log(2);
      const availableBalance = await vault.available();
      console.log(3);
      const pricePerFullShare = await vault.getPricePerFullShare();
      console.log(4);
      expect(totalBalance).to.equal(0);
      console.log(5);
      expect(availableBalance).to.equal(0);
      console.log(6);
      expect(pricePerFullShare).to.equal(ethers.utils.parseEther("1"));
    });
  });
  describe("Vault Tests", function () {
    xit("should allow deposits and account for them correctly", async function () {
      const userBalance = await want.balanceOf(selfAddress);
      console.log(`userBalance: ${userBalance}`);
      const vaultBalance = await vault.balance();
      console.log("vaultBalance");
      console.log(vaultBalance);
      const depositAmount = toWantUnit("0.1");
      console.log("depositAmount");
      console.log(depositAmount);
      await vault.connect(self).deposit(depositAmount);
      const newVaultBalance = await vault.balance();
      console.log(`newVaultBalance: ${newVaultBalance}`);
      console.log(`depositAmount: ${depositAmount}`);
      const newUserBalance = await want.balanceOf(selfAddress);

      console.log(`newUserBalance: ${newUserBalance}`);
      console.log(`userBalance - depositAmount: ${userBalance - depositAmount}`);
      console.log(`userBalance - newUserBalance: ${userBalance - newUserBalance}`);
      const deductedAmount = userBalance.sub(newUserBalance);
      console.log("deductedAmount");
      console.log(deductedAmount);
      await vault.connect(self).deposit(depositAmount);
      expect(vaultBalance).to.equal(0);
      // // Compound mint reduces balance by a small amount
      const smallDifference = depositAmount * 0.00000001; // For 1e18
      // const smallDifference = depositAmount * 0.000001; // For USDC or want with smaller decimals allow bigger difference
      const isSmallBalanceDifference = depositAmount.sub(newVaultBalance) < smallDifference;
      expect(isSmallBalanceDifference).to.equal(true);

      const ltv = await strategy.calculateLTV();
      console.log(`ltv: ${ltv}`);
      const allowedLTVDrift = toWantUnit("0.01");
      expect(ltv).to.be.closeTo(toWantUnit("0.73"), allowedLTVDrift);
    });
    xit("should trigger deleveraging on deposit when LTV is too high", async function () {
      const depositAmount = toWantUnit("100");
      await vault.connect(self).deposit(depositAmount);
      const ltvBefore = await strategy.calculateLTV();
      console.log(`ltvBefore: ${ltvBefore}`);
      const allowedLTVDrift = toWantUnit("0.01");
      expect(ltvBefore).to.be.closeTo(toWantUnit("0.73"), allowedLTVDrift);
      const newLTV = toWantUnit("0.6");
      await strategy.setTargetLtv(newLTV);
      const smallDepositAmount = toWantUnit("1");
      await vault.connect(self).deposit(smallDepositAmount);
      const ltvAfter = await strategy.calculateLTV();
      console.log(`ltvAfter: ${ltvAfter}`);
      expect(ltvAfter).to.be.closeTo(newLTV, allowedLTVDrift);
    });
    xit("should not change leverage when LTV is within the allowed drift on deposit", async function () {
      const depositAmount = toWantUnit("1");
      const ltv = toWantUnit("0.73");
      await vault.connect(self).deposit(depositAmount);
      const ltvBefore = await strategy.calculateLTV();
      console.log(`ltvBefore: ${ltvBefore}`);
      const allowedLTVDrift = toWantUnit("0.01");
      expect(ltvBefore).to.be.closeTo(ltv, allowedLTVDrift);
      const smallDepositAmount = toWantUnit("0.005");
      await vault.connect(self).deposit(smallDepositAmount);
      const ltvAfter = await strategy.calculateLTV();
      console.log(`ltvAfter: ${ltvAfter}`);
      expect(ltvAfter).to.be.closeTo(ltv, allowedLTVDrift);
    });
    xit("should mint user their pool share", async function () {
      console.log("---------------------------------------------");
      const userBalance = await want.balanceOf(selfAddress);
      console.log(userBalance.toString());
      const selfDepositAmount = toWantUnit("0.005");
      await vault.connect(self).deposit(selfDepositAmount);
      console.log((await vault.balance()).toString());

      const whaleDepositAmount = toWantUnit("100");
      await vault.connect(wantWhale).deposit(whaleDepositAmount);
      const selfWantBalance = await vault.balanceOf(selfAddress);
      console.log(selfWantBalance.toString());
      const ownerDepositAmount = toWantUnit("1");
      await want.connect(self).transfer(ownerAddress, ownerDepositAmount);
      const ownerBalance = await want.balanceOf(ownerAddress);

      console.log(ownerBalance.toString());
      await vault.deposit(ownerDepositAmount);
      console.log((await vault.balance()).toString());
      const ownerVaultWantBalance = await vault.balanceOf(ownerAddress);
      console.log(`ownerVaultWantBalance.toString(): ${ownerVaultWantBalance.toString()}`);
      await vault.withdrawAll();
      const ownerWantBalance = await want.balanceOf(ownerAddress);
      console.log(`ownerWantBalance: ${ownerWantBalance}`);
      const ownerVaultWantBalanceAfterWithdraw = await vault.balanceOf(ownerAddress);
      console.log(`ownerVaultWantBalanceAfterWithdraw: ${ownerVaultWantBalanceAfterWithdraw}`);
      const allowedImprecision = toWantUnit("0.01");
      expect(ownerWantBalance).to.be.closeTo(ownerDepositAmount, allowedImprecision);
      expect(selfWantBalance).to.equal(selfDepositAmount);
    });
    xit("should allow withdrawals", async function () {
      const userBalance = await want.balanceOf(selfAddress);
      console.log(`userBalance: ${userBalance}`);
      const depositAmount = toWantUnit("1");
      await vault.connect(self).deposit(depositAmount);
      console.log(`await want.balanceOf(selfAddress): ${await want.balanceOf(selfAddress)}`);

      await vault.connect(self).withdrawAll();
      const newUserVaultBalance = await vault.balanceOf(selfAddress);
      console.log(`newUserVaultBalance: ${newUserVaultBalance}`);
      const userBalanceAfterWithdraw = await want.balanceOf(selfAddress);
      const securityFee = 10;
      const percentDivisor = 10000;
      const withdrawFee = (depositAmount * securityFee) / percentDivisor;
      const expectedBalance = userBalance.sub(withdrawFee);
      const smallDifference = expectedBalance * 0.0000001;
      console.log(`expectedBalance.sub(userBalanceAfterWithdraw): ${expectedBalance.sub(userBalanceAfterWithdraw)}`);
      console.log(`smallDifference: ${smallDifference}`);
      const isSmallBalanceDifference = expectedBalance.sub(userBalanceAfterWithdraw) < smallDifference;
      expect(isSmallBalanceDifference).to.equal(true);
    });
    xit("should trigger leveraging on withdraw when LTV is too low", async function () {
      const startingLTV = toWantUnit("0.6");
      await strategy.setTargetLtv(startingLTV);
      const depositAmount = toWantUnit("100");

      await vault.connect(self).deposit(depositAmount);
      const ltvBefore = await strategy.calculateLTV();
      console.log(`ltvBefore: ${ltvBefore}`);
      const allowedLTVDrift = toWantUnit("0.01");
      expect(ltvBefore).to.be.closeTo(startingLTV, allowedLTVDrift);
      const newLTV = toWantUnit("0.7");
      await strategy.setTargetLtv(newLTV);
      const smallWithdrawAmount = toWantUnit("1");
      const userBalance = await want.balanceOf(selfAddress);
      await vault.connect(self).withdraw(smallWithdrawAmount);
      const userBalanceAfterWithdraw = await want.balanceOf(selfAddress);
      const ltvAfter = await strategy.calculateLTV();
      console.log(`ltvAfter: ${ltvAfter}`);
      expect(ltvAfter).to.be.closeTo(newLTV, allowedLTVDrift);

      const securityFee = 10;
      const percentDivisor = 10000;
      const withdrawFee = smallWithdrawAmount.mul(securityFee).div(percentDivisor);
      const expectedBalance = userBalance.add(smallWithdrawAmount).sub(withdrawFee);

      expect(userBalanceAfterWithdraw).to.be.closeTo(expectedBalance, toWantUnit("0.0000001"));
    });
    xit("should trigger deleveraging on withdraw when LTV is too high", async function () {
      const startingLTV = toWantUnit("0.7");
      await strategy.setTargetLtv(startingLTV);
      const depositAmount = toWantUnit("100");

      await vault.connect(self).deposit(depositAmount);
      const ltvBefore = await strategy.calculateLTV();
      console.log(`ltvBefore: ${ltvBefore}`);
      const allowedLTVDrift = toWantUnit("0.01");
      expect(ltvBefore).to.be.closeTo(startingLTV, allowedLTVDrift);
      const newLTV = toWantUnit("0.6");
      await strategy.setTargetLtv(newLTV);
      const smallWithdrawAmount = toWantUnit("1");
      const userBalance = await want.balanceOf(selfAddress);
      await vault.connect(self).withdraw(smallWithdrawAmount);
      const userBalanceAfterWithdraw = await want.balanceOf(selfAddress);
      const ltvAfter = await strategy.calculateLTV();
      console.log(`ltvAfter: ${ltvAfter}`);
      expect(ltvAfter).to.be.closeTo(newLTV, allowedLTVDrift);

      const securityFee = 10;
      const percentDivisor = 10000;
      const withdrawFee = smallWithdrawAmount.mul(securityFee).div(percentDivisor);
      const expectedBalance = userBalance.add(smallWithdrawAmount).sub(withdrawFee);

      expect(userBalanceAfterWithdraw).to.be.closeTo(expectedBalance, toWantUnit("0.0000001"));
    });
    xit("should not change leverage on withdraw when still in the allowed LTV", async function () {
      const startingLTV = toWantUnit("0.7");
      await strategy.setTargetLtv(startingLTV);
      const depositAmount = toWantUnit("100");

      await vault.connect(self).deposit(depositAmount);
      const ltvBefore = await strategy.calculateLTV();
      console.log(`ltvBefore: ${ltvBefore}`);
      const allowedLTVDrift = toWantUnit("0.01");
      expect(ltvBefore).to.be.closeTo(startingLTV, allowedLTVDrift);

      const userBalance = await want.balanceOf(selfAddress);
      const smallWithdrawAmount = toWantUnit("0.005");
      await vault.connect(self).withdraw(smallWithdrawAmount);
      const userBalanceAfterWithdraw = await want.balanceOf(selfAddress);
      const ltvAfter = await strategy.calculateLTV();
      console.log(`ltvAfter: ${ltvAfter}`);
      expect(ltvAfter).to.be.closeTo(startingLTV, allowedLTVDrift);

      const securityFee = 10;
      const percentDivisor = 10000;
      const withdrawFee = smallWithdrawAmount.mul(securityFee).div(percentDivisor);
      const expectedBalance = userBalance.add(smallWithdrawAmount).sub(withdrawFee);

      expect(userBalanceAfterWithdraw).to.be.closeTo(expectedBalance, toWantUnit("0.0000001"));
    });
    xit("should allow small withdrawal", async function () {
      const userBalance = await want.balanceOf(selfAddress);
      console.log(`userBalance: ${userBalance}`);
      const depositAmount = toWantUnit("1");
      await vault.connect(self).deposit(depositAmount);
      console.log(`await want.balanceOf(selfAddress): ${await want.balanceOf(selfAddress)}`);

      const whaleDepositAmount = toWantUnit("10000");
      await vault.connect(wantWhale).deposit(whaleDepositAmount);

      await vault.connect(self).withdrawAll();
      const newUserVaultBalance = await vault.balanceOf(selfAddress);
      console.log(`newUserVaultBalance: ${newUserVaultBalance}`);
      const userBalanceAfterWithdraw = await want.balanceOf(selfAddress);
      const securityFee = 10;
      const percentDivisor = 10000;
      const withdrawFee = (depositAmount * securityFee) / percentDivisor;
      const expectedBalance = userBalance.sub(withdrawFee);
      const smallDifference = depositAmount * 0.00001;
      console.log(`expectedBalance.sub(userBalanceAfterWithdraw): ${expectedBalance.sub(userBalanceAfterWithdraw)}`);
      console.log(`smallDifference: ${smallDifference}`);
      const isSmallBalanceDifference = expectedBalance.sub(userBalanceAfterWithdraw) < smallDifference;
      expect(isSmallBalanceDifference).to.equal(true);
    });
    xit("should handle small deposit + withdraw", async function () {
      const userBalance = await want.balanceOf(selfAddress);
      console.log(`userBalance: ${userBalance}`);
      // "0.0000000000001" for 1e18
      // "0.001" for 6 decimals
      const depositAmount = toWantUnit("0.00000001");

      await vault.connect(self).deposit(depositAmount);
      console.log(`await want.balanceOf(selfAddress): ${await want.balanceOf(selfAddress)}`);

      await vault.connect(self).withdrawAll();
      console.log(`await want.balanceOf(selfAddress): ${await want.balanceOf(selfAddress)}`);
      const newUserVaultBalance = await vault.balanceOf(selfAddress);
      console.log(`newUserVaultBalance: ${newUserVaultBalance}`);
      const userBalanceAfterWithdraw = await want.balanceOf(selfAddress);
      const securityFee = 10;
      const percentDivisor = 10000;
      const withdrawFee = (depositAmount * securityFee) / percentDivisor;
      const expectedBalance = userBalance.sub(withdrawFee);
      expect(userBalanceAfterWithdraw).to.be.closeTo(expectedBalance, toWantUnit("0.000000001"));
    });
    xit("should be able to harvest", async function () {
      await vault.connect(self).deposit(toWantUnit("1000"));
      const estimatedGas = await strategy.estimateGas.harvest();
      console.log(`estimatedGas: ${estimatedGas}`);
      await strategy.connect(self).harvest();
    });
    xit("should provide yield", async function () {
      const timeToSkip = 3600;
      const initialUserBalance = await want.balanceOf(selfAddress);
      const depositAmount = initialUserBalance.div(10);

      await vault.connect(self).deposit(depositAmount);
      const initialVaultBalance = await vault.balance();

      await strategy.updateHarvestLogCadence(timeToSkip / 2);

      const numHarvests = 2;
      for (let i = 0; i < numHarvests; i++) {
        await moveTimeForward(timeToSkip);
        await vault.connect(self).deposit(depositAmount);
        await strategy.harvest();
      }

      const finalVaultBalance = await vault.balance();
      expect(finalVaultBalance).to.be.gt(initialVaultBalance);

      const averageAPR = await strategy.averageAPRAcrossLastNHarvests(numHarvests);
      console.log(`Average APR across ${numHarvests} harvests is ${averageAPR} basis points.`);
    });
  });
  describe("Strategy", function () {
    xit("should be able to pause and unpause", async function () {
      await strategy.pause();
      const depositAmount = toWantUnit(".05");
      await expect(vault.connect(self).deposit(depositAmount)).to.be.reverted;
      await strategy.unpause();
      await expect(vault.connect(self).deposit(depositAmount)).to.not.be.reverted;
    });
    xit("should be able to panic", async function () {
      const depositAmount = toWantUnit("0.05");
      await vault.connect(self).deposit(depositAmount);
      const vaultBalance = await vault.balance();
      const strategyBalance = await strategy.balanceOf();
      await strategy.panic();
      expect(vaultBalance).to.equal(strategyBalance);
      const newVaultBalance = await vault.balance();
      // 1e18 "0.000000001"
      // 1e6 "0.0000001"
      const allowedImprecision = toWantUnit("0.000000001");
      // Panic does not updateBalance so the reported balance is 2x
      expect(newVaultBalance.div(2)).to.be.closeTo(vaultBalance, allowedImprecision);
    });
    xit("should be able to retire strategy", async function () {
      const depositAmount = toWantUnit(".05");
      await vault.connect(self).deposit(depositAmount);
      const vaultBalance = await vault.balance();
      const strategyBalance = await strategy.balanceOf();
      expect(vaultBalance).to.equal(strategyBalance);
      // Test needs the require statement to be commented out during the test
      await expect(strategy.retireStrat()).to.not.be.reverted;
      const newVaultBalance = await vault.balance();
      const newStrategyBalance = await strategy.balanceOf();
      const allowedImprecision = toWantUnit("0.00000001");
      expect(newVaultBalance).to.be.closeTo(vaultBalance, allowedImprecision);
      expect(newStrategyBalance).to.be.lt(allowedImprecision);
    });
    xit("should be able to retire strategy with no balance", async function () {
      // Test needs the require statement to be commented out during the test
      await expect(strategy.retireStrat()).to.not.be.reverted;
    });
    it("should be able to estimate harvest", async function () {
      const whaleDepositAmount = toWantUnit("27171");
      await vault.connect(wantWhale).deposit(whaleDepositAmount);
      const minute = 60;
      const hour = 60 * minute;
      const day = 24 * hour;
      await moveTimeForward(1 * day);
      await strategy.harvest();
      await moveTimeForward(1 * day);
      await vault.connect(wantWhale).deposit(toWantUnit("1"));
      const [profit, callFeeToUser] = await strategy.estimateHarvest();
      console.log(`profit: ${profit}`);
      const hasProfit = profit.gt(0);
      const hasCallFee = callFeeToUser.gt(0);
      expect(hasProfit).to.equal(true);
      expect(hasCallFee).to.equal(true);
    });
    it("should be able to estimate blocks until liquidation", async function () {
      const whaleDepositAmount = toWantUnit("27171");
      await vault.connect(wantWhale).deposit(whaleDepositAmount);
      const blocksUntilLiquidation = await strategy.getblocksUntilLiquidation();
      console.log(`blocksUntilLiquidation: ${blocksUntilLiquidation}`);
      expect(blocksUntilLiquidation.gt(0)).to.equal(true);
    });
  });
});
