async function main() {
  const Vault = await ethers.getContractFactory("ReaperVaultv1_3");

  const wftmAddress = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";
  const tokenName = "WFTM Iron Bank Single Sided";
  const tokenSymbol = "rf-iWFTM";
  const approvalDelay = 0;
  const depositFee = 0;
  const tvlCap = ethers.utils.parseEther("1000");

  const vault = await Vault.deploy(wftmAddress, tokenName, tokenSymbol, approvalDelay, depositFee, tvlCap);

  await vault.deployed();
  console.log("Vault deployed to:", vault.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
