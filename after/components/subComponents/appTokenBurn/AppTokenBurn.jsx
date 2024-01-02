import React, { useState } from "react";

const BurnTxProgress = {
  default: "Burn App Tokens",
  burning: "Burning...",
};

export default function AppTokenBurn({
  walletChain,
  openConnectModal,
  isWalletConnected,
  showToast,
}) {
  const [burnAmount, setBurnAmount] = useState("");
  const [txButton, setTxButton] = useState(BurnTxProgress.default);
  const [txProgress, setTxProgress] = useState(false);
  const [burnTxHash, setBurnTxHash] = useState(null);

  const onChangeBurnAmount = (e) => {
    if (e.target.value == "") setBurnAmount("");
    if (isNaN(parseFloat(e.target.value))) return;
    setBurnAmount(e.target.value);
  };

  const executeBurn = async () => {
    if (!isWalletConnected) {
      openConnectModal();
    }
    if (burnAmount === "") {
      console.log("Enter amount to migrate");
      showToast("Enter amount to migrate", ToastSeverity.warning);
      return;
    }
    const newTokenAddress = fetchAddressForChain(walletChain?.id, "newToken");
    const oftTokenContract = new Contract(
      newTokenAddress,
      oftAbi,
      ethersSigner
    );
    let amount = parseEther(burnAmount);
    setTxButton(BurnTxProgress.burning);
    setTxProgress(true);
    try {
      const burnTx = await oftTokenContract.burn(amount);
      setBurnTxHash(burnTx.hash);
      console.log(burnTx, burnTx.hash);
      await burnTx.wait();
      setTxButton(BurnTxProgress.default);
      setTxProgress(false);
      refetchTransactions();
      fetchSupplies();
    } catch (err) {
      console.log(err);
      setTxButton(BurnTxProgress.default);
      setTxProgress(false);
      showToast("Burn Failed!", ToastSeverity.error);
      return;
    }
  };

  return (
    <div className="info_box filled">
      <h1 className="title">App TOKEN BURN</h1>
      <p className="description medium"></p>

      <BurnButtonBar>
        <p className="box_subheader">Burn your App</p>
        <div className="description medium">
          &quot; The process of reducing the supply of App tokens by permanently
          removing a certain number of them from circulation, often through a
          deliberate and recorded mechanism. &quot;
        </div>

        <div className="burn_bar">
          <div className="input_value_box">
            <p className="input_muted">Enter amount to Burn</p>
            <input
              className="input_value"
              type="text"
              value={burnAmount}
              placeholder="0.00"
              onChange={onChangeBurnAmount}
            />
          </div>
          <Button
            variant="outlined"
            onClick={executeBurn}
            startIcon={
              txProgress ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <AppIcon
                  url="/icons/fire.svg"
                  fill={IconFilter.primary}
                  size={1.5}
                  margin={0}
                />
              )
            }
          >
            <span>{txButton}</span>
          </Button>
        </div>
        {burnTxHash && (
          <div className="tx_links">
            <AppTooltip
              title={`Check burn Transaction on chain ${walletChain?.blockExplorers?.default?.name}`}
            >
              <AppExtLink
                url={`${walletChain?.blockExplorers?.default?.url}/tx/${burnTxHash}`}
                className="header_link"
              >
                Burn Tx: {prettyEthAddress(burnTxHash ?? zeroAddress)}
              </AppExtLink>
            </AppTooltip>
          </div>
        )}
      </BurnButtonBar>
    </div>
  );
}
