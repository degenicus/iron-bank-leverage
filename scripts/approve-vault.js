async function main() {
  const vaultAddress = "0x35B01DB4f903F42052ab8562BaBC38781aB01205";
  const ERC20 = await ethers.getContractFactory("contracts/ERC20.sol:ERC20");
  const wftmAddress = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";
  const wftm = await ERC20.attach(wftmAddress);
  await wftm.approve(vaultAddress, ethers.utils.parseEther("100"));
  console.log("wftm approved");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
