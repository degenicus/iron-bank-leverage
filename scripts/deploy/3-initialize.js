async function main() {
  const vaultAddress = "0x35B01DB4f903F42052ab8562BaBC38781aB01205";
  const strategyAddress = "0xB194Dc2AAbaCC11517296E2aba8037d5bB4982D1";

  const Vault = await ethers.getContractFactory("ReaperVaultv1_3");
  const vault = Vault.attach(vaultAddress);

  await vault.initialize(strategyAddress);
  console.log("Vault initialized");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
