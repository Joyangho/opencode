/*
Ethereum = 1
Rinkeby = 4
*/
const Network = 1;

(async () => {
  if (window.ethereum) {
    setMintCount();
  }
})();

var WalletAddress = "";
var WalletBalance = "";

var isConnected = false;

async function connectWallet() {
  if (window.ethereum) {
    await window.ethereum.send("eth_requestAccounts");
    window.web3 = new Web3(window.ethereum);
    //Check network
    if (window.web3._provider.networkVersion != Network) {
      alert("Please connect correct network", "", "warning");
      return;
    }

    //Get Account information
    var accounts = await web3.eth.getAccounts();
    WalletAddress = accounts[0];
    WalletBalance = await web3.eth.getBalance(WalletAddress);

    isConnected = true;
    document.getElementById("txtMintBtn").innerHTML = "Buy NFTs";
    document.getElementById("txtWalletBalance").innerHTML = web3.utils.fromWei(WalletBalance).substr(0,8);
    var txtAccount = accounts[0].substr(0,5)+'...'+accounts[0].substr(37,42);
    document.getElementById("txtConnectWalletBtn").innerHTML = txtAccount;
    document.getElementById("txtWalletAddress").innerHTML = txtAccount;
    /*
    document.getElementById("txtWalletAddress").innerHTML = WalletAddress;
    document.getElementById("walletInfo").style.display = "block";
    document.getElementById("btnConnectWallet").style.display = "none";
    */
  } else {
    alert("You will need to extend your Metamask wallet using Google Chrome or Brave browser!");
  }
}

async function setMintCount() {
  await window.ethereum.send("eth_requestAccounts");
  window.web3 = new Web3(window.ethereum);
  contract = new web3.eth.Contract(ABI, ADDRESS);

  if (contract) {
    var totalSupply = await contract.methods.totalSupply().call();
    document.getElementById("txtTotalSupply").innerHTML = totalSupply;
    var totalSupply = await contract.methods.maxSupply().call();
    document.getElementById("txtMaxSupply").innerHTML = totalSupply;
  }
}

function btnMintAmount(type) {
  var amount = document.getElementById("txtMintAmount").innerHTML * 1;
  console.log(amount);
  switch (type) {
    case "minus":
      if (amount > 1) {
        amount -= 1;
        document.getElementById("txtMintAmount").innerHTML = amount;
      }
      break;
    case "plus":
      if (amount < 10) {
        amount += 1;
        document.getElementById("txtMintAmount").innerHTML = amount;
      }
      break;
  }
}

async function mint() {
  if (!isConnected || !contract || !signer) {
    showModal('Please connect your wallet first.', 'warning');
    return;
  }
  try {
    const minRequired = ethers.utils.parseEther('0.054');
    const liveBal = await provider.getBalance(walletAddress);
    if (liveBal.lt(minRequired)) {
      showModal('Insufficient minimum ETH. At least 0.054 ETH is required in your wallet.', 'warning');
      return;
    }
  } catch (e) {
    console.error('Balance check failed', e);
    showModal('Failed to check your balance. Please try again.', 'error');
    return;
  }
  try {
    const input = document.getElementById('mintAmount');
    const amount = Math.min(MAX_MINT_AMOUNT, Math.max(MIN_MINT_AMOUNT, parseInt(input?.value || '1')));
    const costWei = ethers.BigNumber.from(currentMintPrice);
    const value = costWei.mul(amount);
    showLoading('Minting...');
    const tx = await (contract.HighRunPCMint
      ? contract.HighRunPCMint(amount, { value })
      : contract.WhiteAndTrans(walletAddress, amount, { value })
    );
    await tx.wait();
    showModal('Mint success!', 'success');
    await loadContractData();
    await refreshHrpcCount();
    if (provider && walletAddress) {
      const bal = await provider.getBalance(walletAddress);
      walletBalance = bal.toString();
      updateWalletUI();
    }
  } catch (e) {
    console.error('Mint failed', e);
    showModal('Mint failed. Please try again.', 'error');
  } finally {
    hideLoading();
  }
}
