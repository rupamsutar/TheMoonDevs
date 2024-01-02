import React from "react";

export default function SupplyBar() {
  const { supplies, allSupplies } = useAppSupplies();
  const statsSupplies = supplies;

  return (
    <div className="supply_bar">
      <AppIcon
        url="/icons/fire.svg"
        size={1.15}
        margin={0}
        fill={IconFilter.primary}
      />
      <AppIcon
        url="/icons/double_arrow.svg"
        size={1.15}
        style={{
          margin: "0 0 0 -0.8rem",
        }}
        fill={IconFilter.primary}
      />
      <span
        className="line orange"
        style={{ width: `${100 - statsSupplies.circulatingPercent}%` }}
      ></span>
      <span
        className="line green"
        style={{ width: `${statsSupplies.circulatingPercent}%` }}
      ></span>
    </div>
  );
}
