/*
Ethereum = 1
Goerli 테스트 네트워크 = 5
Polygon Mainnet = 137;
Polygon Mumbai testnet = 80001;
*/
const Network = 5;

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
    var txtAccount =
      accounts[0].substr(0, 5) + "..." + accounts[0].substr(37, 42);
    document.getElementById("txtConnectWalletBtn").innerHTML = txtAccount;
    document.getElementById("txtMintBtn").innerHTML = "Mint";

    document.getElementById("txtWalletAddress").innerHTML = txtAccount;
    document.getElementById("txtWalletBalance").innerHTML = web3.utils
      .fromWei(WalletBalance)
      .substr(0, 5);
    document.getElementById("walletInfo").style.display = "block";
    document.getElementById("btnConnectWallet").style.display = "none";
  } else {
    alert("You need Metamask first!");
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
  if (window.ethereum) {
    await window.ethereum.send("eth_requestAccounts");
    window.web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(ABI, ADDRESS);

    if (isConnected) {
      if (contract) {
        if (web3.utils.fromWei(WalletBalance) < 0.0001) {
          alert("You need more Ethereum");
        } else {
          var mintAmount = document.getElementById("txtMintAmount").innerHTML;
          var transaction = await contract.methods
            .SuwonMint(mintAmount)
            .send({ from: WalletAddress, value: 0.0001 * mintAmount * 10 ** 18 })
            .on("error", function (error) {
              alert("Mint error!");
              console.log("Mint - Error : " + error);
            })
            .then(function (receipt) {
              alert("Mint Success!");
              console.log("Mint - success : " + receipt);
            });
          console.log("Mint - transaction : " + transaction);
        }
      }
    } else {
      connectWallet();
    }
  } else {
    alert("You need Metamask first!");
  }
}
// 사용자가 소유하고 있는 모든 토큰 ID를 가져오는 함수
async function getOwnedTokens(walletAddress) {
  // 사용자가 소유하고 있는 토큰의 수를 조회
  let balance = await contract.methods.balanceOf(walletAddress).call();
  let tokenIds = [];

  // 각 토큰에 대해 토큰 ID를 조회
  for (let i = 0; i < balance; i++) {
      let tokenId = await contract.methods.tokenOfOwnerByIndex(walletAddress, i).call();
      tokenIds.push(tokenId);
  }

  return tokenIds;
}

async function isOwner(walletAddress) {
  // 사용자가 소유하고 있는 모든 토큰 ID를 가져옵니다.
  let tokenIds = await getOwnedTokens(walletAddress);
  
  // 각 토큰에 대해 소유권을 체크합니다.
  for (let tokenId of tokenIds) {
      let ownerAddress = await contract.methods.ownerOf(tokenId).call();
      if (ownerAddress === walletAddress) {
          return true;
      }
  }

  // 모든 토큰에 대해 소유권이 없는 경우
  return false;
}

async function checkOwnership() {
if (window.ethereum) {
  await window.ethereum.send("eth_requestAccounts");
  window.web3 = new Web3(window.ethereum);
  contract = new web3.eth.Contract(ABI, ADDRESS);

  if (isConnected) {
    if (contract) {
      // NFT 오너쉽 확인
      const isNFTOwner = await isOwner(WalletAddress);
      if (isNFTOwner) {
        console.log('인증된 NFT 오너입니다.');
        alert('인증된 NFT 오너입니다.');
        window.location.href = 'ownership.html';
      } else {
        console.log('NFT 오너가 아닙니다.');
        alert('NFT 오너가 아닙니다.');
      }
    }
  } else {
    connectWallet();
  }
} else {
  alert("You need Metamask first!");
}
}

// 버튼 클릭 시 checkOwnership 함수를 호출하도록 설정합니다.
document.getElementById("checkOwnershipButton").addEventListener("click", function() {
  checkOwnership();
}
)
