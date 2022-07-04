import React, { Component } from 'react'
import './App.css'
import Web3 from 'web3'
import contractAbi from '../abis/FumigationDronToken.json'
import { FumigationDronTokenAddress as contractAddress, NetworkIdToUse, TokenDecimals } from "./config.js";
import { Icon } from 'semantic-ui-react'
import centralImage from '../imagenes/dron-fumigation-now.jpg'

class Tokens extends Component {

    // Constructor
    constructor(props) {
        super(props);

        this.state = {
            currentNetworkId: 0,
            loading: false,
            errorMessage: "",
            account: "",
            contract: null,
            tokenPrice: 0,
            ethPrice: 0,
            suscriptionTokensBuyed: null,
            suscriptionTokensReturned: null,
            showedEvents: []
        }
    }

    async componentWillMount() {
        // 1. Load Web3
        await this.loadWeb3(this);
        // 2. Load blockchain dataa
        await this.loadBlockchainData();
        // 3. Sucribe to events
        await this.suscribeEvents();
    }

    async componentWillUnmount() {
        // 1. Unsucribe events
        this.unsuscribeEvents();
    }

    // 1. Carga de Web3
    async loadWeb3(self) {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
                    .catch((error) => {
                        if (error.code === 4001) {
                            // EIP-1193 userRejectedRequest error
                            console.warn('Please connect to Web3 Wallet.');
                        } else {
                            console.error(error);
                        }
                    });
                console.debug("accounts: " + accounts);
                if (accounts && accounts.length > 0) {
                    self.setState({ accounts: accounts, account: accounts[0], hasWeb3Account: true });

                    window.ethereum.on('accountsChanged', function (accounts) {
                        // Time to reload your interface with accounts[0]!
                        console.debug("Account changed. accounts: ", accounts)
                        if (accounts && accounts.length > 0) {
                            self.setState({ accounts: accounts, account: accounts[0], hasWeb3Account: true });
                        } else {
                            self.setState({ accounts: null, account: null, hasWeb3Account: false });
                        }
                    });
                }
            } catch (err) {
                console.error("loadWeb3", err);
                window.alert("load web3. " + err)
            }
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert('Not detected any wallet. You will try any wallet with web3 support like Metamask!');
        }
    }

    async suscribeEvents() {
        // Events suscribe
        if (this.state.suscriptionTokensBuyed === null) {
            this.eventCatchTokensBuyed();
        }
        if (this.state.suscriptionTokensReturned === null) {
            this.eventCatchTokensReturned();
        }
    }

    unsuscribeEvents() {
        // Unsubscribes the subscription

        // TokensBuyed
        if (this.state.suscriptionTokensBuyed !== null) {
            this.state.suscriptionTokensBuyed.unsubscribe(function (error, success) {
                if (success) {
                    console.debug('Successfully unsubscribed TokensBuyed!');
                } else {
                    console.error("Error when unsubscribe TokensBuyed", error);
                }
            });
        }

        // NewWorkAdded
        if (this.state.suscriptionTokensReturned !== null) {
            this.state.suscriptionTokensReturned.unsubscribe(function (error, success) {
                if (success) {
                    console.debug('Successfully unsubscribed TokensReturned!');
                } else {
                    console.error("Error when unsubscribe TokensReturned", error);
                }
            });
        }

        // General cleaning
        window.web3.eth.clearSubscriptions();
    }

    async checkNetworkId(networkId) {
        let isOk;
        if (networkId === NetworkIdToUse) {
            isOk = true;
        } else {
            isOk = false;
        }
        return isOk;
    }

    // 2. Carga de datos de la Blockchain
    async loadBlockchainData() {
        const method = "loadBlockchainData";
        try {
            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();
            this.setState({ account: accounts[0] });
            console.debug('Account:', this.state.account);
            console.debug(method + ": Get network id");
            const networkId = await web3.eth.net.getId(); // Ganache -> 5777, Rinkeby -> 4, BSC -> 97
            this.setState({ currentNetworkId: networkId });
            let isOk = await this.checkNetworkId(networkId);
            console.debug({ contractAddress, networkId });
            if (!isOk) {
                console.error(`Network id '${networkId}' is incorrect. The correct network is '${NetworkIdToUse}'`);
            } else {
                const abi = contractAbi.abi;
                const contract = new web3.eth.Contract(abi, contractAddress);
                this.setState({ contract });

                const tokenPrice = await this.getTokenPriceInETH(1);
                const ethPrice = 1 / tokenPrice;
                console.debug({ tokenPrice, ethPrice });
                this.setState({ tokenPrice, ethPrice });
            }
        } catch (err) {
            console.error({ method, err });
        }
    }

    getFirstAccount = async () => {
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        return accounts[0];
    }

    // Function to display the number of tokens a person has
    balanceOfWallet = async (message, wallet) => {
        try {
            console.debug({ message, wallet });
            const valueUINT = await this.state.contract.methods.balanceOf(wallet).call();
            const valueFloat = valueUINT / Math.pow(10, TokenDecimals);
            alert(valueFloat.toString() + " FDT");
        } catch (err) {
            console.error("balanceOfWallet", err);
            this.setState({ errorMessage: err.message });
        } finally {
            this.setState({ loading: false });
        }
    }

    eventCatchTokensBuyed() {
        let options = {
            address: [this.state.account],
            filter: {
                value: [],
            },
            fromBlock: 'latest'
        };
        let suscriptionTemp = this.state.contract.events.TokensBuyed(options)
            .on('data', event => {
                // Check if event already showed to user
                if (this.state.showedEvents.includes(event.id) === false) {
                    this.state.showedEvents.push(event.id);
                    console.debug("eventCatchTokensBuyed.data", event);
                    const amountReceive = parseInt(event.returnValues.amount) / Math.pow(10, TokenDecimals);
                    const walletReceive = event.returnValues.wallet;
                    alert(`Tokens comprados: ${amountReceive} FDT. Enviados a ${walletReceive}`);
                }
            })
            .on('changed', changed => console.debug("eventCatchTokensBuyed.changed", changed))
            .on('error', err => console.error("eventCatchTokensBuyed.error", err))
            .on('connected', str => console.debug("eventCatchTokensBuyed.connected", str));
        this.setState({ suscriptionTokensBuyed: suscriptionTemp });
    }

    eventCatchTokensReturned() {
        let options = {
            address: [this.state.account],
            filter: {
                value: [],
            },
            fromBlock: 'latest'
        };
        let suscriptionTemp = this.state.contract.events.TokensReturned(options)
            .on('data', event => {
                // Check if event already showed to user
                if (this.state.showedEvents.includes(event.id) === false) {
                    this.state.showedEvents.push(event.id);
                    console.debug("eventCatchTokensReturned.data", event);
                    const tokensSelledReceive = parseInt(event.returnValues.tokensSelled) / Math.pow(10, TokenDecimals);
                    const etherReturnedReceive = parseInt(event.returnValues.etherReturned) / Math.pow(10, 18);
                    const walletReceive = event.returnValues.wallet;
                    alert(`Tokens vendidos ${tokensSelledReceive} FDT por ${etherReturnedReceive} ETH y enviados a ${walletReceive}`);
                }
            })
            .on('changed', changed => console.debug("eventCatchTokensReturned.changed", changed))
            .on('error', err => console.error("eventCatchTokensReturned.error", err))
            .on('connected', str => console.debug("eventCatchTokensReturned.connected", str));
        this.setState({ suscriptionTokensReturned: suscriptionTemp });
    }

    // Function to make the purchase of tokens
    buyTokens = async (message, amountBN, ethersToSend) => {
        try {
            console.debug({ message, amountBN, ethersToSend });
            const account = await this.getFirstAccount();
            await this.state.contract.methods.buy(amountBN).send({ from: account, value: ethersToSend });
        } catch (err) {
            console.error("buyTokens", err);
            this.setState({ errorMessage: err.message });
        } finally {
            this.setState({ loading: false });
        }
    }

    sellTokens = async (message, amountBN) => {
        try {
            console.debug({ message, amountBN });
            const account = await this.getFirstAccount();
            await this.state.contract.methods.sell(amountBN).send({ from: account });
        } catch (err) {
            console.error("sellTokens", err);
            this.setState({ errorMessage: err.message });
        } finally {
            this.setState({ loading: false });
        }
    }

    getTokenPriceInETH = async (amount) => {
        const message = "Get token price in ETH...";
        let tokenPrice = undefined;
        try {
            console.debug({ message, amount });
            const amountToSend = new Web3.utils.BN(amount * 100); // 10 ** 2 (2 decimals)
            const tokenPriceWei = await this.state.contract.methods.tokenPrice(amountToSend).call();
            const tokenPriceEth = Web3.utils.fromWei(tokenPriceWei);
            tokenPrice = parseFloat(tokenPriceEth.toString());
            console.debug({ message, tokenPriceWei, tokenPriceEth, tokenPrice })
        } catch (err) {
            this.setState({ errorMessage: err.message })
        } finally {
            this.setState({ loading: false })
        }
        return tokenPrice;
    }

    convertFloatToTokensNoDecimals = (amount) => {
        const amountFloat = parseFloat(amount);
        const amountFixDecimals = amountFloat.toFixed(TokenDecimals);
        const amountWithoutDecimals = amountFixDecimals * Math.pow(10, TokenDecimals);
        return amountWithoutDecimals;
    }

    // Render de la DApp
    render() {
        return (
            <div>
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                    <a
                        className="navbar-brand col-sm-3 col-md-2 mr-0"
                        href="https://antonp.com"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        DApp Fumigación con drones
                    </a>

                    <ul className="navbar-nav px-3">
                        <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                            <small className="text-white"><span id="account">Cuenta activa: {this.state.account}</span></small>
                        </li>
                    </ul>

                </nav>
                <div className="container-fluid mt-5">
                    <div className="row">
                        <main role="main" className="col-lg-12 d-flex text-center">
                            <div className="content mr-auto ml-auto">

                                <h1>Tokens FDT (ERC-20)</h1>
                                <p><b>Contrato del token:</b> {contractAddress}</p>
                                <h2>Gestión, compra y venta de los tokens FDT</h2>
                                <a href="https://www.linkedin.com/in/antonpolenyaka/"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <p> </p>
                                    <img src={centralImage} width="530" height="298" alt="" />
                                </a>
                                <p></p>

                                <h3><Icon circular inverted color='red' name='dollar' /> Compra tokens FDT</h3>

                                <form className='txt-h-start' onSubmit={(event) => {
                                    event.preventDefault();
                                    const amountFloat = this.amountToBuy.value; // Value possible decimals
                                    const amountUINT = this.convertFloatToTokensNoDecimals(amountFloat);
                                    const amountBN = new Web3.utils.toBN(amountUINT);
                                    const priceInETH = amountUINT * this.state.tokenPrice / Math.pow(10, TokenDecimals);
                                    const ethersToPayGwei = priceInETH * Math.pow(10, 18);
                                    const message = "Token buy running....";
                                    this.buyTokens(message, amountBN, ethersToPayGwei);
                                }
                                }>
                                    <label><b>Precio de los tokens FDT:</b> {this.state.tokenPrice} ETH</label><br />

                                    <input type="text"
                                        className='form-control mb-1'
                                        placeholder="Cantidad de tokens FDT a comprar"
                                        ref={(input) => this.amountToBuy = input} />

                                    <input type="submit"
                                        className='bbtn btn-block btn-danger btn-sm'
                                        value='COMPRAR TOKENS' />
                                </form>
                                <p>&nbsp;</p>

                                <h3><Icon circular inverted color='violet' name='ethereum' /> Venta tokens FDT</h3>

                                <form className='txt-h-start' onSubmit={(event) => {
                                    event.preventDefault();
                                    const amountFloat = parseFloat(this.amountToSell.value); // Value possible decimals
                                    const amountUINT = this.convertFloatToTokensNoDecimals(amountFloat);
                                    const amountBN = new Web3.utils.toBN(amountUINT);
                                    const message = "Token sale running...";
                                    this.sellTokens(message, amountBN);
                                }
                                }>
                                    <label><b>Precio de las monedas ETH:</b> {this.state.ethPrice} FDT</label><br />

                                    <input type="text"
                                        className='form-control mb-1'
                                        placeholder="Cantidad de tokens FDT a vender"
                                        ref={(input) => this.amountToSell = input} />

                                    <input type="submit"
                                        className='bbtn btn-block btn-violet btn-sm'
                                        value='VENDER TOKENS' />
                                </form>

                                <h3><Icon circular inverted color='orange' name='suitcase' /> Balance de tokens FDT de un usuario</h3>

                                <form onSubmit={(event) => {
                                    event.preventDefault();
                                    const wallet = this.wallet.value;
                                    const message = "Token balance of wallet...";
                                    this.balanceOfWallet(message, wallet);
                                }
                                }>
                                    <input type="text"
                                        className='form-control mb-1'
                                        placeholder="Dirección wallet del usuario"
                                        ref={(input) => this.wallet = input} />

                                    <input type="submit"
                                        className='bbtn btn-block btn-warning btn-sm'
                                        value='BALANCE USUARIO' />
                                </form>
                                <p>
                                    &nbsp;
                                </p>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        )
    }
}

export default Tokens