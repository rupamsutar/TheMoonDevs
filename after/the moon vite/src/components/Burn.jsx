import { useState } from "react";
import AppTokenBurn from "./subComponents/appTokenBurn/AppTokenBurn";

const BurnPageStyled = styled.div``;

const BurnTxProgress = {
  default: "Burn App Tokens",
  burning: "Burning...",
};

export const BurnPage = () => {
  const {
    walletAddress,
    isWalletConnected,
    walletBalance,
    isBalanceError,
    openChainModal,
    walletChain,
    chains,
    openConnectModal,
  } = useWallet();

  const { openChainSelector, setOpenChainSelector, openChainSelectorModal } =
    useChainSelector();

  const { chains: receiveChains } = useWallet();

  const {
    supplies,
    allSupplies,
    setSuppliesChain,
    suppliesChain,
    fetchSupplies,
  } = useAppSupplies(true);

  const [burnTransactions, setBurnTransactions] = useState([]);
  const [isOldToken, setIsOldToken] = useState(false);
  const [burnAmount, setBurnAmount] = useState("");

  const { toastMsg, toastSev, showToast } = useAppToast();

  const ethersSigner = useEthersSigner({
    chainId: walletChain?.id ?? chainEnum.mainnet,
  });

  const [txButton, setTxButton] = useState(BurnTxProgress.default);
  const [txProgress, setTxProgress] = useState(false);
  const [approveTxHash, setApproveTxHash] = useState(null);
  const [burnTxHash, setBurnTxHash] = useState(null);

  const statsSupplies = supplies;
  const tokenAddress = fetchAddressForChain(
    suppliesChain?.id,
    isOldToken ? "oldToken" : "newToken"
  );

  const [coinData, setCoinData] = useState({});
  useEffect(() => {
    CoinGeckoApi.fetchCoinData()
      .then((data) => {
        setCoinData(data?.market_data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const onChangeBurnAmount = (e) => {
    if (e.target.value == "") setBurnAmount("");
    if (isNaN(parseFloat(e.target.value))) return;
    setBurnAmount(e.target.value);
  };

  const refetchTransactions = () => {
    Promise.all(
      ChainScanner.fetchAllTxPromises(isChainTestnet(walletChain?.id))
    )
      .then((results) => {
        let res = results.flat();
        res = ChainScanner.sortOnlyBurnTransactions(res);
        res = res.sort((a, b) => b.timeStamp - a.timeStamp);
        setBurnTransactions(res);
      })
      .catch((err) => {
        console.log(err);
      });
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

  useEffect(() => {
    if (!walletChain) return;
    let isSubscribed = true;
    if (isSubscribed) setBurnTransactions([]);
    const isTestnet = isChainTestnet(walletChain?.id);
    let _chainObjects = [mainnet, avalanche, fantom];
    if (isTestnet) _chainObjects = [sepolia, avalancheFuji, fantomTestnet];
    Promise.all(ChainScanner.fetchAllTxPromises(isTestnet))
      .then((results) => {
        if (isSubscribed) {
          let new_chain_results = [];
          results.forEach((results_a, index) => {
            new_chain_results.push(
              results_a.map((tx) => ({
                ...tx,
                chain: _chainObjects[index],
              }))
            );
          });
          let res = new_chain_results.flat();
          res = ChainScanner.sortOnlyBurnTransactions(res);
          res = res.sort((a, b) => b.timeStamp - a.timeStamp);
          setBurnTransactions(res);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    return () => {
      isSubscribed = false;
    };
  }, [walletChain, isOldToken]);

  return (
    <div>
      <DashboardLayoutStyled className="burnpage">
        <div
          className="top_conatiner burnpage"
          style={{ alignItems: "flex-start" }}
        >
          <AppTokenBurn />
          <BurnStatsContainer>
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
            <div className="supply_label_list">
              <div>
                <p className="supply_label">
                  <span className="hyphen orange"></span>
                  <span className="text">Burnt App Tokens</span>
                  <span className="percent orange">
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
                  {numberWithCommas(
                    statsSupplies.totalSupply - statsSupplies.circulatingSupply
                  )}
                </p>
                <div className="full_supply">
                  Original App Token Initial Supply:
                  {numberWithCommas(statsSupplies.totalSupply)}
                </div>
              </div>
              <div>
                <p className="supply_label">
                  <span className="hyphen green"></span>
                  <span className="text">Circulating App Tokens</span>
                  <span className="percent green">
                    {statsSupplies.circulatingPercent.toFixed(2)}%
                  </span>
                </p>
                <p className="supply_value">
                  <AppIcon
                    size={1.25}
                    url={`/images/token/${walletChain?.nativeCurrency?.symbol}.svg`}
                    fill={IconFilter.unset}
                    margin={0}
                  />
                  {numberWithCommas(statsSupplies.circulatingSupply)}
                </p>
                {allSupplies
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
            </div>
          </BurnStatsContainer>
        </div>
      </DashboardLayoutStyled>
      <TransactionTableStyled>
        <div className="header">
          <p className="header_label">Burn Transactions</p>
        </div>
        <BurnTxTable
          data={burnTransactions}
          priceUSD={coinData?.current_price?.usd}
        />
      </TransactionTableStyled>
      <ChainSelector
        title={"Switch Token Chain"}
        openChainSelector={openChainSelector}
        setOpenChainSelector={setOpenChainSelector}
        chains={receiveChains}
        selectedChain={suppliesChain}
        setSelectedChain={setSuppliesChain}
      />
      <AppToast
        position={{ vertical: "bottom", horizontal: "center" }}
        message={toastMsg}
        severity={toastSev}
      />
    </div>
  );
};
