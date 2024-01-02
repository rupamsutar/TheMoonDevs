import { useState } from "react";
import AppTokenBurn from "./subComponents/appTokenBurn/AppTokenBurn";
import TopBar from "./subComponents/topBar/TopBar";
import SupplyBar from "./subComponents/supplyBar/SupplyBar";

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
          <AppTokenBurn
            walletChain={walletChain}
            openConnectModal={openConnectModal}
            isWalletConnected={isWalletConnected}
            showToast={showToast}
          />
          <BurnStatsContainer>
            <TopBar />
            <SupplyBar />
            <div className="supply_label_list">
              <SupplyBar
                supplyLabel={"Burnt App Tokens"}
                showTotalSupply={true}
                color={"orange"}
              />
              <SupplyBar
                supplyLabel={"Circulating App Tokens"}
                color={"green"}
                showAllSupplies={true}
              />
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
