import React from "react";

export default function SupplyLabel(props) {
  const { supplyLabel, showTotalSupply, color, showAllSupplies } = props;

  const { walletChain } = useWallet();
  const { supplies } = useAppSupplies();

  const statsSupplies = supplies;

  return (
    <div>
      <p className="supply_label">
        <span className={`hyphen ${color}`}></span>
        <span className="text">{supplyLabel}</span>
        <span className={`percent ${color}`}>
          {/* can be rendered conditionally for red and green */}
          {(100 - statsSupplies.circulatingPercent).toFixed(2)}%
        </span>
      </p>
      <p className="supply_value">
        <AppIcon
          size={1.25}
          url={`/images/token/${walletChain?.nativeCurrency?.symbol}.svg`}
          fill={IconFilter.unset}
          margin={0}
        />
        {supplyLabel === "Burnt App Tokens" &&
          numberWithCommas(
            statsSupplies.totalSupply - statsSupplies.circulatingSupply
          )}

        {supplyLabel === "Circulating App Tokens" &&
          numberWithCommas(statsSupplies.circulatingSupply)}
      </p>
      {showTotalSupply && (
        <div className="full_supply">
          Original App Token Initial Supply:
          {numberWithCommas(statsSupplies.totalSupply)}
        </div>
      )}
      {showAllSupplies &&
        allSupplies
          .filter((s) => s.chainId != walletChain?.id)
          .map((s) => (
            <p key={s.chainId} className="supply_value mini">
              <AppIcon
                size={1.25}
                url={`/images/token/${
                  chainTokenSymbols.get(s.chainId) ?? "ETH"
                }.svg`}
                fill={IconFilter.unset}
                margin={0}
              />
              {numberWithCommas(s.circulatingSupply)}
            </p>
          ))}
    </div>
  );
}
