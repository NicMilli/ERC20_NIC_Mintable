import React, { Component } from "react";
import NicToken from "./contracts/NicToken.json";
import NicTokenSale from "./contracts/NicTokenSale.json";
import KycContract from "./contracts/KycContract.json";
import getWeb3 from "./getWeb3";

import "./App.css";

import { CoinGeckoClient } from 'coingecko-api-v3';

//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { faEthereum } from '@fortawesome/free-brands-svg-icons';
import bckgrnd from './bckgrnd.jpg';
import extension1 from './extension1.png';
import extension2 from './extension2.png';
import mylogo from './mylogo.png';


const client = new CoinGeckoClient({
  timeout: 1000,
  autoRetry: true,
});


class App extends Component {
  state = {loaded: false, kycAddress: "0x123...", tokenSaleAddr: "No address set yet", 
  tokenAddr: null, userTokens: 0, tokenSupply:0, cost:0, price:0 };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.getChainId();

      this.NicTokenInstance = new this.web3.eth.Contract(
        NicToken.abi,
        NicToken.networks[this.networkId] && NicToken.networks[this.networkId].address,
      );

      this.NicTokenSaleInstance = new this.web3.eth.Contract(
        NicTokenSale.abi,
        NicTokenSale.networks[this.networkId] && NicTokenSale.networks[this.networkId].address,
      );

      this.KYCInstance = new this.web3.eth.Contract(
        KycContract.abi,
        KycContract.networks[this.networkId] && KycContract.networks[this.networkId].address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToTokenTransfer();
      this.setState({loaded: true, tokenSaleAddr: NicTokenSale.networks[this.networkId].address, 
        tokenAddr: NicToken.networks[this.networkId].address },
         this.updateTokenCounts, this.priceSet());
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details. 
        Please install the metamask plugin and connect to the Ropsten test network in order to buy coins
        You may need to show test networks in settings, advanced, show test networks`,
      );
      console.error(error);
    }
  };

  priceSet = async() => {
    let latest = await client.simplePrice({vs_currencies:'usd', ids: 'ethereum'});
    //this.costSet();
    this.setState({price: latest.ethereum.usd, cost: latest.ethereum.usd*Math.pow(10,-18) });
  };

  updateTokenCounts = async() => {
    let userTokens = await this.NicTokenInstance.methods.balanceOf(this.accounts[0]).call();
    let tokenSupply = await this.NicTokenInstance.methods.totalSupply().call();
    this.setState({userTokens: userTokens, tokenSupply: tokenSupply});
  }

  listenToTokenTransfer = () => {
    this.NicTokenInstance.events.Transfer({to: this.accounts[0]}).on("data", this.updateTokenCounts);
  }

  handleBuyTokens = async() => {
    await this.NicTokenSaleInstance.methods.buyTokens(this.accounts[0]).send({from: this.accounts[0], value: this.web3.utils.toWei("1", "wei")});
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name] : value
    });
    }

    handleKycWhitelisting = async() => {
      console.log(this.KYCInstance);
      //console.log(this.NicTokenInstance.methods.owner);
      await this.KYCInstance.methods.setKycCompleted(this.state.kycAddress).send({from: this.accounts[0]});
      alert("KYC for "+this.state.kycAddress+" has been completed.")
    }

    priceview = async() => {
      await this.priceSet();
      const {price} = this.state;
      alert("The price is $"+price);
     }

     hideKYC = () => {
      var x = document.getElementById('kyc');
      if (x.style.display === 'none') {
          x.style.display = 'block';
      } else {
          x.style.display = 'none';
         }
      }
  

  render() {
    if (!this.state.loaded) {
      return <div className="App">Loading Web3, accounts, and contract...<br></br>
        <h2>In order to buy coins, please install the metamask plugin on chrome or firefox and connect to the Ropsten test network.</h2> <br></br>
        <a href="https://metamask.io/download/">Download Metamask Extension For Your Browser!</a><br></br>
        You may need to show test networks in settings, advanced, show test networks.<br></br><br></br>Find and pin the Metamask extension in your browser<br></br>
        <img src={extension1} alt="Instructions"></img><br></br>then, select the Ropsten test network<br></br>
        <img src={extension2} alt="Instructions"></img><br></br>
        <br></br>You can then select 'buy' and request FREE test Ether from the test faucet.<br></br><br></br>
        <h2>Please refresh the page once connected</h2>
      </div>;
    }
    return (
      <div className="App" style={{
        backgroundImage: `url(${bckgrnd})`,
        backgroundSize: "cover",
        height: "100vh",
        color: "#f5f5f5"
      }}>
        <header className='App-header' ><img className='App-logo' src={mylogo} alt="logo"/></header>
        <h1>Nic's Token Sale</h1>
        <p>View the current ethereum price in USD:<button type="button" className='price-btn' onClick={this.priceview}><strong>Ethereum Price</strong></button></p>
        <p>The token cost is 1 Wei or ${this.state.cost} - NOW THATS A STEAL!</p>
        <p>Current token supply: {this.state.tokenSupply}</p>

        <button id="toggle" type="button" className= 'btn' onClick={this.hideKYC}>Show/Hide KYC (Owner Only)</button>
  
        <div id="kyc">
        <h2>Kyc Whitelisting:</h2>
        <p>Address to allow token buying: <input type="text" name="kycAddress" value={this.state.kycAddress} onChange = {this.handleInputChange} /></p>
        <button type="button" className= 'blk-btn' onClick={this.handleKycWhitelisting}>Add to Whitelist</button> 
        </div>

        <h2>Buy Tokens</h2>
        <p>Please send funds to this address to buy tokens: <br></br>{this.state.tokenSaleAddr}</p>
        <p>You currently have: {this.state.userTokens} NIC tokens!</p>
        <button type="button" className= 'blk-btn' onClick={this.handleBuyTokens}>Buy More Tokens</button>
      </div>
    );
  }
}

export default App;