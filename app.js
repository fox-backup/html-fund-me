import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const withdrawButton = document.getElementById("withdrawButton");
const fundButton = document.getElementById("fundButton");
const getBalanceButton = document.getElementById("getBalanceButton");

connectButton.onclick = connect;
withdrawButton.onclick = withdraw;
fundButton.onclick = fund;
getBalanceButton.onclick = getBalance;

async function connect() {
    connectButton.style.backgroundColor = "blue";
    if (typeof window.ethereum !== "undefined") {
        try {
            window.ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
            console.log(error);
        }
        document.getElementById("connectButton").innerHTML = "Connected";
        const accounts = window.ethereum.request({
            method: "eth_requestAccounts",
        });
        connectButton.style.backgroundColor = "green";
    } else {
        document.getElementsByClassName("contract-buttons").innerHTML =
            "<a href='https://metamask.io/download/'>Please install MetaMask</a>";
        console.error("No MetaMask Installed");
        connectButton.style.backgroundColor = "red";
    }
    connectButton.style.backgroundColor = "#aff";
}

async function withdraw() {
    withdrawButton.style.backgroundColor = "blue";
    console.log("Withdrawing...");
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.withdraw();
            await listenForTransactionMine(transactionResponse, provider);
            withdrawButton.style.backgroundColor = "green";
        } catch (error) {
            console.log(error);
        }
    } else {
        document.getElementsByClassName("contract-buttons").innerHTML =
            "<a href='https://metamask.io/download/'>Please install MetaMask</a>";
        console.error("No MetaMask Installed");
        withdrawButton.style.backgroundColor = "red";
    }
    withdrawButton.style.backgroundColor = "#aff";
}

async function fund() {
    fundButton.style.backgroundColor = "blue";
    const ethAmount = document.getElementById("eth-amount").value;
    console.log(`Funding contract with ${ethAmount}`);
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            await listenForTransactionMine(transactionResponse, provider);
            fundButton.style.backgroundColor = "green";
        } catch (error) {
            console.error(error);
        }
    } else {
        document.getElementsByClassName("contract-buttons").innerHTML =
            "<a href='https://metamask.io/download/'>Please install MetaMask</a>";
        console.error("No MetaMask Installed");
        fundButton.style.backgroundColor = "red";
    }
    fundButton.style.backgroundColor = "#aff";
}

async function getBalance() {
    if (window.ethereum !== undefined) {
        getBalanceButton.style.backgroundColor = "blue";
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
            const balance = await provider.getBalance(contractAddress);
            console.log(ethers.utils.formatEther(balance));
            getBalanceButton.style.backgroundColor = "green";
            getBalanceButton.innerHTML = `Contract Balance: ${ethers.utils.formatEther(
                balance
            )} Goerli ETH`;
        } catch (error) {
            console.error(error);
        }
    } else {
        document.getElementsByClassName("contract-buttons").innerHTML =
            "<a href='https://metamask.io/download/'>Please install MetaMask</a>";
        console.error("No MetaMask Installed");
        getBalanceButton.style.backgroundColor = "red";
    }
    getBalanceButton.style.backgroundColor = "#aff";
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`);
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(
                    `Completed with ${transactionReceipt.confirmations} confirmations. `
                );
                resolve();
            });
        } catch (error) {
            reject(error);
        }
    });
}
