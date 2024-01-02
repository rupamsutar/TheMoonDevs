import { useState } from "react";
import AppTokenBurn from "./subComponents/appTokenBurn/AppTokenBurn";
import TopBar from "./subComponents/topBar/TopBar";

const BurnPageStyled = styled.div``;

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

  const [approveTxHash, setApproveTxHash] = useState(null);

  const statsSupplies = supplies;

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
            <TopBar />
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
