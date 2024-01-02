import React from "react";

export default function TopBar() {
  const { walletChain, openChainModal } = useWallet();
  const { suppliesChain } = useAppSupplies();

  const tokenAddress = fetchAddressForChain(
    suppliesChain?.id,
    isOldToken ? "oldToken" : "newToken"
  );

  return (
    <div className="top_bar">
      <AppIcon
        url="/images/token/App_new.svg"
        size={2}
        margin={0}
        fill={IconFilter.unset}
      />
      <p className="label">App SUPPLY</p>
      <AppChip
        onClick={openChainModal}
        title={walletChain?.name || "---"}
        endIcon={"/icons/expand_more.svg"}
        startIcon={`/images/token/${walletChain?.nativeCurrency?.symbol}.svg`}
      ></AppChip>
      <AppExtLink
        className=" supply_label"
        url={`${suppliesChain?.blockExplorers?.default?.url}/address/${tokenAddress}`}
      >
        View Contract
      </AppExtLink>
    </div>
  );
}
